// Optional embeddings layer. If OPENAI_API_KEY is set we embed give/want
// text; otherwise we return null and the matching engine falls back to the
// lexical scorer. No SDK dependency — we call the REST API with fetch so the
// app stays lean and the dependency is truly optional.

const MODEL = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";

function key(): string | undefined {
  return process.env.OPENAI_API_KEY?.trim() || undefined;
}

export function embeddingsEnabled(): boolean {
  return !!key();
}

export async function embed(texts: string[]): Promise<number[][] | null> {
  if (!embeddingsEnabled()) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key()}`,
      },
      body: JSON.stringify({ model: MODEL, input: texts }),
    });
    if (!res.ok) {
      console.warn("[embeddings] API error", res.status, await res.text());
      return null;
    }
    const json = (await res.json()) as { data: { embedding: number[] }[] };
    return json.data.map((d) => d.embedding);
  } catch (e) {
    console.warn("[embeddings] request failed, using fallback:", e);
    return null;
  }
}

export function serializeVec(vec: number[] | null | undefined): string | null {
  return vec ? JSON.stringify(vec) : null;
}

export function parseVec(s: string | null | undefined): number[] | null {
  if (!s) return null;
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? (v as number[]) : null;
  } catch {
    return null;
  }
}
