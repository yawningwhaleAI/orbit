"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { nextThursday3pm } from "@/lib/week";

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
    await db.match.update({
      where: { id: match.id },
      data: { status: "accepted", respondedAt: new Date() },
    });
    const existing = await db.meeting.findUnique({ where: { matchId: match.id } });
    if (!existing) {
      await db.meeting.create({
        data: {
          matchId: match.id,
          scheduledAt: nextThursday3pm(),
          venue: `${match.building.cafeName}, ${match.building.name}`,
          status: "booked",
        },
      });
    }
    // In production this is where WhatsApp/email + calendar invites fire.
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
