import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { offerSlots } from "@/lib/meetings";
import { googleCalendarUrl } from "@/lib/slots";
import { AppNav } from "@/components/app-nav";
import { Avatar } from "@/components/ui";
import { Clock, MapPin, Check } from "@/components/icons";
import { MeetingActions } from "@/components/meeting-actions";
import { FeedbackForm } from "@/components/feedback-form";

export const dynamic = "force-dynamic";

export default async function MeetingPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string; thanks?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const meeting = await db.meeting.findUnique({
    where: { id: params.id },
    include: { match: { include: { owner: true, other: true } }, feedback: true },
  });
  if (!meeting) redirect("/home");

  const match = meeting.match;
  if (match.ownerId !== user.id && match.otherId !== user.id) redirect("/home");

  const other = match.ownerId === user.id ? match.other : match.owner;
  const role: "proposer" | "invitee" = meeting.proposedById === user.id ? "proposer" : "invitee";

  // Ask for feedback once the coffee's time has passed and this user hasn't
  // left any yet (and it wasn't cancelled).
  const isPast = meeting.scheduledAt.getTime() < Date.now();
  const myFeedback = meeting.feedback.find((f) => f.userId === user.id);
  const needsFeedback =
    isPast &&
    ["confirmed", "booked", "held"].includes(meeting.status) &&
    !myFeedback;

  const whenLabel = meeting.scheduledAt.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

  const [slots30, slots60] = await Promise.all(
    [30, 60].map((durationMin) =>
      offerSlots({ chooserId: user.id, otherId: other.id, excludeMatchId: match.id, durationMin })
    )
  );
  const calendarUrl =
    meeting.status === "confirmed"
      ? googleCalendarUrl({
          title: `Coffee with ${other.name} · Orbit`,
          start: meeting.scheduledAt,
          minutes: meeting.durationMin,
          details: match.reason,
          location: meeting.venue,
        })
      : undefined;

  const statusLabel =
    meeting.status === "confirmed"
      ? "Confirmed"
      : meeting.status === "cancelled"
        ? "Cancelled"
        : role === "proposer"
          ? `Waiting for ${other.name.split(" ")[0]} to confirm`
          : `${other.name.split(" ")[0]} proposed this time`;

  return (
    <>
      <AppNav profile />
      <main className="mx-auto max-w-xl px-5 py-8">
        <Link href="/" className="mb-4 inline-flex items-center gap-1 text-sm text-ink-faint hover:text-ink">
          ← Home
        </Link>

        {searchParams?.error && (
          <div className="mb-4 rounded-xl border border-accent bg-[color:var(--accent-tint)] px-4 py-3 text-sm text-accent-deep">
            {searchParams.error === "slot_taken"
              ? "That time was just taken. Pick another."
              : "Please pick a valid time."}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-line bg-elev shadow-lg">
          <div className="flex items-center justify-between border-b border-line bg-[linear-gradient(180deg,var(--accent-tint),transparent)] px-5 py-3">
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-accent-deep">
              Your coffee
            </span>
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold ${
                meeting.status === "confirmed" ? "text-accent-deep" : "text-ink-faint"
              }`}
            >
              {meeting.status === "confirmed" && <Check className="h-3.5 w-3.5" />}
              {statusLabel}
            </span>
          </div>

          <div className="flex items-center gap-4 px-5 pb-4 pt-6">
            <Avatar name={other.name} size={56} />
            <div>
              <div className="font-serif text-lg">{other.name}</div>
              <div className="text-sm text-ink-faint">
                {[other.role, other.company].filter(Boolean).join(" · ")}
              </div>
            </div>
          </div>

          <div className="mx-5 rounded-xl border border-line bg-sunken p-4">
            <p className="font-serif text-[1.05rem] leading-snug">{match.reason}</p>
          </div>

          <div className="mx-5 mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent-deep" /> {whenLabel} · {meeting.durationMin === 60 ? "1 hour" : "30 min"}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-accent-deep" /> {meeting.venue}
            </div>
          </div>

          <div className="m-5">
            {searchParams?.thanks === "1" || myFeedback ? (
              <div className="rounded-xl border border-line bg-sunken p-4 text-sm text-ink-soft">
                Thanks for the feedback — it helps us make better intros. 🙌
              </div>
            ) : needsFeedback ? (
              <div className="rounded-xl border border-accent bg-[color:var(--accent-tint)]/40 p-4">
                <div className="mb-3 text-sm font-semibold text-accent-deep">How did it go?</div>
                <FeedbackForm meetingId={meeting.id} otherFirstName={other.name.split(" ")[0]} />
              </div>
            ) : (
              <MeetingActions
                meetingId={meeting.id}
                role={role}
                status={meeting.status}
                slots30={slots30}
                slots60={slots60}
                otherFirstName={other.name.split(" ")[0]}
                calendarUrl={calendarUrl}
              />
            )}
          </div>
        </div>
      </main>
    </>
  );
}
