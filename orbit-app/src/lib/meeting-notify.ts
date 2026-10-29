// Centralized meeting-lifecycle notifications. All email for proposing,
// confirming, and cancelling a coffee runs through here so the routing (who
// gets what) lives in one place. Every send is best-effort and never throws.

import { googleCalendarUrl } from "./slots";
import { appUrl } from "./magic";
import {
  sendEmail,
  isSendableAddress,
  coffeeProposedEmail,
  coffeeConfirmedEmail,
  coffeeCancelledEmail,
} from "./email";

export type Party = { id: string; name: string; email: string; role?: string | null };

function whenLabel(d: Date): string {
  return d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export async function notifyMeeting(
  event: "proposed" | "confirmed" | "cancelled",
  args: {
    meetingId: string;
    scheduledAt: Date;
    durationMin?: number;
    venue: string;
    reason: string;
    owner: Party;
    other: Party;
    actorId: string; // who performed the action
  }
): Promise<void> {
  try {
    const { owner, other, actorId, scheduledAt, venue, reason, meetingId } = args;
    const durationMin = args.durationMin ?? 30;
    const actor = actorId === owner.id ? owner : other;
    const counterpart = actorId === owner.id ? other : owner;
    const label = `${whenLabel(scheduledAt)} (${durationMin === 60 ? "1 hour" : "30 min"})`;
    const meetingUrl = `${appUrl()}/meeting/${meetingId}`;
    const sends: Promise<unknown>[] = [];

    if (event === "proposed") {
      if (isSendableAddress(counterpart.email)) {
        const m = coffeeProposedEmail({
          recipientFirstName: counterpart.name.split(" ")[0],
          proposerName: actor.name,
          proposerRole: actor.role,
          whenLabel: label,
          venue,
          meetingUrl,
        });
        sends.push(sendEmail({ to: counterpart.email, subject: m.subject, html: m.html, text: m.text }));
      }
    } else if (event === "confirmed") {
      for (const [me, them] of [
        [owner, other],
        [other, owner],
      ] as const) {
        if (!isSendableAddress(me.email)) continue;
        const calendarUrl = googleCalendarUrl({
          title: `Coffee with ${them.name} · Orbit`,
          start: scheduledAt,
          minutes: durationMin,
          details: reason,
          location: venue,
        });
        const m = coffeeConfirmedEmail({
          recipientFirstName: me.name.split(" ")[0],
          otherName: them.name,
          whenLabel: label,
          venue,
          calendarUrl,
        });
        sends.push(sendEmail({ to: me.email, subject: m.subject, html: m.html, text: m.text }));
      }
    } else if (event === "cancelled") {
      if (isSendableAddress(counterpart.email)) {
        const m = coffeeCancelledEmail({
          recipientFirstName: counterpart.name.split(" ")[0],
          otherName: actor.name,
          whenLabel: label,
        });
        sends.push(sendEmail({ to: counterpart.email, subject: m.subject, html: m.html, text: m.text }));
      }
    }

    await Promise.allSettled(sends);
  } catch (e) {
    console.warn("[notifyMeeting] failed:", e);
  }
}
