import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { isoWeekKey } from "@/lib/week";
import { AppNav } from "@/components/app-nav";
import { Eyebrow } from "@/components/ui";
import { IntroCard } from "@/components/intro-card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.isOperator) redirect("/dashboard");
  if (!user.onboarded) redirect("/onboarding");

  const week = isoWeekKey();
  const intros = await db.match.findMany({
    where: { ownerId: user.id, week },
    include: { other: true, meeting: true },
    orderBy: { score: "desc" },
  });

  const building = user.building?.name ?? "your building";
  const accepted = intros.filter((i) => i.status === "accepted" && i.meeting);

  return (
    <>
      <AppNav right={`${user.building?.name ?? "Orbit"} · Week ${week.split("-W")[1]}`} profile />
      <main className="mx-auto max-w-2xl px-5 py-10">
        <Eyebrow>Your week</Eyebrow>
        <h1 className="text-[2.2rem] leading-tight">
          Three people worth <em className="not-italic text-accent-deep">meeting</em>.
        </h1>
        <p className="mb-8 mt-3 text-ink-soft">
          Curated for you in {building} this week. Tap one to see why, then accept the coffee.
        </p>

        {intros.length === 0 ? (
          <div className="rounded-2xl border border-line bg-sunken p-8 text-center text-ink-soft">
            No introductions yet this week. Check back soon.
          </div>
        ) : (
          <div className="space-y-3">
            {intros.map((i) => (
              <IntroCard
                key={i.id}
                intro={{
                  id: i.id,
                  matchPct: i.matchPct,
                  status: i.status,
                  reason: i.reason,
                  other: {
                    name: i.other.name,
                    role: i.other.role,
                    company: i.other.company,
                    floor: i.other.floor,
                  },
                }}
              />
            ))}
          </div>
        )}

        {accepted.length > 0 && (
          <div className="mt-10">
            <Eyebrow>Booked coffees</Eyebrow>
            <div className="space-y-2">
              {accepted.map((i) => (
                <div
                  key={i.id}
                  className="flex items-center justify-between rounded-xl border border-line bg-elev px-4 py-3 text-sm"
                >
                  <span className="font-medium">{i.other.name}</span>
                  <span className="text-ink-faint">
                    {i.meeting!.scheduledAt.toLocaleDateString("en-IN", {
                      weekday: "short",
                      hour: "numeric",
                      minute: "2-digit",
                    })}{" "}
                    · {i.meeting!.venue}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="mt-10 text-center font-serif italic text-ink-soft">
          AI does the awkward middle. You just show up.
        </p>
      </main>
    </>
  );
}
