"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { nextThursday3pm } from "@/lib/week";
import { hasClash, canOffer } from "@/lib/meetings";
import { parseDuration } from "@/lib/slots";
import { appUrl } from "@/lib/magic";
import { sendEmail, isSendableAddress, moreTimesRequestEmail } from "@/lib/email";
import { notifyMeeting } from "@/lib/meeting-notify";

function parseSlot(v: FormDataEntryValue | null): Date | null {
  const s = String(v || "");
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  const now = Date.now();
  if (d.getTime() < now || d.getTime() > now + 21 * 24 * 3600 * 1000) return null;
  return d;
}

// The owner responds to an intro: propose a coffee time (two-sided — the other
// person then confirms), or pass.
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
    const picked = parseSlot(formData.get("scheduledAt"));
    const when = picked ?? nextThursday3pm();
    const durationMin = parseDuration(formData.get("durationMin"));
    const custom = formData.get("custom") === "1";
    if (picked && !(await canOffer(match.otherId, picked, durationMin, custom))) {
      redirect(`/intro/${match.id}?error=slot_taken`);
    }
    const venue = `${match.building.cafeName}, ${match.building.name}`;

    if (await hasClash([user.id, match.otherId], when, durationMin, match.id)) {
      redirect(`/intro/${match.id}?error=slot_taken`);
    }

    await db.match.update({
      where: { id: match.id },
      data: { status: "accepted", respondedAt: new Date() },
    });

    const meeting = await db.meeting.upsert({
      where: { matchId: match.id },
      update: { scheduledAt: when, durationMin, venue, status: "proposed", proposedById: user.id, respondedAt: null },
      create: { matchId: match.id, scheduledAt: when, durationMin, venue, status: "proposed", proposedById: user.id },
    });

    await notifyMeeting("proposed", {
      meetingId: meeting.id,
      scheduledAt: when,
      durationMin,
      venue,
      reason: match.reason,
      owner: { id: user.id, name: user.name, email: user.email, role: user.role },
      other: { id: match.other.id, name: match.other.name, email: match.other.email, role: match.other.role },
      actorId: user.id,
    });

    revalidatePath("/home");
    redirect(`/meeting/${meeting.id}`);
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

// No shared free time: nudge the other person to open up slots (max once / 24h).
export async function requestMoreTimes(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const matchId = String(formData.get("matchId") || "");
  const match = await db.match.findUnique({ where: { id: matchId }, include: { other: true } });
  if (!match || match.ownerId !== user.id) redirect("/home");

  const recent = match.nudgedAt && Date.now() - match.nudgedAt.getTime() < 24 * 3600 * 1000;
  if (!recent) {
    await db.match.update({ where: { id: match.id }, data: { nudgedAt: new Date() } });
    if (isSendableAddress(match.other.email)) {
      const m = moreTimesRequestEmail({
        recipientFirstName: match.other.name.split(" ")[0],
        requesterName: user.name,
        availabilityUrl: `${appUrl()}/availability`,
      });
      await sendEmail({ to: match.other.email, subject: m.subject, html: m.html, text: m.text });
    }
  }
  redirect(`/intro/${match.id}?asked=1`);
}
