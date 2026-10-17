import { NextRequest, NextResponse } from "next/server";
import { chatDetailed } from "@/lib/llm";

// Protected diagnostic for the AI layer (resume parsing uses the same path).
//   GET /api/admin/llm-check?secret=<CRON_SECRET>
// Returns which providers are configured and the exact upstream result/error,
// so a failing "Couldn't parse the resume" can be diagnosed without log access.

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

  const gkey = process.env.GEMINI_API_KEY?.trim() || "";
  const key = process.env.OPENROUTER_API_KEY?.trim() || "";
  const config = {
    gemini_key_present: !!gkey,
    gemini_key_length: gkey.length,
    gemini_model: process.env.GEMINI_MODEL?.trim() || "(default) gemini-3.8-flash",
    openrouter_key_present: !!key,
    openrouter_key_length: key.length,
    openrouter_model: process.env.OPENROUTER_MODEL?.trim() || "(default) meta-llama/llama-3.3-70b-instruct:free",
    openrouter_fallback_model:
      process.env.OPENROUTER_FALLBACK_MODEL?.trim() || "(default) mistralai/mistral-7b-instruct:free",
    anthropic_key_present: !!(process.env.ANTHROPIC_API_KEY?.trim()),
  };

  const result = await chatDetailed('Reply with exactly this JSON: {"ok":true}', {
    system: "You are a test probe. Return only JSON.",
    maxTokens: 20,
    temperature: 0,
    json: true,
  });

  return NextResponse.json({
    ok: !!result.text,
    config,
    sample: result.text ?? null,
    error: result.error ?? null,
  });
}

export const GET = handle;
export const POST = handle;
