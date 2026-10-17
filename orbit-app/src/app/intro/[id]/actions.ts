"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { nextThursday3pm } from "@/lib/week";

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
    include: { building: true },
  });
  if (!match || match.ownerId !== user.id) redirect("/home");

  if (decision === "accept") {
    const when = parseSlot(formData.get("scheduledAt")) ?? nextThursday3pm();
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
          venue: `${match.building.cafeName}, ${match.building.name}`,
          status: "booked",
        },
      });
    }
    // In production this is where the calendar invite + WhatsApp/email fire.
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
