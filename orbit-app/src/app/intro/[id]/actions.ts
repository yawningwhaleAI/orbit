"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { nextThursday3pm } from "@/lib/week";
import { hasClash } from "@/lib/meetings";
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
    const when = parseSlot(formData.get("scheduledAt")) ?? nextThursday3pm();
    const venue = `${match.building.cafeName}, ${match.building.name}`;

    if (await hasClash([user.id, match.otherId], when, match.id)) {
      redirect(`/intro/${match.id}?error=slot_taken`);
    }

    await db.match.update({
      where: { id: match.id },
      data: { status: "accepted", respondedAt: new Date() },
    });

    const meeting = await db.meeting.upsert({
      where: { matchId: match.id },
      update: { scheduledAt: when, venue, status: "proposed", proposedById: user.id, respondedAt: null },
      create: { matchId: match.id, scheduledAt: when, venue, status: "proposed", proposedById: user.id },
    });

    await notifyMeeting("proposed", {
      meetingId: meeting.id,
      scheduledAt: when,
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
