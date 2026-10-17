import { NextRequest, NextResponse } from "next/server";
import { seedDemo } from "@/lib/seed";

// One-click demo-data loader for production.
//   GET/POST /api/admin/seed?secret=<CRON_SECRET>         -> seed if DB empty
//   GET/POST /api/admin/seed?secret=<CRON_SECRET>&force=1 -> wipe + reseed
// Protected by CRON_SECRET. Safe by default: won't touch an already-populated DB.

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

async function handle(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const url = new URL(req.url);
  const provided =
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    url.searchParams.get("secret");

  if (!secret || provided !== secret) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const force = url.searchParams.get("force") === "1";
    const result = await seedDemo({ force });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error("[admin/seed]", e);
    return NextResponse.json({ ok: false, error: "seed_failed" }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
