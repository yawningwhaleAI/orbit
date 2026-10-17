import { NextRequest, NextResponse } from "next/server";

// Lists OpenRouter models that are currently FREE (prompt + completion priced
// at 0), so we can pick a live free slug for OPENROUTER_MODEL without guessing.
//   GET /api/admin/or-models?secret=<CRON_SECRET>
// Protected by CRON_SECRET.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

async function handle(req: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  const url = new URL(req.url);
  const provided =
    (req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      url.searchParams.get("secret") ||
      "").trim();
  if (!secret || provided !== secret) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const key = process.env.OPENROUTER_API_KEY?.trim();
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers: key ? { Authorization: `Bearer ${key}` } : {},
    });
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: `${res.status} ${(await res.text()).slice(0, 200)}` });
    }
    const json = (await res.json()) as {
      data?: { id: string; name?: string; pricing?: { prompt?: string; completion?: string } }[];
    };
    const free = (json.data || [])
      .filter((m) => {
        const p = parseFloat(m.pricing?.prompt || "0");
        const c = parseFloat(m.pricing?.completion || "0");
        return p === 0 && c === 0;
      })
      .map((m) => ({ id: m.id, name: m.name }))
      .sort((a, b) => a.id.localeCompare(b.id));

    return NextResponse.json({ ok: true, count: free.length, free });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) });
  }
}

export const GET = handle;
export const POST = handle;
