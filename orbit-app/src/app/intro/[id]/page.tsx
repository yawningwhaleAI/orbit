import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { lexicalGiveWant } from "@/lib/similarity";
import { offerSlots } from "@/lib/meetings";
import { AppNav } from "@/components/app-nav";
import { Avatar } from "@/components/ui";
import { ArrowRight, Check, Clock, MapPin, X } from "@/components/icons";
import { SlotPicker } from "@/components/slot-picker";

export const dynamic = "force-dynamic";

function satisfies(gives: string[], wants: string[]): string[] {
  const out: string[] = [];
  for (const g of gives) {
    if (wants.some((w) => lexicalGiveWant(g, w) >= 0.33)) out.push(g);
  }
  return out;
}

export default async function IntroPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string; asked?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const match = await db.match.findUnique({
    where: { id: params.id },
    include: { other: { include: { tags: true } }, building: true, meeting: true },
  });
  if (!match) notFound();
  if (match.ownerId !== user.id) redirect("/home");

  const myGives = user.tags.filter((t) => t.kind === "give").map((t) => t.label);
  const myWants = user.tags.filter((t) => t.kind === "want").map((t) => t.label);
  const otherGives = match.other.tags.filter((t) => t.kind === "give").map((t) => t.label);
  const otherWants = match.other.tags.filter((t) => t.kind === "want").map((t) => t.label);

  const theyGiveYou = satisfies(otherGives, myWants);
  const youGiveThem = satisfies(myGives, otherWants);

  const sub = [match.other.role, match.other.company].filter(Boolean).join(" · ");
  const meetingWhen = match.meeting?.scheduledAt.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

  // Proposed time slots — only times where BOTH people are free.
  const [slots30, slots60] = await Promise.all(
    [30, 60].map((durationMin) =>
      offerSlots({ chooserId: user.id, otherId: match.otherId, excludeMatchId: match.id, durationMin })
    )
  );

  return (
    <>
      <AppNav right={match.building.name} profile />
      <main className="mx-auto max-w-xl px-5 py-8">
        <Link href="/home" className="mb-4 inline-flex items-center gap-1 text-sm text-ink-faint hover:text-ink">
          ← This week
        </Link>

        {searchParams?.error === "slot_taken" && (
          <div className="mb-4 rounded-xl border border-accent bg-[color:var(--accent-tint)] px-4 py-3 text-sm text-accent-deep">
            That time is no longer available for both of you. Please pick another slot below.
          </div>
        )}

        {searchParams?.asked && (
          <div className="mb-4 rounded-xl border border-accent bg-[color:var(--accent-tint)] px-4 py-3 text-sm text-accent-deep">
            Sent. We emailed {match.other.name.split(" ")[0]} asking them to open up a time.
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-line bg-elev shadow-lg">
          <div className="flex items-center justify-between border-b border-line bg-[linear-gradient(180deg,var(--accent-tint),transparent)] px-5 py-3">
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-accent-deep">
              Your introduction
            </span>
            <span className="text-xs text-ink-faint">{match.matchPct}% match</span>
          </div>

          {/* People */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-5 pb-4 pt-6">
            <div className="text-center">
              <div className="mx-auto mb-2 w-fit"><Avatar name={user.name} size={60} /></div>
              <div className="text-sm font-semibold">You</div>
              <div className="text-xs text-ink-faint">{user.role ?? ""}</div>
              {user.floor != null && <div className="text-[0.7rem] text-ink-faint">{user.floor}th floor</div>}
            </div>
            <div className="mt-6 text-accent">
              <ArrowRight className="h-5 w-8" />
            </div>
            <div className="text-center">
              <div className="mx-auto mb-2 w-fit"><Avatar name={match.other.name} size={60} /></div>
              <div className="text-sm font-semibold">{match.other.name}</div>
              <div className="text-xs text-ink-faint">{sub}</div>
              {match.other.floor != null && (
                <div className="text-[0.7rem] text-ink-faint">{match.other.floor}th floor</div>
              )}
            </div>
          </div>

          {/* Why */}
          <div className="mx-5 rounded-xl border border-line bg-sunken p-4">
            <div className="mb-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
              Why you two
            </div>
            <p className="font-serif text-[1.05rem] leading-snug">{match.reason}</p>
          </div>

          {/* Exchange */}
          {(theyGiveYou.length > 0 || youGiveThem.length > 0) && (
            <div className="mx-5 mt-3 grid gap-3 sm:grid-cols-2">
              {theyGiveYou.length > 0 && (
                <div>
                  <div className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-accent-deep">
                    They can give you
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {theyGiveYou.map((t) => (
                      <span key={t} className="rounded-md border border-accent bg-[color:var(--accent-tint)] px-2 py-1 text-xs text-accent-deep">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {youGiveThem.length > 0 && (
                <div>
                  <div className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                    You can give them
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {youGiveThem.map((t) => (
                      <span key={t} className="rounded-md border border-line bg-sunken px-2 py-1 text-xs text-ink-soft">{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* When + actions */}
          {match.status === "accepted" && match.meeting ? (
            <div className="m-5 rounded-xl border border-line bg-elev p-5 text-center animate-fade-up">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-[color:var(--accent-tint)] text-accent-deep">
                <Check className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-xl">
                {match.meeting.status === "confirmed" ? "Coffee confirmed" : "Coffee proposed"}
              </h3>
              <p className="mt-1 text-sm text-ink-soft">
                {match.meeting.status === "confirmed"
                  ? `You're set to meet ${match.other.name.split(" ")[0]}.`
                  : `Waiting for ${match.other.name.split(" ")[0]} to confirm.`}
              </p>
              <div className="mx-auto mt-4 max-w-xs space-y-2 text-left text-sm">
                <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-accent-deep" /> {meetingWhen}{match.meeting.durationMin === 60 ? " · 1 hour" : " · 30 min"}</div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent-deep" /> {match.meeting.venue}</div>
              </div>
              <Link href={`/meeting/${match.meeting.id}`} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent-deep hover:underline">
                Manage this coffee <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : match.status === "passed" ? (
            <div className="m-5 rounded-xl border border-line bg-sunken p-5 text-center text-ink-soft animate-fade-up">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-sunken text-ink-faint">
                <X className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-xl text-ink">No problem</h3>
              <p className="mt-1 text-sm">We&apos;ll find someone better suited next week.</p>
            </div>
          ) : (
            <SlotPicker
              matchId={match.id}
              slots30={slots30}
              slots60={slots60}
              otherFirstName={match.other.name.split(" ")[0]}
            />
          )}
        </div>
      </main>
    </>
  );
}
