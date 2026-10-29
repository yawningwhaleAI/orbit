"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ALL_SLOT_KEYS } from "@/lib/availability";

export async function saveAvailability(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const valid = new Set(ALL_SLOT_KEYS);
  const keys = String(formData.get("slots") || "")
    .split(",")
    .map((k) => k.trim())
    .filter((k) => valid.has(k));

  await db.availability.deleteMany({ where: { userId: user.id } });
  if (keys.length) {
    await db.availability.createMany({
      data: keys.map((k) => {
        const [weekday, slot] = k.split("-");
        return { userId: user.id, weekday: Number(weekday), slot };
      }),
    });
  }
  await db.user.update({ where: { id: user.id }, data: { availabilitySet: true } });

  revalidatePath("/home");
  redirect(formData.get("welcome") ? "/home" : "/availability?saved=1");
}
