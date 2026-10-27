import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appUrl } from "@/lib/magic";

// Building invite link (for QR flyers / shared links):
//   /join/<INVITE_CODE>  ->  sets the building, sends to sign-up
// The code maps to a building via InviteCode (seeded per building, e.g.
// DLF-TOWER). We stash the building id in a short-lived cookie that onboarding
// reads to pre-select the building.

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { code: string } }) {
  const code = (params.code || "").trim().toUpperCase();
  const invite = code
    ? await db.inviteCode.findUnique({ where: { code }, include: { building: true } })
    : null;

  const base = appUrl();
  if (!invite) {
    // Unknown code — just send them to sign up normally.
    return NextResponse.redirect(`${base}/login?mode=signup`);
  }

  const res = NextResponse.redirect(
    `${base}/login?mode=signup&b=${encodeURIComponent(invite.building.name)}`
  );
  res.cookies.set("orbit_join", invite.buildingId, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 1 day — long enough to finish sign-up
  });
  return res;
}
