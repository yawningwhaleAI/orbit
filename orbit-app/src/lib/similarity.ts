// Similarity helpers used by the matching engine. Works with or without
// embeddings: when vectors are present we use cosine; otherwise we fall back
// to a lexical + complementary-tag score that is good enough at pilot scale.

export function cosine(a: number[], b: number[]): number {
  if (!a?.length || !b?.length || a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

const STOP = new Set([
  "a", "an", "the", "and", "or", "to", "of", "for", "in", "on", "with",
  "my", "i", "we", "help", "advice", "intros", "intro",
]);

export function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP.has(w))
  );
}

export function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

// Hand-built bridges: a "give" concept on the left satisfies the "want"
// concepts on the right (and vice-versa). Raises quality of fallback matches.
const COMPLEMENTS: Array<[string[], string[]]> = [
  [["fundraising", "angel", "investor", "investors"], ["fundraising", "angel", "investors", "investor"]],
  [["design", "figma", "ux", "ui"], ["design", "product", "designer"]],
  [["technical", "engineering", "architecture", "backend", "systems"], ["technical", "cofounder", "co-founder", "engineering", "hiring"]],
  [["gtm", "go-to-market", "sales", "growth", "marketing"], ["gtm", "growth", "marketing", "customers", "partnerships"]],
  [["hiring", "recruiting"], ["hiring", "cofounder", "co-founder"]],
  [["customer", "customers", "bd", "partnerships"], ["customers", "first", "partnerships", "sales"]],
  [["mentor", "mentorship", "scaling", "operations"], ["mentor", "advice", "scaling"]],
  [["legal", "compliance"], ["legal"]],
  [["finance", "accounting"], ["finance"]],
  [["product", "strategy"], ["product", "feedback", "advice"]],
];

function complementScore(giveTokens: Set<string>, wantTokens: Set<string>): number {
  let hits = 0;
  for (const [gives, wants] of COMPLEMENTS) {
    const g = gives.some((t) => giveTokens.has(t));
    const w = wants.some((t) => wantTokens.has(t));
    if (g && w) hits++;
  }
  return Math.min(1, hits * 0.5);
}

// How well A's "give" satisfies B's "want" (0..1), lexical fallback.
export function lexicalGiveWant(giveText: string, wantText: string): number {
  const g = tokenize(giveText);
  const w = tokenize(wantText);
  const direct = jaccard(g, w);
  const complement = complementScore(g, w);
  return Math.min(1, 0.6 * complement + 0.7 * direct);
}
