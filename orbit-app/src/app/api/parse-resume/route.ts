import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { extractPdfText, parseResume, resumeParsingEnabled } from "@/lib/resume";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 6 * 1024 * 1024; // 6 MB

export async function POST(req: NextRequest) {
  // Must be signed in (onboarding).
  const uid = await getSessionUserId();
  if (!uid) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  if (!resumeParsingEnabled()) {
    return NextResponse.json({
      ok: false,
      error: "ai_not_configured",
      message: "Resume autofill needs an OPENROUTER_API_KEY. Fill the form manually for now.",
    });
  }

  let file: File | null = null;
  try {
    const form = await req.formData();
    const f = form.get("file");
    if (f instanceof File) file = f;
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  if (!file) return NextResponse.json({ ok: false, error: "no_file" }, { status: 400 });
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ ok: false, error: "not_pdf", message: "Please upload a PDF." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "too_large", message: "PDF is too large (max 6 MB)." }, { status: 400 });
  }

  try {
    const buffer = await file.arrayBuffer();
    const text = await extractPdfText(buffer);
    if (!text || text.length < 40) {
      return NextResponse.json({
        ok: false,
        error: "no_text",
        message: "Couldn't read text from that PDF. Fill the form manually.",
      });
    }
    const data = await parseResume(text);
    if (!data) {
      return NextResponse.json({ ok: false, error: "parse_failed", message: "Couldn't parse the resume. Fill the form manually." });
    }
    // We intentionally do NOT store the file — only the extracted data is
    // returned to prefill the form, then saved on submit.
    return NextResponse.json({ ok: true, data });
  } catch (e) {
    console.error("[parse-resume]", e);
    return NextResponse.json({ ok: false, error: "server_error", message: "Something went wrong reading that file." }, { status: 500 });
  }
}
