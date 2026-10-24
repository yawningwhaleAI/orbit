import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { setSessionCookie } from "@/lib/auth";
import { consumeLoginToken, appUrl } from "@/lib/magic";

// Magic-link landing. Verifies a one-time token, creates/finds the user, sets
// the session cookie, and redirects into the app.
//   GET /api/auth/verify?token=<raw>

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token") || "";
  const result = await consumeLoginToken(token);

  if (!result) {
    return NextResponse.redirect(`${appUrl()}/login?error=expired`);
  }

  let user = await db.user.findUnique({ where: { email: result.email } });
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

  await setSessionCookie(user.id);

  const dest = user.isOperator ? "/dashboard" : user.onboarded ? "/home" : "/onboarding";
  return NextResponse.redirect(`${appUrl()}${dest}`);
}
