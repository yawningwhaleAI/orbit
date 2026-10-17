"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { nextThursday3pm } from "@/lib/week";
import { googleCalendarUrl } from "@/lib/slots";
import { sendEmail, coffeeBookedEmail, coffeeInvitedEmail, isSendableAddress } from "@/lib/email";

function parseSlot(v: FormDataEntryValue | null): Date | null {
  const s = String(v || "");
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  // Must be in the future and within the next 21 days.
  const now = Date.now();
  if (d.getTime() < now || d.getTime() > now + 21 * 24 * 3600 * 1000) return null;
  return d;
}

export async function respond(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const matchId = String(formData.get("matchId") || "");
  const decision = String(formData.get("decision") || "");

  const match = await db.match.findUnique({
    where: { id: matchId },
    include: { building: true, other: true },
  });
  if (!match || match.ownerId !== user.id) redirect("/home");

  if (decision === "accept") {
    const when = parseSlot(formData.get("scheduledAt")) ?? nextThursday3pm();
    const venue = `${match.building.cafeName}, ${match.building.name}`;

    // Guard against double-booking: if either person already has a coffee within
    // an hour of this time (on a different match), the slot is taken.
    const clash = await db.meeting.findFirst({
      where: {
        status: { in: ["booked", "held"] },
        matchId: { not: match.id },
        match: {
          OR: [
            { ownerId: user.id },
            { otherId: user.id },
            { ownerId: match.otherId },
            { otherId: match.otherId },
          ],
        },
        scheduledAt: {
          gte: new Date(when.getTime() - 60 * 60000),
          lte: new Date(when.getTime() + 60 * 60000),
        },
      },
    });
    if (clash) {
      redirect(`/intro/${match.id}?error=slot_taken`);
    }

    await db.match.update({
      where: { id: match.id },
      data: { status: "accepted", respondedAt: new Date() },
    });
    const existing = await db.meeting.findUnique({ where: { matchId: match.id } });
    if (existing) {
      await db.meeting.update({ where: { matchId: match.id }, data: { scheduledAt: when } });
    } else {
      await db.meeting.create({
        data: {
          matchId: match.id,
          scheduledAt: when,
          venue,
          status: "booked",
        },
      });
    }

    // Send the confirmation email to the member. Non-blocking: a failure here
    // must never break the booking. No-ops cleanly when RESEND_API_KEY is unset.
    try {
      const whenLabel = when.toLocaleString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      });
      const calendarUrl = googleCalendarUrl({
        title: `Coffee with ${match.other.name} · Orbit`,
        start: when,
        minutes: 15,
        details: match.reason,
        location: venue,
      });
      const mail = coffeeBookedEmail({
        memberFirstName: user.name.split(" ")[0],
        otherName: match.other.name,
        otherRole: match.other.role,
        whenLabel,
        venue,
        calendarUrl,
      });
      // Notify the booker (always) and the other person (if a real address).
      const sends: Promise<unknown>[] = [];
      if (isSendableAddress(user.email)) {
        sends.push(sendEmail({ to: user.email, subject: mail.subject, html: mail.html, text: mail.text }));
      }
      if (isSendableAddress(match.other.email)) {
        const invite = coffeeInvitedEmail({
          recipientFirstName: match.other.name.split(" ")[0],
          bookerName: user.name,
          bookerRole: user.role,
          whenLabel,
          venue,
          calendarUrl,
        });
        sends.push(sendEmail({ to: match.other.email, subject: invite.subject, html: invite.html, text: invite.text }));
      }
      await Promise.allSettled(sends);
    } catch (e) {
      console.warn("[intro.respond] email failed:", e);
    }
  } else if (decision === "pass") {
    await db.match.update({
      where: { id: match.id },
      data: { status: "passed", respondedAt: new Date() },
    });
  }

  revalidatePath(`/intro/${match.id}`);
  revalidatePath("/home");
  redirect(`/intro/${match.id}`);
}
