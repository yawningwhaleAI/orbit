import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addMembers } from "@/lib/seed";

// Adds members without touching anyone else (unlike /api/admin/seed?force=1).
//   curl -X POST -H "Authorization: Bearer $CRON_SECRET" \
//        https://<host>/api/admin/add-members            # built-in list
//   curl -X POST -H "Authorization: Bearer $CRON_SECRET" -H "Content-Type: application/json" \
//        -d '{"building":"DLF Tower","members":[{...}]}' https://<host>/api/admin/add-members

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const Member = z.object({
  email: z.string().email().max(200),
  name: z.string().min(1).max(120),
  role: z.string().max(160),
  company: z.string().max(160),
  floor: z.number().int().min(0).max(200).optional(),
  seniority: z.enum(["junior", "mid", "senior", "founder", "investor"]),
  education: z.string().max(200),
  bio: z.string().max(600),
  gives: z.array(z.string().max(80)).max(12),
  wants: z.array(z.string().max(80)).max(12),
});
const Body = z.object({ building: z.string().max(120).optional(), members: z.array(Member).max(50) });

export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  const provided = (req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "").trim();
  if (!secret || provided !== secret) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  try {
    const raw = await req.text();
    if (!raw.trim()) return NextResponse.json({ ok: true, ...(await addMembers()) });
    const parsed = Body.safeParse(JSON.parse(raw));
    if (!parsed.success) return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
    return NextResponse.json({ ok: true, ...(await addMembers(parsed.data.members, parsed.data.building)) });
  } catch (e) {
    console.error("[admin/add-members]", e);
    return NextResponse.json({ ok: false, error: "add_failed" }, { status: 500 });
  }
}
