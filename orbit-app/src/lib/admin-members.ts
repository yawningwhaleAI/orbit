import { db } from "./db";
import { DEMO_EMAIL_DOMAINS } from "./email";

// Real (non-demo, non-operator) members plus pilot totals, shared by the admin
// page and the downloadable report.
export async function loadMembersReport() {
  const users = await db.user.findMany({
    where: { isOperator: false, NOT: { OR: DEMO_EMAIL_DOMAINS.map((d) => ({ email: { endsWith: d } })) } },
    include: {
      building: { select: { name: true } },
      _count: { select: { ownerMatches: true, tags: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  const ids = users.map((u) => u.id);
  const [meetings, buildings] = await Promise.all([
    db.meeting.findMany({
      where: { match: { OR: [{ ownerId: { in: ids } }, { otherId: { in: ids } }] } },
      select: { status: true, match: { select: { ownerId: true, otherId: true } } },
    }),
    db.building.findMany({ select: { id: true, name: true } }),
  ]);

  const coffeesBy = new Map<string, number>();
  for (const m of meetings) {
    if (m.status === "cancelled") continue;
    for (const id of [m.match.ownerId, m.match.otherId]) coffeesBy.set(id, (coffeesBy.get(id) || 0) + 1);
  }
  const onboarded = users.filter((u) => u.onboarded);
  const signedIn = users.filter((u) => u.lastLoginAt);
  const activeCoffees = meetings.filter((m) => m.status !== "cancelled");
  const confirmed = meetings.filter((m) => ["confirmed", "booked", "held"].includes(m.status));
  const intros = users.reduce((n, u) => n + u._count.ownerMatches, 0);
  const perBuilding = buildings
    .map((b) => ({ name: b.name, n: onboarded.filter((u) => u.buildingId === b.id).length }))
    .filter((b) => b.n > 0);

  const stats = [
    { k: "Members listed", v: onboarded.length },
    { k: "Signed in themselves", v: signedIn.length },
    { k: "Intros made", v: intros },
    { k: "Coffees proposed", v: activeCoffees.length },
    { k: "Coffees confirmed", v: confirmed.length },
  ];

  return { users, coffeesBy, onboarded, perBuilding, stats };
}

export type MembersReport = Awaited<ReturnType<typeof loadMembersReport>>;

// "aaryan.bansal2027@mastersunion.org" -> "aa***@mastersunion.org"
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  return `${local.slice(0, 2)}***@${domain ?? ""}`;
}

export const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" });

export function memberStatus(u: { onboarded: boolean; lastLoginAt: Date | null }): string {
  return !u.onboarded ? "Signing up" : u.lastLoginAt ? "Active" : "Listed";
}
