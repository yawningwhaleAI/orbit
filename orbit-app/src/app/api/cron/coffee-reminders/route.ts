import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { googleCalendarUrl } from "@/lib/slots";
import { sendEmail, isSendableAddress, coffeeReminderEmail, proposalNudgeEmail } from "@/lib/email";
import { appUrl } from "@/lib/magic";

// Daily reminder job: emails both participants of a confirmed coffee happening
// in the next ~26 hours (once). Lifts show-up rate. Protected by CRON_SECRET;
// Vercel Cron sends the Authorization header automatically (see vercel.json).

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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

async function handle(req: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  const auth = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!secret || auth !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const horizon = new Date(now.getTime() + 26 * 3600 * 1000);

  const due = await db.meeting.findMany({
    where: {
      status: "confirmed",
      reminderSentAt: null,
      scheduledAt: { gte: now, lte: horizon },
    },
    include: { match: { include: { owner: true, other: true } } },
  });

  let sent = 0;
  for (const m of due) {
    const label = whenLabel(m.scheduledAt);
    for (const [me, them] of [
      [m.match.owner, m.match.other],
      [m.match.other, m.match.owner],
    ] as const) {
      if (!isSendableAddress(me.email)) continue;
      const calendarUrl = googleCalendarUrl({
        title: `Coffee with ${them.name} · Orbit`,
        start: m.scheduledAt,
        minutes: 15,
        details: m.match.reason,
        location: m.venue,
      });
      const mail = coffeeReminderEmail({
        recipientFirstName: me.name.split(" ")[0],
        otherName: them.name,
        whenLabel: label,
        venue: m.venue,
        calendarUrl,
      });
      const r = await sendEmail({ to: me.email, subject: mail.subject, html: mail.html, text: mail.text });
      if (r.ok) sent++;
    }
    await db.meeting.update({ where: { id: m.id }, data: { reminderSentAt: now } });
  }

  // Chase proposals the invitee hasn't answered within 24h (once each).
  const stale = await db.meeting.findMany({
    where: {
      status: "proposed",
      pendingNudgeAt: null,
      createdAt: { lte: new Date(now.getTime() - 24 * 3600 * 1000) },
      scheduledAt: { gt: now },
    },
    include: { match: { include: { owner: true, other: true } } },
  });
  let nudged = 0;
  for (const m of stale) {
    const proposer = m.proposedById === m.match.otherId ? m.match.other : m.match.owner;
    const invitee = proposer.id === m.match.ownerId ? m.match.other : m.match.owner;
    if (isSendableAddress(invitee.email)) {
      const mail = proposalNudgeEmail({
        recipientFirstName: invitee.name.split(" ")[0],
        proposerName: proposer.name,
        whenLabel: whenLabel(m.scheduledAt),
        meetingUrl: `${appUrl()}/meeting/${m.id}`,
      });
      const r = await sendEmail({ to: invitee.email, subject: mail.subject, html: mail.html, text: mail.text });
      if (r.ok) nudged++;
    }
    await db.meeting.update({ where: { id: m.id }, data: { pendingNudgeAt: now } });
  }

  return NextResponse.json({ ok: true, meetings: due.length, emailsSent: sent, nudged });
}

export const GET = handle;
export const POST = handle;
