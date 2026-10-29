import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { logout } from "@/app/actions";
import { Wordmark, Eyebrow, LinkButton, Avatar } from "@/components/ui";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowRight, Spark, Users, Calendar, Clock } from "@/components/icons";

export const dynamic = "force-dynamic";

// Dodo Payments checkout link for the operator plan; falls back to email.
const CHECKOUT_URL =
  process.env.NEXT_PUBLIC_DODO_CHECKOUT_URL ||
  "mailto:hello@withinorbit.space?subject=Orbit%20for%20our%20building";

export default async function LandingPage() {
  const user = await getCurrentUser();

  // Operators belong on their dashboard; members who haven't finished their
  // profile must do that first. Everyone else sees the landing page.
  if (user?.isOperator) redirect("/dashboard");
  if (user && !user.onboarded) redirect("/onboarding");

  // Upcoming booked coffees for a signed-in member (either side of the match).
  let meetings: Awaited<ReturnType<typeof getMeetings>> = [];
  if (user) {
    meetings = await getMeetings(user.id);
  }

  return (
    <div>
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-line bg-[color:var(--bg)]/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <Wordmark />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {!user ? (
              <>
                <LinkButton href="/login?mode=login" variant="ghost" className="px-4 py-2 text-sm">
                  Log in
                </LinkButton>
                <LinkButton href="/login?mode=signup" variant="primary" className="px-4 py-2 text-sm">
                  Sign up
                </LinkButton>
              </>
            ) : user.isOperator ? (
              <LinkButton href="/dashboard" variant="primary" className="px-4 py-2 text-sm">
                Dashboard
              </LinkButton>
            ) : (
              <>
                <LinkButton href="/home" variant="primary" className="px-4 py-2 text-sm">
                  Your week <ArrowRight className="h-4 w-4" />
                </LinkButton>
                <form action={logout}>
                  <button className="text-sm text-ink-soft transition hover:text-ink">Sign out</button>
                </form>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5">
        {/* Signed-in: booked coffees first */}
        {user && !user.isOperator && (
          <section className="pt-10">
            <Eyebrow>Welcome back, {user.name.split(" ")[0]}</Eyebrow>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-serif text-[1.8rem]">Your booked coffees</h2>
              <LinkButton href="/home" variant="ghost" className="px-4 py-2 text-sm">
                See this week&apos;s intros <ArrowRight className="h-4 w-4" />
              </LinkButton>
            </div>
            {meetings.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-line bg-sunken p-6 text-ink-soft">
                No coffees booked yet. Head to{" "}
                <Link href="/home" className="text-accent-deep hover:underline">
                  your week
                </Link>{" "}
                to accept an intro.
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {meetings.map((m) => {
                  const other = m.match.ownerId === user.id ? m.match.other : m.match.owner;
                  const needsYou = m.status === "proposed" && m.proposedById !== user.id;
                  const past = m.scheduledAt.getTime() < Date.now();
                  const confirmed = m.status === "confirmed" || m.status === "booked";
                  const badge =
                    m.status === "held"
                      ? "Met"
                      : past && confirmed
                        ? "How'd it go?"
                        : confirmed
                          ? "Confirmed"
                          : needsYou
                            ? "Confirm?"
                            : "Awaiting them";
                  const badgeLit =
                    (past && confirmed) || (!past && (confirmed || needsYou));
                  return (
                    <Link
                      key={m.id}
                      href={`/meeting/${m.id}`}
                      className="flex items-center gap-4 rounded-2xl border border-line bg-elev p-4 transition hover:border-line-strong"
                    >
                      <Avatar name={other.name} size={44} />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium">{other.name}</div>
                        <div className="text-sm text-ink-faint">
                          {[other.role, other.company].filter(Boolean).join(" · ")}
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-[0.7rem] font-semibold ${
                            badgeLit
                              ? "bg-[color:var(--accent-tint)] text-accent-deep"
                              : "bg-sunken text-ink-faint"
                          }`}
                        >
                          {badge}
                        </span>
                        <div className="mt-1 hidden items-center justify-end gap-1.5 text-ink-soft sm:flex">
                          <Clock className="h-4 w-4 text-accent-deep" />
                          {m.scheduledAt.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
            <hr className="my-12 border-line" />
          </section>
        )}

        {/* Hero / what it is */}
        <section className={user && !user.isOperator ? "" : "pt-16"}>
          <Eyebrow>The network inside your building</Eyebrow>
          <h1 className="max-w-3xl font-serif text-[2.6rem] leading-[1.05] sm:text-[3.4rem]">
            Meet the three people in your building worth{" "}
            <em className="not-italic text-accent-deep">knowing</em> this week.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink-soft">
            Orbit is the professional network for the people who already share your building. Every
            week our matching finds three people worth meeting — someone who can help you, and
            someone you can help — and books a 30-minute coffee downstairs. No scrolling, no
            messaging, no feed. Just one good introduction at a time.
          </p>
          {!user && (
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/login?mode=signup" variant="primary">
                Join your building <ArrowRight className="h-4 w-4" />
              </LinkButton>
              <LinkButton href="/login?mode=login" variant="ghost">
                I already have an account
              </LinkButton>
            </div>
          )}
        </section>

        {/* How it works */}
        <section className="py-16">
          <h2 className="mb-8 font-serif text-[1.8rem]">Three steps, then just show up.</h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {[
              {
                icon: <Users className="h-5 w-5" />,
                title: "Share what you give & want",
                body: "Two minutes. Upload a resume to autofill, or type a few lines. Nothing is public.",
              },
              {
                icon: <Spark className="h-5 w-5" />,
                title: "Get three intros a week",
                body: "Our matching reads the whole building and picks three genuinely reciprocal people for you.",
              },
              {
                icon: <Calendar className="h-5 w-5" />,
                title: "Accept — we book the coffee",
                body: "Pick a 30-minute or 1-hour slot from their free times. We handle the calendar invite and the email.",
              },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl border border-line bg-elev p-6">
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-[color:var(--accent-tint)] text-accent-deep">
                  {s.icon}
                </div>
                <div className="mb-1 text-sm font-semibold">{s.title}</div>
                <p className="text-sm text-ink-soft">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Give / Get */}
        <section className="grid gap-6 pb-16 lg:grid-cols-2">
          <div className="rounded-2xl border border-line bg-elev p-7">
            <h3 className="font-serif text-xl">Built on give and get</h3>
            <p className="mt-3 text-ink-soft">
              Every match is two-way by design. You bring something the other person wants, and they
              bring something you want. That&apos;s why the coffee is worth 30 minutes for both of
              you — not a cold pitch, a fair trade.
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-elev p-7">
            <h3 className="font-serif text-xl">The opposite of a feed</h3>
            <p className="mt-3 text-ink-soft">
              No posts, no likes, no DMs to ignore. Orbit does the awkward middle — the finding, the
              asking, the scheduling — so the only thing left for you to do is show up and talk to a
              real person a lift ride away.
            </p>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="pb-16">
          <h2 className="mb-8 font-serif text-[1.8rem]">Simple pricing.</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-elev p-7">
              <div className="text-sm font-semibold">Members</div>
              <div className="mt-2 font-serif text-3xl">Free</div>
              <p className="mt-3 text-sm text-ink-soft">
                Everyone who works in an Orbit building gets three intros a week and coffee booking
                at no cost.
              </p>
              <div className="mt-6">
                <LinkButton href="/login?mode=signup" variant="ghost">
                  Join your building
                </LinkButton>
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-elev p-7">
              <div className="text-sm font-semibold">Building operators</div>
              <div className="mt-2 font-serif text-3xl">
                ₹15,000 <span className="text-base text-ink-soft">/ building / month</span>
              </div>
              <p className="mt-3 text-sm text-ink-soft">
                A tenant-engagement amenity for your tower or coworking space: invite links and QR
                flyers, weekly matching, and an activation dashboard.
              </p>
              <div className="mt-6">
                <LinkButton href={CHECKOUT_URL} variant="primary">
                  Get Orbit for your building <ArrowRight className="h-4 w-4" />
                </LinkButton>
              </div>
            </div>
          </div>
        </section>

        {!user && (
          <section className="mb-20 rounded-3xl border border-line bg-[linear-gradient(180deg,var(--accent-tint),transparent)] p-10 text-center">
            <h2 className="font-serif text-[2rem]">Your next collaborator is in the building.</h2>
            <p className="mx-auto mt-3 max-w-xl text-ink-soft">
              Sign up free, tell Orbit what you give and want, and get your first three intros this
              week.
            </p>
            <div className="mt-6 flex justify-center">
              <LinkButton href="/login?mode=signup" variant="primary">
                Get my intros <ArrowRight className="h-4 w-4" />
              </LinkButton>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-8 text-sm text-ink-faint">
          <Wordmark />
          <div className="flex items-center gap-4">
            <span>The professional network inside your building.</span>
            <Link href="/#pricing" className="hover:text-ink">
              Pricing
            </Link>
            <Link href="/privacy" className="hover:text-ink">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-ink">
              Terms
            </Link>
            <Link href="/refunds" className="hover:text-ink">
              Refunds
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

async function getMeetings(userId: string) {
  return db.meeting.findMany({
    where: {
      status: { in: ["proposed", "confirmed", "booked", "held"] },
      match: { OR: [{ ownerId: userId }, { otherId: userId }] },
    },
    include: { match: { include: { owner: true, other: true } } },
    orderBy: { scheduledAt: "asc" },
  });
}
