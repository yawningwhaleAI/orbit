// Proposed coffee time slots. Generates a tidy set of upcoming weekday slots.
// When Google Calendar OAuth is added later, swap `generateSlots` for a
// free/busy intersection of both members' calendars — the UI stays the same.

export interface Slot {
  iso: string; // ISO datetime
  label: string; // e.g. "Thu 17 Oct · 3:00 PM"
}

// All slot logic is in India Standard Time (UTC+5:30, no DST) so it renders the
// same on a UTC server and in every member's browser.
export const IST = "Asia/Kolkata";
const IST_OFFSET_MS = 330 * 60000;
export const SLOT_TIMES = ["10:30", "12:00", "15:00", "16:30"] as const;
export const WEEKDAYS = [
  { n: 1, label: "Mon" },
  { n: 2, label: "Tue" },
  { n: 3, label: "Wed" },
  { n: 4, label: "Thu" },
  { n: 5, label: "Fri" },
];

export function slotKey(weekday: number, time: string): string {
  return `${weekday}-${time}`;
}

// Weekday (0=Sun) and "HH:MM" of an instant, in IST.
export function istParts(d: Date): { weekday: number; time: string } {
  const t = new Date(d.getTime() + IST_OFFSET_MS);
  const hh = String(t.getUTCHours()).padStart(2, "0");
  const mm = String(t.getUTCMinutes()).padStart(2, "0");
  return { weekday: t.getUTCDay(), time: `${hh}:${mm}` };
}

// Upcoming weekday slots, starting tomorrow (IST).
export function generateSlots(from = new Date(), count = 8): Slot[] {
  const slots: Slot[] = [];
  const today = new Date(from.getTime() + IST_OFFSET_MS);
  for (let i = 1; slots.length < count && i < 60; i++) {
    const dayStart = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + i);
    const weekday = new Date(dayStart).getUTCDay();
    if (weekday === 0 || weekday === 6) continue;
    for (const t of SLOT_TIMES) {
      if (slots.length >= count) break;
      const [h, m] = t.split(":").map(Number);
      const d = new Date(dayStart + (h * 60 + m) * 60000 - IST_OFFSET_MS);
      if (d.getTime() > from.getTime()) slots.push({ iso: d.toISOString(), label: formatSlot(d) });
    }
  }
  return slots;
}

export function formatSlot(d: Date): string {
  const date = d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: IST,
  });
  const time = d.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: IST,
  });
  return `${date} · ${time}`;
}

// A Google Calendar "add event" link — works without any OAuth. Opens a
// prefilled event the user saves with one click.
export function googleCalendarUrl(opts: {
  title: string;
  start: Date;
  minutes: number;
  details: string;
  location: string;
}): string {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const end = new Date(opts.start.getTime() + opts.minutes * 60000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    dates: `${fmt(opts.start)}/${fmt(end)}`,
    details: opts.details,
    location: opts.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
