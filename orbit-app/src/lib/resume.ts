// Resume parsing: extract text from an uploaded PDF, then use the LLM to pull
// structured profile data. We keep only the extracted fields — the file itself
// is never stored.

import { extractText, getDocumentProxy } from "unpdf";
import mammoth from "mammoth";
import { chat, llmEnabled } from "./llm";
import { GIVE_SUGGESTIONS, WANT_SUGGESTIONS } from "./tags";

export interface ParsedResume {
  role?: string;
  company?: string;
  education?: string;
  seniority?: string;
  bio?: string;
  gives: string[];
  wants: string[];
}

const SENIORITY = ["junior", "mid", "senior", "founder", "investor"];

export async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  return (Array.isArray(text) ? text.join("\n") : text || "").trim();
}

export async function extractDocxText(buffer: ArrayBuffer): Promise<string> {
  const { value } = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
  return (value || "").trim();
}

// Extract text from a PDF or DOCX resume based on file name / mime type.
export async function extractResumeText(
  buffer: ArrayBuffer,
  fileName: string,
  mime: string
): Promise<string> {
  const isDocx =
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileName.toLowerCase().endsWith(".docx");
  return isDocx ? extractDocxText(buffer) : extractPdfText(buffer);
}

export function resumeParsingEnabled(): boolean {
  return llmEnabled();
}

export async function parseResume(text: string): Promise<ParsedResume | null> {
  if (!llmEnabled() || !text) return null;

  const system =
    "You extract structured profile data from a resume for a professional networking app that introduces people for coffee. Return ONLY valid minified JSON, no prose, no code fences.";

  const prompt = [
    "From the resume below, produce JSON with these keys:",
    '- role: their current job title (string)',
    '- company: their current employer (string)',
    '- education: most notable institution (string)',
    `- seniority: one of ${SENIORITY.join(", ")}`,
    '- bio: one warm, specific sentence about what they do now',
    `- gives: array of 2-4 things they can offer others. Prefer these labels where they fit: ${GIVE_SUGGESTIONS.join(", ")}`,
    `- wants: array of 2-3 things they likely want. Prefer these labels where they fit: ${WANT_SUGGESTIONS.join(", ")}`,
    "",
    "Resume:",
    '"""',
    text.slice(0, 9000),
    '"""',
    "",
    "Return only the JSON object.",
  ].join("\n");

  const raw = await chat(prompt, { system, maxTokens: 600, temperature: 0.2 });
  if (!raw) return null;

  const json = extractJson(raw);
  if (!json) return null;

  return normalize(json);
}

function extractJson(s: string): any | null {
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return null;
  try {
    return JSON.parse(s.slice(start, end + 1));
  } catch {
    return null;
  }
}

function asStringArray(v: unknown, max: number): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x) => typeof x === "string")
    .map((x) => (x as string).trim())
    .filter(Boolean)
    .slice(0, max);
}

function normalize(j: any): ParsedResume {
  const seniority =
    typeof j.seniority === "string" && SENIORITY.includes(j.seniority.toLowerCase())
      ? j.seniority.toLowerCase()
      : undefined;
  return {
    role: typeof j.role === "string" ? j.role.trim().slice(0, 80) : undefined,
    company: typeof j.company === "string" ? j.company.trim().slice(0, 80) : undefined,
    education: typeof j.education === "string" ? j.education.trim().slice(0, 80) : undefined,
    seniority,
    bio: typeof j.bio === "string" ? j.bio.trim().slice(0, 200) : undefined,
    gives: asStringArray(j.gives, 4),
    wants: asStringArray(j.wants, 3),
  };
}
