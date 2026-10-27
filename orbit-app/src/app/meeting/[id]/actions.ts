"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasClash } from "@/lib/meetings";
import { notifyMeeting, type Party } from "@/lib/meeting-notify";

function parseSlot(v: FormDataEntryValue | null): Date | null {
  const s = String(v || "");
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  const now = Date.now();
  if (d.getTime() < now || d.getTime() > now + 21 * 24 * 3600 * 1000) return null;
  return d;
}

// Load a meeting the current user participates in (owner or other of the match).
async function loadParticipantMeeting(meetingId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const meeting = await db.meeting.findUnique({
    where: { id: meetingId },
    include: { match: { include: { owner: true, other: true } } },
  });
  if (!meeting) redirect("/home");
  const m = meeting.match;
  if (m.ownerId !== user.id && m.otherId !== user.id) redirect("/home");
  return { user, meeting, match: m };
}

function parties(match: { owner: any; other: any }): { owner: Party; other: Party } {
  return {
    owner: { id: match.owner.id, name: match.owner.name, email: match.owner.email, role: match.owner.role },
    other: { id: match.other.id, name: match.other.name, email: match.other.email, role: match.other.role },
  };
}

export async function confirmMeeting(formData: FormData) {
  const id = String(formData.get("meetingId") || "");
  const { user, meeting, match } = await loadParticipantMeeting(id);
  // Only the person who did NOT propose can confirm.
  if (meeting.status === "proposed" && meeting.proposedById !== user.id) {
    await db.meeting.update({
      where: { id: meeting.id },
      data: { status: "confirmed", respondedAt: new Date() },
    });
    const p = parties(match);
    await notifyMeeting("confirmed", {
      meetingId: meeting.id,
      scheduledAt: meeting.scheduledAt,
      venue: meeting.venue,
      reason: match.reason,
      owner: p.owner,
      other: p.other,
      actorId: user.id,
    });
  }
  revalidatePath(`/meeting/${id}`);
  redirect(`/meeting/${id}`);
}

export async function cancelMeeting(formData: FormData) {
  const id = String(formData.get("meetingId") || "");
  const { user, meeting, match } = await loadParticipantMeeting(id);
  if (meeting.status === "proposed" || meeting.status === "confirmed") {
    await db.meeting.update({ where: { id: meeting.id }, data: { status: "cancelled" } });
    // Return the intro to the owner's list as open so it can be re-proposed.
    await db.match.update({ where: { id: match.id }, data: { status: "proposed" } });
    const p = parties(match);
    await notifyMeeting("cancelled", {
      meetingId: meeting.id,
      scheduledAt: meeting.scheduledAt,
      venue: meeting.venue,
      reason: match.reason,
      owner: p.owner,
      other: p.other,
      actorId: user.id,
    });
  }
  revalidatePath(`/meeting/${id}`);
  revalidatePath("/home");
  redirect(`/meeting/${id}`);
}

export async function rescheduleMeeting(formData: FormData) {
  const id = String(formData.get("meetingId") || "");
  const { user, meeting, match } = await loadParticipantMeeting(id);
  // Only an active coffee can be rescheduled — not a cancelled or past-held one.
  if (meeting.status !== "proposed" && meeting.status !== "confirmed" && meeting.status !== "booked") {
    redirect(`/meeting/${id}`);
  }
  const when = parseSlot(formData.get("scheduledAt"));
  if (!when) redirect(`/meeting/${id}?error=bad_time`);
  if (await hasClash([match.ownerId, match.otherId], when, match.id)) {
    redirect(`/meeting/${id}?error=slot_taken`);
  }
  // New time needs the other side to confirm again.
  await db.meeting.update({
    where: { id: meeting.id },
    data: { scheduledAt: when, status: "proposed", proposedById: user.id, respondedAt: null },
  });
  const p = parties(match);
  await notifyMeeting("proposed", {
    meetingId: meeting.id,
    scheduledAt: when,
    venue: meeting.venue,
    reason: match.reason,
    owner: p.owner,
    other: p.other,
    actorId: user.id,
  });
  revalidatePath(`/meeting/${id}`);
  redirect(`/meeting/${id}`);
}

// Post-coffee feedback from one participant: did you meet, was it worth it?
export async function submitFeedback(formData: FormData) {
  const id = String(formData.get("meetingId") || "");
  const { user, meeting } = await loadParticipantMeeting(id);

  const showed = String(formData.get("showed") || "") === "yes";
  const worthwhileRaw = String(formData.get("worthwhile") || "");
  const worthwhile = showed ? worthwhileRaw === "yes" : null;
  const note = String(formData.get("note") || "").trim().slice(0, 500) || null;

  await db.meetingFeedback.upsert({
    where: { meetingId_userId: { meetingId: meeting.id, userId: user.id } },
    update: { showed, worthwhile, note },
    create: { meetingId: meeting.id, userId: user.id, showed, worthwhile, note },
  });

  // Once anyone confirms the coffee happened, mark it held (completed).
  if (showed && meeting.status !== "held") {
    await db.meeting.update({ where: { id: meeting.id }, data: { status: "held" } });
  }

  revalidatePath(`/meeting/${id}`);
  revalidatePath("/home");
  redirect(`/meeting/${id}?thanks=1`);
}
