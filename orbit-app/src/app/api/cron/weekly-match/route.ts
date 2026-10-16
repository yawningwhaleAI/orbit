import { NextRequest, NextResponse } from "next/server";
import { generateForAllBuildings } from "@/lib/matching";

// Weekly matching job. Trigger from Vercel Cron (configured in vercel.json)
// or any scheduler. Protected by CRON_SECRET.
//
//   POST /api/cron/weekly-match
//   Authorization: Bearer <CRON_SECRET>
//
// Vercel Cron sends the Authorization header automatically when CRON_SECRET
// is set as an environment variable.

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function handle(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    const url = new URL(req.url);
    const qp = url.searchParams.get("secret");
    if (auth !== `Bearer ${secret}` && qp !== secret) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const results = await generateForAllBuildings();
  const total = results.reduce((a, r) => a + r.matchesCreated, 0);
  return NextResponse.json({ ok: true, total, results });
}

export const GET = handle;
export const POST = handle;
