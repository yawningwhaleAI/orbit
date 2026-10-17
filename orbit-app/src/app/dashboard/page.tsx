import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppNav } from "@/components/app-nav";
import { Avatar } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.isOperator) redirect("/home");

  const building =
    (user.buildingId
      ? await db.building.findUnique({ where: { id: user.buildingId } })
      : null) ?? (await db.building.findFirst());

  if (!building) {
    return (
      <>
        <AppNav right="Operator" />
        <main className="mx-auto max-w-5xl px-5 py-10 text-ink-soft">No building configured.</main>
      </>
    );
  }

  const [members, matches, meetings] = await Promise.all([
    db.user.findMany({
      where: { buildingId: building.id, isOperator: false, onboarded: true },
      select: { floor: true },
    }),
    db.match.findMany({
      where: { buildingId: building.id },
      include: { owner: true, other: true },
      orderBy: { createdAt: "desc" },
    }),
    db.meeting.findMany({ where: { match: { buildingId: building.id } } }),
  ]);

  const responded = matches.filter((m) => m.status === "accepted" || m.status === "passed");
  const accepted = matches.filter((m) => m.status === "accepted");
  const acceptRate = responded.length
    ? Math.round((accepted.length / responded.length) * 100)
    : 0;
  const held = meetings.filter((m) => m.status === "held").length;

  // Members by floor (real data) for the chart.
  const byFloor = new Map<number, number>();
  for (const m of members) {
    if (m.floor == null) continue;
    byFloor.set(m.floor, (byFloor.get(m.floor) || 0) + 1);
  }
  const floors = [...byFloor.entries()].sort((a, b) => a[0] - b[0]);
  const maxFloor = Math.max(1, ...floors.map(([, c]) => c));

  const kpis = [
    { k: "Active members", v: members.length, accent: true },
    { k: "Intros sent", v: matches.length },
    { k: "Accept rate", v: `${acceptRate}%`, accent: true },
    { k: "Coffees booked", v: meetings.length, note: `${held} held` },
  ];

  return (
    <>
      <AppNav right="Operator" />
      <main className="mx-auto max-w-5xl px-5 py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-serif text-[1.8rem]">{building.name} — Community</h1>
            <p className="mt-1 text-sm text-ink-faint">
              Powered by Orbit · {building.city} · Pilot day {building.pilotDay} of {building.pilotLength}
            </p>
          </div>
          <span className="rounded-full border border-accent bg-[color:var(--accent-tint)] px-3 py-1.5 text-xs font-semibold text-accent-deep">
            ● Pilot live
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <div key={kpi.k} className="rounded-2xl border border-line bg-elev p-5">
              <div className="text-xs text-ink-faint">{kpi.k}</div>
              <div
                className={`mt-2 font-serif text-4xl leading-none ${kpi.accent ? "text-accent-deep" : ""}`}
              >
                {kpi.v}
              </div>
              {kpi.note && <div className="mt-2 text-xs text-ink-faint">{kpi.note}</div>}
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-line bg-elev p-6">
            <h3 className="text-sm font-semibold">Members by floor</h3>
            <p className="mb-5 text-xs text-ink-faint">Where the community is forming</p>
            {floors.length === 0 ? (
              <p className="text-sm text-ink-faint">No floor data yet.</p>
            ) : (
              <div className="flex h-44 items-stretch gap-3">
                {floors.map(([floor, count]) => (
                  <div key={floor} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex w-full flex-1 items-end justify-center">
                      <div
                        className="w-full max-w-[34px] rounded-t-md bg-[linear-gradient(180deg,var(--accent-bright),var(--accent))]"
                        style={{ height: `${Math.max(6, (count / maxFloor) * 100)}%` }}
                        title={`${count} member${count === 1 ? "" : "s"}`}
                      />
                    </div>
                    <div className="text-[0.7rem] text-ink-faint">F{floor}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-line bg-elev p-6">
            <h3 className="text-sm font-semibold">Recent introductions</h3>
            <p className="mb-4 text-xs text-ink-faint">Latest activity</p>
            <div className="space-y-1">
              {matches.slice(0, 6).map((m) => (
                <div key={m.id} className="flex items-center gap-3 border-b border-line py-2 last:border-0">
                  <Avatar name={m.other.name} size={30} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {m.owner.name} × {m.other.name}
                    </div>
                  </div>
                  <StatusTag status={m.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function StatusTag({ status }: { status: string }) {
  const map: Record<string, string> = {
    accepted: "bg-[color:var(--accent-tint)] text-accent-deep",
    passed: "bg-sunken text-ink-faint",
    proposed: "bg-sunken text-ink-soft",
  };
  const label = status === "accepted" ? "Met" : status === "passed" ? "Passed" : "Proposed";
  return (
    <span className={`rounded-full px-2.5 py-1 text-[0.7rem] font-semibold ${map[status] || map.proposed}`}>
      {label}
    </span>
  );
}
