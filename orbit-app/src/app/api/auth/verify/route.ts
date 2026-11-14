import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { setSessionCookie, authReady } from "@/lib/auth";
import { consumeLoginToken, appUrl, safeNext } from "@/lib/magic";

// Magic-link landing. Verifies a one-time token, creates/finds the user, sets
// the session cookie, and redirects into the app.
//   GET /api/auth/verify?token=<raw>

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Comma-separated list in env. "name@gmail.com" also covers "name+anything@gmail.com".
function isResetEmail(email: string): boolean {
  const list = (process.env.TEST_RESET_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const e = email.trim().toLowerCase();
  const base = e.replace(/\+[^@]*@/, "@");
  return list.includes(e) || list.includes(base);
}

export async function GET(req: NextRequest) {
  if (!authReady) {
    return NextResponse.redirect(`${appUrl()}/login?error=unavailable`);
  }
  const token = new URL(req.url).searchParams.get("token") || "";
  const result = await consumeLoginToken(token);

  if (!result) {
    return NextResponse.redirect(`${appUrl()}/login?error=expired`);
  }

  let user = await db.user.findUnique({ where: { email: result.email } });
  // Test accounts (TEST_RESET_EMAILS) start from scratch on every sign-in so the
  // full sign-up flow can be re-run. Deleting the user cascades to their tags,
  // free times, intros and coffees.
  if (user && isResetEmail(result.email)) {
    await db.user.delete({ where: { id: user.id } });
    user = null;
  }
  if (!user) {
    user = await db.user.create({
      data: {
        email: result.email,
        name: result.name || result.email.split("@")[0],
        avatarSeed: (result.name || result.email)[0]?.toUpperCase(),
        onboarded: false,
      },
    });
  }

  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await setSessionCookie(user.id);

  const next = safeNext(new URL(req.url).searchParams.get("next"));
  const dest = user.isOperator ? "/dashboard" : !user.onboarded ? "/onboarding" : next ?? "/home";
  return NextResponse.redirect(`${appUrl()}${dest}`);
}
