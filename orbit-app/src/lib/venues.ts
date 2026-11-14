// Where coffees happen (Gurugram pilot). The proposer picks one per request.
export const VENUES = ["DLF cafeteria", "CDS 2nd floor", "CDS canteen"] as const;
export const DEFAULT_VENUE = VENUES[0];

export function parseVenue(v: unknown): string | null {
  const s = String(v || "");
  return (VENUES as readonly string[]).includes(s) ? s : null;
}
