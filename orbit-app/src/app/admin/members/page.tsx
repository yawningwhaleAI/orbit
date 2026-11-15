import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppNav } from "@/components/app-nav";
import { Avatar, Eyebrow } from "@/components/ui";
import { DEMO_EMAIL_DOMAINS } from "@/lib/email";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Members · Orbit admin", robots: { index: false, follow: false } };

// Admins are listed in ADMIN_EMAILS (comma-separated, set in Vercel), so no
// address lives in the code. Everyone else gets a plain 404.
function isAdmin(email: string): boolean {
  const list = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.trim().toLowerCase());
}

// "aaryan.bansal2027@mastersunion.org" -> "aa***@mastersunion.org"
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  return `${local.slice(0, 2)}***@${domain ?? ""}`;
}

const fmt = (d: Date) =>
  d.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" });

export default async function MembersAdminPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login?mode=login");
  if (!isAdmin(me.email)) notFound();

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

  return (
    <>
      <AppNav right="Admin" profile />
      <main className="mx-auto max-w-5xl px-5 py-10">
        <Eyebrow>Admin</Eyebrow>
        <h1 className="font-serif text-[2rem] leading-tight">Orbit members</h1>
        <p className="mt-1 text-sm text-ink-faint">
          withinorbit.space · Gurugram pilot · as of {fmt(new Date())}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {stats.map((s) => (
            <div key={s.k} className="rounded-2xl border border-line bg-elev p-4">
              <div className="text-xs text-ink-faint">{s.k}</div>
              <div className="mt-1 font-serif text-3xl text-accent-deep">{s.v}</div>
            </div>
          ))}
        </div>

        {perBuilding.length > 0 && (
          <p className="mt-4 text-sm text-ink-soft">
            By building: {perBuilding.map((b) => `${b.name} ${b.n}`).join(" · ")}
          </p>
        )}

        <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-elev">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-line text-xs text-ink-faint">
              <tr>
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Member</th>
                <th className="px-4 py-3 font-medium">Role · Company</th>
                <th className="px-4 py-3 font-medium">Building</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium text-right">Intros</th>
                <th className="px-4 py-3 font-medium text-right">Coffees</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 text-ink-faint">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} size={30} />
                      <div>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-xs text-ink-faint">{maskEmail(u.email)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {[u.role, u.company].filter(Boolean).join(" · ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{u.building?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[0.7rem] font-semibold ${
                        !u.onboarded
                          ? "bg-sunken text-ink-faint"
                          : u.lastLoginAt
                            ? "bg-[color:var(--accent-tint)] text-accent-deep"
                            : "bg-sunken text-ink-soft"
                      }`}
                    >
                      {!u.onboarded ? "Signing up" : u.lastLoginAt ? "Active" : "Listed"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-faint">{fmt(u.createdAt)}</td>
                  <td className="px-4 py-3 text-right">{u._count.ownerMatches}</td>
                  <td className="px-4 py-3 text-right">{coffeesBy.get(u.id) || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-ink-faint">
          Active = signed in themselves · Listed = profile added by the team, not signed in yet ·
          Emails masked; phone numbers never shown here.
        </p>
      </main>
    </>
  );
}
