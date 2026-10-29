// Weekly free-time preferences. A member who never set theirs is treated as free
// in every slot, so new members don't silently block bookings.

import { db } from "./db";
import { SLOT_TIMES, WEEKDAYS, slotKey } from "./slots";

export const ALL_SLOT_KEYS: string[] = WEEKDAYS.flatMap((d) => SLOT_TIMES.map((t) => slotKey(d.n, t)));

// userId -> set of free slot keys, or null when that user is free everywhere.
export async function loadFreeSets(userIds: string[]): Promise<Map<string, Set<string> | null>> {
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, availabilitySet: true, availability: { select: { weekday: true, slot: true } } },
  });
  const out = new Map<string, Set<string> | null>();
  for (const id of userIds) out.set(id, null);
  for (const u of users) {
    out.set(u.id, u.availabilitySet ? new Set(u.availability.map((a) => slotKey(a.weekday, a.slot))) : null);
  }
  return out;
}
