// Generates the one-line "why you two" for an introduction. Uses the
// Anthropic Claude API when ANTHROPIC_API_KEY is set; otherwise composes a
// warm, specific sentence from the overlapping give/want tags. No SDK
// dependency — plain fetch keeps it optional.

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

export interface WhyInput {
  ownerName: string;
  ownerGives: string[];
  ownerWants: string[];
  otherName: string;
  otherRole?: string | null;
  otherCompany?: string | null;
  otherFloor?: number | null;
  otherGives: string[];
  otherWants: string[];
  matchedOtherGiveToOwnerWant: string[]; // what other can give that owner wants
  matchedOwnerGiveToOtherWant: string[]; // what owner can give that other wants
}

export function aiEnabled(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

export async function whyYouTwo(input: WhyInput): Promise<string> {
  const ai = await whyYouTwoLLM(input);
  if (ai) return ai;
  return whyYouTwoTemplate(input);
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}

export function whyYouTwoTemplate(input: WhyInput): string {
  const other = firstName(input.otherName);
  const theyGive = input.matchedOtherGiveToOwnerWant[0];
  const youGive = input.matchedOwnerGiveToOtherWant[0];
  const where =
    typeof input.otherFloor === "number"
      ? `on the ${ordinal(input.otherFloor)} floor`
      : "in your building";

  if (theyGive && youGive) {
    return `${other} can help with ${theyGive.toLowerCase()}, and you're a strong source of ${youGive.toLowerCase()}. A genuinely two-way coffee, ${where}.`;
  }
  if (theyGive) {
    return `You're looking for ${theyGive.toLowerCase()}, and that's exactly what ${other} offers. They're ${where} and happy to trade notes.`;
  }
  if (youGive) {
    return `${other} is after ${youGive.toLowerCase()}, which is right in your wheelhouse. Worth 15 minutes, ${where}.`;
  }
  const role = input.otherRole ? `${input.otherRole}` : "someone worth knowing";
  return `${other} is a ${role} ${where}. Your interests line up well. Worth a quick coffee.`;
}

async function whyYouTwoLLM(input: WhyInput): Promise<string | null> {
  if (!aiEnabled()) return null;
  const prompt = buildPrompt(input);
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY as string,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 120,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) {
      console.warn("[ai] Anthropic error", res.status, await res.text());
      return null;
    }
    const json = (await res.json()) as { content: { type: string; text: string }[] };
    const text = json.content?.find((c) => c.type === "text")?.text?.trim();
    return text ? stripQuotes(text) : null;
  } catch (e) {
    console.warn("[ai] request failed, using template:", e);
    return null;
  }
}

function buildPrompt(i: WhyInput): string {
  return [
    "You write the single-sentence reason two colleagues in the same building should have a 15-minute coffee.",
    "Voice: warm, concrete, confident, no corporate filler, no em dashes. One sentence, under 30 words.",
    "Use the other person's first name. Make the specific exchange obvious.",
    "",
    `Recipient can give: ${i.ownerGives.join(", ") || "n/a"}`,
    `Recipient wants: ${i.ownerWants.join(", ") || "n/a"}`,
    `Other person: ${i.otherName}${i.otherRole ? ", " + i.otherRole : ""}${i.otherCompany ? " at " + i.otherCompany : ""}${typeof i.otherFloor === "number" ? ", floor " + i.otherFloor : ""}`,
    `Other can give: ${i.otherGives.join(", ") || "n/a"}`,
    `Other wants: ${i.otherWants.join(", ") || "n/a"}`,
    `They can give the recipient: ${i.matchedOtherGiveToOwnerWant.join(", ") || "n/a"}`,
    `The recipient can give them: ${i.matchedOwnerGiveToOtherWant.join(", ") || "n/a"}`,
    "",
    "Return only the sentence.",
  ].join("\n");
}

function stripQuotes(s: string): string {
  return s.replace(/^["'\s]+|["'\s]+$/g, "");
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
