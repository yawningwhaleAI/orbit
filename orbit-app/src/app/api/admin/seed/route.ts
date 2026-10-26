import { NextRequest, NextResponse } from "next/server";
import { seedDemo } from "@/lib/seed";

// Demo-data loader for production. Secret goes in the Authorization header
// (never a query param, which leaks into logs):
//   curl -X POST -H "Authorization: Bearer $CRON_SECRET" \
//        https://<host>/api/admin/seed            # seed if DB empty
//   curl -X POST -H "Authorization: Bearer $CRON_SECRET" \
//        "https://<host>/api/admin/seed?force=1"  # wipe + reseed
// Safe by default: won't touch an already-populated DB unless force=1.

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

async function handle(req: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  const url = new URL(req.url);
  // Secret only via Authorization header (never a query param, which leaks into
  // server logs and browser history).
  const provided = (req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "").trim();

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
