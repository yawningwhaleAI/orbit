// Proposed coffee time slots. Generates a tidy set of upcoming weekday slots.
// When Google Calendar OAuth is added later, swap `generateSlots` for a
// free/busy intersection of both members' calendars — the UI stays the same.

export interface Slot {
  iso: string; // ISO datetime
  label: string; // e.g. "Thu 17 Oct · 3:00 PM"
}

const TIMES: Array<[number, number]> = [
  [10, 30],
  [12, 0],
  [15, 0],
  [16, 30],
];

export function generateSlots(from = new Date(), count = 8): Slot[] {
  const slots: Slot[] = [];
  const day = new Date(from);
  day.setHours(0, 0, 0, 0);
  day.setDate(day.getDate() + 1); // start tomorrow

  while (slots.length < count) {
    const dow = day.getDay();
    if (dow !== 0 && dow !== 6) {
      for (const [h, m] of TIMES) {
        if (slots.length >= count) break;
        const d = new Date(day);
        d.setHours(h, m, 0, 0);
        if (d.getTime() > from.getTime()) {
          slots.push({ iso: d.toISOString(), label: formatSlot(d) });
        }
      }
    }
    day.setDate(day.getDate() + 1);
  }
  return slots;
}

export function formatSlot(d: Date): string {
  const date = d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const time = d.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
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
