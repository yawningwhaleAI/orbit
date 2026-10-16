"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { setSessionCookie } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(80).optional(),
});

export async function login(formData: FormData) {
  const parsed = schema.safeParse({
    email: String(formData.get("email") || "").trim().toLowerCase(),
    name: String(formData.get("name") || "").trim() || undefined,
  });

  if (!parsed.success) {
    redirect("/login?error=invalid");
  }

  const { email, name } = parsed.data;

  let user = await db.user.findUnique({ where: { email } });
  if (!user) {
    user = await db.user.create({
      data: {
        email,
        name: name || email.split("@")[0],
        avatarSeed: (name || email)[0]?.toUpperCase(),
        onboarded: false,
      },
    });
  }

  await setSessionCookie(user.id);

  if (user.isOperator) redirect("/dashboard");
  if (!user.onboarded) redirect("/onboarding");
  redirect("/home");
}
