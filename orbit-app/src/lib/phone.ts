// Normalise to "+<countrycode><number>". Bare 10-digit numbers are treated as
// Indian (+91). Returns null if it doesn't look like a phone number.
export function normalizePhone(v: unknown): string | null {
  const raw = String(v || "").trim();
  if (!raw) return null;
  let d = raw.replace(/[^\d+]/g, "");
  if (d.startsWith("00")) d = "+" + d.slice(2);
  if (!d.startsWith("+")) {
    const digits = d.replace(/\D/g, "");
    if (digits.length === 10) d = "+91" + digits;
    else if (digits.length === 12 && digits.startsWith("91")) d = "+" + digits;
    else return null;
  }
  const digits = d.slice(1).replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) return null;
  return "+" + digits;
}

export function whatsappUrl(phone: string): string {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}
