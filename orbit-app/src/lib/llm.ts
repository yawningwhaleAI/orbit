// Single LLM entry point used across the app (match reasons, resume parsing).
//
// Provider order: OpenRouter (if OPENROUTER_API_KEY) -> Anthropic (if
// ANTHROPIC_API_KEY) -> null (callers fall back to templates/manual input).
// Plain fetch, no SDK, so every provider is optional.

// Trim env values defensively — pasted secrets often carry a trailing newline
// or space, which breaks HTTP Authorization headers.
function env(key: string): string | undefined {
  const v = process.env[key];
  return v ? v.trim() : undefined;
}

export function llmEnabled(): boolean {
  return !!(env("GEMINI_API_KEY") || env("OPENROUTER_API_KEY") || env("ANTHROPIC_API_KEY"));
}

export interface ChatOptions {
  system?: string;
  maxTokens?: number;
  temperature?: number;
  json?: boolean; // ask the provider for a JSON object response
}

export interface ChatResult {
  text: string | null;
  // A short, safe diagnostic when the call failed (for logs / admin check).
  error?: string;
}

export async function chat(prompt: string, opts: ChatOptions = {}): Promise<string | null> {
  return (await chatDetailed(prompt, opts)).text;
}

// Like chat(), but returns why it failed. Used by the admin diagnostic route.
export async function chatDetailed(prompt: string, opts: ChatOptions = {}): Promise<ChatResult> {
  const maxTokens = opts.maxTokens ?? 300;
  const errors: string[] = [];

  // Google Gemini first — its free tier is the most reliable (no data-policy
  // block, generous limits). Try the configured model, then "-latest" aliases
  // so a renamed model (Google rotates these) doesn't break us.
  if (env("GEMINI_API_KEY")) {
    const gModels = [
      env("GEMINI_MODEL") || "gemini-3.8-flash",
      "gemini-flash-latest",
      "gemini-2.5-flash",
    ].filter((m, i, a) => m && a.indexOf(m) === i);
    for (const model of gModels) {
      const r = await gemini(prompt, maxTokens, opts, model);
      if (r.text) return { text: r.text };
      if (r.error) errors.push(`Gemini[${model}]: ${r.error}`);
    }
  }

  if (env("OPENROUTER_API_KEY")) {
    // Try the configured model, then an optional fallback. Free models are
    // frequently rate-limited or blocked by data policy, so a fallback helps.
    const models = [
      env("OPENROUTER_MODEL") || "meta-llama/llama-3.3-70b-instruct:free",
      env("OPENROUTER_FALLBACK_MODEL") || "mistralai/mistral-7b-instruct:free",
    ].filter((m, i, a) => m && a.indexOf(m) === i);

    for (const model of models) {
      const r = await openRouter(prompt, maxTokens, opts, model);
      if (r.text) return { text: r.text };
      if (r.error) errors.push(`OpenRouter[${model}]: ${r.error}`);
    }
  }

  if (env("ANTHROPIC_API_KEY")) {
    const r = await anthropic(prompt, maxTokens, opts);
    if (r.text) return { text: r.text };
    if (r.error) errors.push(`Anthropic: ${r.error}`);
  }

  if (errors.length === 0) errors.push("No LLM provider configured (set OPENROUTER_API_KEY).");
  return { text: null, error: errors.join(" | ") };
}

async function openRouter(
  prompt: string,
  maxTokens: number,
  opts: ChatOptions,
  model: string
): Promise<ChatResult> {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env("OPENROUTER_API_KEY")}`,
        "HTTP-Referer": env("APP_URL") || "https://withinorbit.space",
        "X-Title": "Orbit",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature: opts.temperature ?? 0.5,
        // Note: free OpenRouter models often reject response_format, so we rely
        // on the prompt + extractJson() instead of forcing structured output.
        messages: [
          ...(opts.system ? [{ role: "system", content: opts.system }] : []),
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!res.ok) {
      const body = (await res.text()).slice(0, 300);
      console.warn("[llm] OpenRouter error", res.status, body);
      return { text: null, error: `${res.status} ${body}` };
    }
    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
      error?: { message?: string };
    };
    const content = json.choices?.[0]?.message?.content?.trim();
    if (!content) {
      // OpenRouter sometimes returns 200 with an error body (esp. free models).
      return { text: null, error: json.error?.message || "empty response" };
    }
    return { text: content };
  } catch (e) {
    console.warn("[llm] OpenRouter request failed:", e);
    return { text: null, error: String(e) };
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function gemini(
  prompt: string,
  maxTokens: number,
  opts: ChatOptions,
  model: string
): Promise<ChatResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  // Gemini free tier returns 503/429 under load — retry with backoff so a brief
  // spike doesn't fail the user's request.
  const delays = [0, 800, 2000];
  let lastErr = "";
  for (const delay of delays) {
    if (delay) await sleep(delay);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Key in a header, not the URL, so it stays out of logs/proxies.
          "x-goog-api-key": env("GEMINI_API_KEY") as string,
        },
        body: JSON.stringify({
          ...(opts.system ? { systemInstruction: { parts: [{ text: opts.system }] } } : {}),
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: maxTokens,
            temperature: opts.temperature ?? 0.5,
            ...(opts.json ? { responseMimeType: "application/json" } : {}),
          },
        }),
      });
      if (!res.ok) {
        const body = (await res.text()).slice(0, 300);
        console.warn("[llm] Gemini error", res.status, body);
        lastErr = `${res.status} ${body}`;
        // 503 = momentary overload (retry). 429 = quota exhausted, which won't
        // recover in seconds, so fail fast instead of burning more quota.
        if (res.status === 503) continue;
        return { text: null, error: lastErr };
      }
      const json = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
        error?: { message?: string };
      };
      const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("").trim();
      if (!text) {
        lastErr = json.error?.message || "empty response";
        continue;
      }
      return { text };
    } catch (e) {
      console.warn("[llm] Gemini request failed:", e);
      lastErr = String(e);
    }
  }
  return { text: null, error: lastErr || "unavailable" };
}

async function anthropic(prompt: string, maxTokens: number, opts: ChatOptions): Promise<ChatResult> {
  const model = env("ANTHROPIC_MODEL") || "claude-sonnet-5";
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env("ANTHROPIC_API_KEY") as string,
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
      const body = (await res.text()).slice(0, 300);
      console.warn("[llm] Anthropic error", res.status, body);
      return { text: null, error: `${res.status} ${body}` };
    }
    const json = (await res.json()) as { content: { type: string; text: string }[] };
    return { text: json.content?.find((c) => c.type === "text")?.text?.trim() || null };
  } catch (e) {
    console.warn("[llm] Anthropic request failed:", e);
    return { text: null, error: String(e) };
  }
}
