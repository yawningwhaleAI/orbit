// Proposed coffee time slots. Generates a tidy set of upcoming weekday slots.
// When Google Calendar OAuth is added later, swap `generateSlots` for a
// free/busy intersection of both members' calendars — the UI stays the same.

export interface Slot {
  iso: string; // ISO datetime (start)
  label: string; // e.g. "Thu 17 Oct · 3:00 pm"
  day: string; // e.g. "Thu, 17 Oct"
  time: string; // e.g. "3:00 pm"
  both?: boolean; // also inside the chooser's own free times
}

// All slot logic is in India Standard Time (UTC+5:30, no DST) so it renders the
// same on a UTC server and in every member's browser.
export const IST = "Asia/Kolkata";
const IST_OFFSET_MS = 330 * 60000;
const HOUR_MS = 3600000;
export const DURATIONS = [30, 60] as const;
export const DEFAULT_DURATION = 30;
// Free times are chosen in one-hour blocks: "10:00" means free 10:00-11:00.
export const SLOT_TIMES = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"] as const;
export const DAY_START_H = 10;
export const DAY_END_H = 18;
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

export function parseDuration(v: unknown): number {
  return Number(v) === 60 ? 60 : DEFAULT_DURATION;
}

// Weekday (0=Sun) and "HH:MM" of an instant, in IST.
export function istParts(d: Date): { weekday: number; time: string; minutes: number } {
  const t = new Date(d.getTime() + IST_OFFSET_MS);
  const hh = String(t.getUTCHours()).padStart(2, "0");
  const mm = String(t.getUTCMinutes()).padStart(2, "0");
  return { weekday: t.getUTCDay(), time: `${hh}:${mm}`, minutes: t.getUTCHours() * 60 + t.getUTCMinutes() };
}

// The one-hour availability blocks a meeting [start, start+duration) touches.
export function blocksFor(start: Date, durationMin: number): string[] {
  const out: string[] = [];
  const end = start.getTime() + durationMin * 60000;
  let t = Math.floor((start.getTime() + IST_OFFSET_MS) / HOUR_MS) * HOUR_MS - IST_OFFSET_MS;
  for (; t < end; t += HOUR_MS) {
    const p = istParts(new Date(t));
    out.push(slotKey(p.weekday, `${p.time.slice(0, 2)}:00`));
  }
  return out;
}

// Candidate start times on upcoming weekdays (from tomorrow, IST) that fit
// inside 10:00-18:00: every half hour for 30-min coffees, on the hour for 1 h.
export function generateSlotCandidates(from = new Date(), durationMin = DEFAULT_DURATION, days = 14): Slot[] {
  const slots: Slot[] = [];
  const today = new Date(from.getTime() + IST_OFFSET_MS);
  for (let i = 1; i <= days; i++) {
    const dayStart = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + i);
    const weekday = new Date(dayStart).getUTCDay();
    if (weekday === 0 || weekday === 6) continue;
    for (let m = DAY_START_H * 60; m + durationMin <= DAY_END_H * 60; m += 30) {
      if (durationMin === 60 && m % 60 !== 0) continue;
      const d = new Date(dayStart + m * 60000 - IST_OFFSET_MS);
      if (d.getTime() <= from.getTime()) continue;
      slots.push({ iso: d.toISOString(), label: formatSlot(d), day: formatDay(d), time: formatTime(d) });
    }
  }
  return slots;
}

export function formatDay(d: Date): string {
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: IST });
}

export function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: IST });
}

export function formatSlot(d: Date): string {
  return `${formatDay(d)} · ${formatTime(d)}`;
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
