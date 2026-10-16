import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { lexicalGiveWant } from "@/lib/similarity";
import { AppNav } from "@/components/app-nav";
import { Avatar, buttonClass } from "@/components/ui";
import { ArrowRight, Check, Clock, MapPin, Calendar, X } from "@/components/icons";
import { respond } from "./actions";

export const dynamic = "force-dynamic";

function satisfies(gives: string[], wants: string[]): string[] {
  const out: string[] = [];
  for (const g of gives) {
    if (wants.some((w) => lexicalGiveWant(g, w) >= 0.33)) out.push(g);
  }
  return out;
}

export default async function IntroPage({ params }: { params: { id: string } }) {
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
    weekday: "long",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <>
      <AppNav right={match.building.name} />
      <main className="mx-auto max-w-xl px-5 py-8">
        <Link href="/home" className="mb-4 inline-flex items-center gap-1 text-sm text-ink-faint hover:text-ink">
          ← This week
        </Link>

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
          {match.status === "accepted" ? (
            <div className="m-5 rounded-xl border border-line bg-elev p-5 text-center animate-fade-up">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-[color:var(--accent-tint)] text-accent-deep">
                <Check className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-xl">Coffee booked</h3>
              <p className="mt-1 text-sm text-ink-soft">
                We&apos;ve let {match.other.name.split(" ")[0]} know.
              </p>
              <div className="mx-auto mt-4 max-w-xs space-y-2 text-left text-sm">
                <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-accent-deep" /> {meetingWhen}</div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent-deep" /> {match.meeting?.venue}</div>
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-accent-deep" /> Added to your calendar</div>
              </div>
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
            <>
              <div className="flex items-center gap-2 px-5 pt-5 text-sm text-ink-soft">
                <Clock className="h-4 w-4 text-accent-deep" />
                Proposed: Thursday, 3:00 PM · {match.building.cafeName} · 15 min
              </div>
              <div className="grid grid-cols-2 gap-2.5 p-5">
                <form action={respond}>
                  <input type="hidden" name="matchId" value={match.id} />
                  <input type="hidden" name="decision" value="accept" />
                  <button className={buttonClass("primary") + " w-full"}>Yes, introduce us</button>
                </form>
                <form action={respond}>
                  <input type="hidden" name="matchId" value={match.id} />
                  <input type="hidden" name="decision" value="pass" />
                  <button className={buttonClass("pass") + " w-full"}>Pass</button>
                </form>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
