// Accepts "linkedin.com/in/name", "www.linkedin.com/in/name/", "https://in.linkedin.com/in/name?x=1"
// and returns "https://www.linkedin.com/in/name". Anything else -> null, so we
// only ever render links that point at a LinkedIn profile.
export function normalizeLinkedIn(v: unknown): string | null {
  const raw = String(v || "").trim();
  if (!raw) return null;
  const m = raw.match(/^(?:https?:\/\/)?(?:[a-z]{2,3}\.)?(?:www\.)?linkedin\.com\/in\/([A-Za-z0-9\-_%.]{2,100})\/?(?:[?#].*)?$/i);
  if (!m) return null;
  return `https://www.linkedin.com/in/${m[1]}`;
}
