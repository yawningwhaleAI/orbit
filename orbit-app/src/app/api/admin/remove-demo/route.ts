import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateForBuilding } from "@/lib/matching";

// Removes demo members (placeholder @example.com accounts) so only real people
// remain. Placeholders that stand in for real people without a real-email copy
// yet are kept (KEEP_NAMES). Dry run unless ?confirm=1:
//   POST /api/admin/remove-demo            -> lists who would be removed
//   POST /api/admin/remove-demo?confirm=1  -> removes them, then tops up intros

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const KEEP_NAMES = ["Aryan Singh", "Pragya Rathi"];

export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  const provided = (req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "").trim();
  if (!secret || provided !== secret) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const confirm = new URL(req.url).searchParams.get("confirm") === "1";

  const placeholders = await db.user.findMany({
    where: { email: { endsWith: "@example.com" } },
    select: { id: true, name: true, email: true },
  });
  const realNames = new Set(
    (
      await db.user.findMany({
        where: { NOT: { email: { endsWith: "@example.com" } } },
        select: { name: true },
      })
    ).map((u) => u.name)
  );
  // Remove a placeholder unless it's a real person who has no real-email copy yet.
  const remove = placeholders.filter((u) => !KEEP_NAMES.includes(u.name) || realNames.has(u.name));
  const kept = placeholders.filter((u) => !remove.includes(u));

  if (!confirm) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      wouldRemove: remove.map((u) => `${u.name} <${u.email}>`),
      keptPlaceholders: kept.map((u) => u.name),
      next: "Re-run with ?confirm=1 to remove them.",
    });
  }

  try {
    await db.user.deleteMany({ where: { id: { in: remove.map((u) => u.id) } } });
    let intros = 0;
    for (const b of await db.building.findMany({ select: { id: true } })) {
      intros += (await generateForBuilding(b.id)).matchesCreated;
    }
    return NextResponse.json({ ok: true, removed: remove.length, keptPlaceholders: kept.map((u) => u.name), intros });
  } catch (e) {
    console.error("[admin/remove-demo]", e);
    return NextResponse.json({ ok: false, error: "remove_failed" }, { status: 500 });
  }
}
