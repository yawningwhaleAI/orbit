// ISO week key helpers, e.g. "2026-W42". Used to bucket weekly introductions.

export function isoWeekKey(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7; // Mon=0
  d.setUTCDate(d.getUTCDate() - dayNum + 3); // nearest Thursday
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
  const week =
    1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 24 * 3600 * 1000));
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

// Next Thursday 3:00pm local-ish (used as the proposed coffee slot in the demo).
export function nextThursday3pm(from = new Date()): Date {
  const d = new Date(from);
  const day = d.getDay(); // 0 Sun .. 4 Thu
  let add = (4 - day + 7) % 7;
  if (add === 0) add = 7; // always a future Thursday
  d.setDate(d.getDate() + add);
  d.setHours(15, 0, 0, 0);
  return d;
}
