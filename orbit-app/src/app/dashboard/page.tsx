import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppNav } from "@/components/app-nav";
import { Avatar } from "@/components/ui";

export const dynamic = "force-dynamic";

const WEEK_MS = 7 * 24 * 3600 * 1000;
const ACTIVE = ["proposed", "confirmed", "booked", "held"];
const CONFIRMED = ["confirmed", "booked", "held"];

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

  const [members, matches, meetings, feedback] = await Promise.all([
    db.user.findMany({
      where: { buildingId: building.id, isOperator: false, onboarded: true },
      select: { id: true, floor: true, createdAt: true },
    }),
    db.match.findMany({
      where: { buildingId: building.id },
      include: { owner: true, other: true },
      orderBy: { createdAt: "desc" },
    }),
    db.meeting.findMany({
      where: { match: { buildingId: building.id } },
      select: {
        id: true,
        status: true,
        scheduledAt: true,
        createdAt: true,
        match: { select: { ownerId: true, otherId: true } },
      },
    }),
    db.meetingFeedback.findMany({
      where: { meeting: { match: { buildingId: building.id } } },
      select: { showed: true, worthwhile: true },
    }),
  ]);

  const memberIds = new Set(members.map((m) => m.id));
  const parts = (mt: (typeof meetings)[number]) => [mt.match.ownerId, mt.match.otherId];

  // Funnel (unique members reaching each step). "Got intros" counts anyone who
  // appears on either side of a match, so later (two-sided) steps can't exceed it.
  const gotIntro = new Set<string>();
  for (const m of matches) {
    if (memberIds.has(m.ownerId)) gotIntro.add(m.ownerId);
    if (memberIds.has(m.otherId)) gotIntro.add(m.otherId);
  }
  const booked = new Set<string>();
  const confirmed = new Set<string>();
  const met = new Set<string>();
  for (const mt of meetings) {
    const ps = parts(mt).filter((id) => memberIds.has(id));
    if (ACTIVE.includes(mt.status)) ps.forEach((id) => booked.add(id));
    if (CONFIRMED.includes(mt.status)) ps.forEach((id) => confirmed.add(id));
    if (mt.status === "held") ps.forEach((id) => met.add(id));
  }

  // Activation: members with a confirmed coffee within 7 days of signup.
  const createdAtById = new Map(members.map((m) => [m.id, m.createdAt.getTime()]));
  const activated = new Set<string>();
  for (const mt of meetings) {
    if (!CONFIRMED.includes(mt.status)) continue;
    for (const id of parts(mt)) {
      const signup = createdAtById.get(id);
      if (signup != null && mt.createdAt.getTime() <= signup + WEEK_MS) activated.add(id);
    }
  }
  const activationRate = members.length
    ? Math.round((activated.size / members.length) * 100)
    : 0;

  // Response + outcome rates.
  const responded = matches.filter((m) => m.status === "accepted" || m.status === "passed");
  const accepted = matches.filter((m) => m.status === "accepted");
  const acceptRate = responded.length
    ? Math.round((accepted.length / responded.length) * 100)
    : 0;

  // Active (non-cancelled) meetings for display counts.
  const activeMeetings = meetings.filter((m) => ACTIVE.includes(m.status));
  const pastConfirmed = meetings.filter(
    (m) => CONFIRMED.includes(m.status) && m.scheduledAt.getTime() < Date.now()
  );
  const heldCount = meetings.filter((m) => m.status === "held").length;
  const showUpRate = pastConfirmed.length
    ? Math.round((heldCount / pastConfirmed.length) * 100)
    : 0;
  const showedFb = feedback.filter((f) => f.showed);
  const worthRate = showedFb.length
    ? Math.round((showedFb.filter((f) => f.worthwhile).length / showedFb.length) * 100)
    : 0;

  // Members by floor.
  const byFloor = new Map<number, number>();
  for (const m of members) {
    if (m.floor == null) continue;
    byFloor.set(m.floor, (byFloor.get(m.floor) || 0) + 1);
  }
  const floors = [...byFloor.entries()].sort((a, b) => a[0] - b[0]);
  const maxFloor = Math.max(1, ...floors.map(([, c]) => c));

  const funnel = [
    { label: "Onboarded", v: members.length },
    { label: "Got intros", v: gotIntro.size },
    { label: "Booked a coffee", v: booked.size },
    { label: "Confirmed", v: confirmed.size },
    { label: "Actually met", v: met.size },
  ];
  const funnelMax = Math.max(1, members.length);

  const kpis = [
    { k: "Active members", v: members.length, accent: true },
    { k: "Activation rate", v: `${activationRate}%`, accent: true, note: "confirmed coffee ≤7 days" },
    { k: "Show-up rate", v: `${showUpRate}%`, note: `${heldCount} coffees held` },
    { k: "Worth it", v: showedFb.length ? `${worthRate}%` : "—", note: `${showedFb.length} rated` },
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

        {members.length < 15 && (
          <div className="mb-6 rounded-xl border border-line bg-sunken px-4 py-3 text-sm text-ink-soft">
            Still gathering critical mass — matching gets noticeably better past ~15–20 active
            members in a building. Activation figures are early until then.
          </div>
        )}

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

        {/* Activation funnel */}
        <div className="mt-6 rounded-2xl border border-line bg-elev p-6">
          <h3 className="text-sm font-semibold">Activation funnel</h3>
          <p className="mb-5 text-xs text-ink-faint">
            How members move from joining to actually meeting
          </p>
          <div className="space-y-3">
            {funnel.map((step, i) => {
              const pct = Math.round((step.v / funnelMax) * 100);
              const prev = i > 0 ? funnel[i - 1].v : step.v;
              const conv = prev ? Math.round((step.v / prev) * 100) : 0;
              return (
                <div key={step.label}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-ink-soft">{step.label}</span>
                    <span className="text-ink-faint">
                      {step.v}
                      {i > 0 && <span className="ml-2">({conv}% of prev)</span>}
                    </span>
                  </div>
                  <div className="h-7 overflow-hidden rounded-lg bg-sunken">
                    <div
                      className="h-full rounded-lg bg-[linear-gradient(90deg,var(--accent-bright),var(--accent))]"
                      style={{ width: `${Math.max(3, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
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

        <p className="mt-6 text-center text-xs text-ink-faint">
          Accept rate {acceptRate}% · {matches.length} intros sent · {activeMeetings.length} coffees booked
        </p>
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
