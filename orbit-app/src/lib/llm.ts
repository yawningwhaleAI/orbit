// Single LLM entry point used across the app (match reasons, resume parsing).
//
// Provider order: OpenRouter (if OPENROUTER_API_KEY) -> Anthropic (if
// ANTHROPIC_API_KEY) -> null (callers fall back to templates/manual input).
// Plain fetch, no SDK, so every provider is optional.

export function llmEnabled(): boolean {
  return !!(process.env.OPENROUTER_API_KEY || process.env.ANTHROPIC_API_KEY);
}

export interface ChatOptions {
  system?: string;
  maxTokens?: number;
  temperature?: number;
}

export async function chat(prompt: string, opts: ChatOptions = {}): Promise<string | null> {
  const maxTokens = opts.maxTokens ?? 300;
  if (process.env.OPENROUTER_API_KEY) {
    const out = await openRouter(prompt, maxTokens, opts);
    if (out) return out;
  }
  if (process.env.ANTHROPIC_API_KEY) {
    const out = await anthropic(prompt, maxTokens, opts);
    if (out) return out;
  }
  return null;
}

async function openRouter(prompt: string, maxTokens: number, opts: ChatOptions): Promise<string | null> {
  const model = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free";
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.APP_URL || "https://orbit.app",
        "X-Title": "Orbit",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature: opts.temperature ?? 0.5,
        messages: [
          ...(opts.system ? [{ role: "system", content: opts.system }] : []),
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!res.ok) {
      console.warn("[llm] OpenRouter error", res.status, await res.text());
      return null;
    }
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return json.choices?.[0]?.message?.content?.trim() || null;
  } catch (e) {
    console.warn("[llm] OpenRouter request failed:", e);
    return null;
  }
}

async function anthropic(prompt: string, maxTokens: number, opts: ChatOptions): Promise<string | null> {
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY as string,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        ...(opts.system ? { system: opts.system } : {}),
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) {
      console.warn("[llm] Anthropic error", res.status, await res.text());
      return null;
    }
    const json = (await res.json()) as { content: { type: string; text: string }[] };
    return json.content?.find((c) => c.type === "text")?.text?.trim() || null;
  } catch (e) {
    console.warn("[llm] Anthropic request failed:", e);
    return null;
  }
}
