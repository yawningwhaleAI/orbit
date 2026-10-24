// Shared meeting/slot helpers used by the intro page, the meeting page, and the
// booking actions — so availability and conflict rules live in one place.

import { db } from "./db";
import { generateSlots, type Slot } from "./slots";

// Statuses that occupy a time slot (block double-booking / availability).
// "booked" is the legacy value from before two-sided confirmation — kept so
// pre-existing rows still block slots and show up.
export const ACTIVE_MEETING_STATUSES = ["proposed", "confirmed", "booked", "held"];

const CLASH_WINDOW_MS = 60 * 60000; // within an hour counts as the same slot

// All scheduled times currently occupied by either user (optionally excluding
// one match, e.g. the one being (re)scheduled).
async function busyTimes(userIds: string[], excludeMatchId?: string): Promise<Date[]> {
  const meetings = await db.meeting.findMany({
    where: {
      status: { in: ACTIVE_MEETING_STATUSES },
      ...(excludeMatchId ? { matchId: { not: excludeMatchId } } : {}),
      match: {
        OR: [{ ownerId: { in: userIds } }, { otherId: { in: userIds } }],
      },
    },
    select: { scheduledAt: true },
  });
  return meetings.map((m) => m.scheduledAt);
}

// Upcoming slots where BOTH users are free.
export async function availableSlots(
  userIds: string[],
  excludeMatchId?: string,
  count = 8
): Promise<Slot[]> {
  const busy = await busyTimes(userIds, excludeMatchId);
  return generateSlots(new Date(), 40)
    .filter(
      (s) =>
        !busy.some((b) => Math.abs(new Date(s.iso).getTime() - b.getTime()) < CLASH_WINDOW_MS)
    )
    .slice(0, count);
}

// True if a time clashes with an existing active meeting for either user.
export async function hasClash(
  userIds: string[],
  when: Date,
  excludeMatchId?: string
): Promise<boolean> {
  const clash = await db.meeting.findFirst({
    where: {
      status: { in: ACTIVE_MEETING_STATUSES },
      ...(excludeMatchId ? { matchId: { not: excludeMatchId } } : {}),
      match: {
        OR: [{ ownerId: { in: userIds } }, { otherId: { in: userIds } }],
      },
      scheduledAt: {
        gte: new Date(when.getTime() - (CLASH_WINDOW_MS - 60000)),
        lte: new Date(when.getTime() + (CLASH_WINDOW_MS - 60000)),
      },
    },
  });
  return !!clash;
}
