// Shared meeting/slot helpers used by the intro page, the meeting page, and the
// booking actions — so availability and conflict rules live in one place.
//
// Model: the person CHOOSING a time is offered the OTHER person's free times
// (they may be willing to adjust their own schedule). Times that also fall in
// the chooser's own free times are flagged `both`. A chooser can also request a
// custom time; the other side still has to confirm, decline or counter.

import { db } from "./db";
import {
  DAY_END_H,
  DAY_START_H,
  blocksFor,
  generateSlotCandidates,
  istParts,
  type Slot,
} from "./slots";
import { loadFreeSets } from "./availability";

// Statuses that occupy a time slot (block double-booking / availability).
// "booked" is the legacy value from before two-sided confirmation — kept so
// pre-existing rows still block slots and show up.
export const ACTIVE_MEETING_STATUSES = ["proposed", "confirmed", "booked", "held"];

type Interval = { start: number; end: number };

// Time ranges currently occupied by either user (optionally excluding one match,
// e.g. the one being (re)scheduled).
async function busyIntervals(userIds: string[], excludeMatchId?: string): Promise<Interval[]> {
  const meetings = await db.meeting.findMany({
    where: {
      status: { in: ACTIVE_MEETING_STATUSES },
      scheduledAt: { gte: new Date(Date.now() - 2 * 3600 * 1000) },
      ...(excludeMatchId ? { matchId: { not: excludeMatchId } } : {}),
      match: { OR: [{ ownerId: { in: userIds } }, { otherId: { in: userIds } }] },
    },
    select: { scheduledAt: true, durationMin: true },
  });
  return meetings.map((m) => ({
    start: m.scheduledAt.getTime(),
    end: m.scheduledAt.getTime() + m.durationMin * 60000,
  }));
}

const overlaps = (a: Interval, b: Interval) => a.start < b.end && b.start < a.end;

function covers(free: Set<string> | null | undefined, start: Date, durationMin: number): boolean {
  return free == null || blocksFor(start, durationMin).every((k) => free.has(k));
}

// Slots the chooser can pick for a given duration: the OTHER person's free times
// that nobody has a coffee in. `both` marks ones inside the chooser's own times.
export async function offerSlots(opts: {
  chooserId: string;
  otherId: string;
  excludeMatchId?: string;
  durationMin: number;
  limit?: number;
}): Promise<Slot[]> {
  const { chooserId, otherId, excludeMatchId, durationMin, limit = 80 } = opts;
  const [busy, free] = await Promise.all([
    busyIntervals([chooserId, otherId], excludeMatchId),
    loadFreeSets([chooserId, otherId]),
  ]);
  const out: Slot[] = [];
  for (const s of generateSlotCandidates(new Date(), durationMin, 14)) {
    const start = new Date(s.iso);
    const iv = { start: start.getTime(), end: start.getTime() + durationMin * 60000 };
    if (!covers(free.get(otherId), start, durationMin)) continue;
    if (busy.some((b) => overlaps(iv, b))) continue;
    out.push({ ...s, both: covers(free.get(chooserId), start, durationMin) });
    if (out.length >= limit) break;
  }
  return out;
}

// How many 30-min times two people share (used for the "N shared free times" hint).
export async function sharedSlotCount(aId: string, bId: string, excludeMatchId?: string): Promise<number> {
  const slots = await offerSlots({ chooserId: aId, otherId: bId, excludeMatchId, durationMin: 30, limit: 400 });
  return slots.filter((s) => s.both).length;
}

// True if the time overlaps an existing active meeting of either user.
export async function hasClash(
  userIds: string[],
  when: Date,
  durationMin: number,
  excludeMatchId?: string
): Promise<boolean> {
  const iv = { start: when.getTime(), end: when.getTime() + durationMin * 60000 };
  return (await busyIntervals(userIds, excludeMatchId)).some((b) => overlaps(iv, b));
}

// Is this a time we're willing to put in front of the counterpart? It must be a
// sane weekday time on the half hour; unless the chooser is explicitly asking
// for a custom time, it must also fall inside the counterpart's free times.
export async function canOffer(
  counterpartId: string,
  when: Date,
  durationMin: number,
  custom: boolean
): Promise<boolean> {
  if (durationMin !== 30 && durationMin !== 60) return false;
  const p = istParts(when);
  if (p.weekday < 1 || p.weekday > 5) return false;
  if (p.minutes % 30 !== 0) return false;
  if (p.minutes < DAY_START_H * 60 - 120 || p.minutes + durationMin > (DAY_END_H + 2) * 60) return false;
  if (custom) return true;
  if (p.minutes < DAY_START_H * 60 || p.minutes + durationMin > DAY_END_H * 60) return false;
  const free = await loadFreeSets([counterpartId]);
  return covers(free.get(counterpartId), when, durationMin);
}
