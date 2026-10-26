"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { setSessionCookie, authReady } from "@/lib/auth";
import { emailEnabled, sendEmail, magicLinkEmail, isSendableAddress } from "@/lib/email";
import { createLoginToken, magicLinkUrl } from "@/lib/magic";

const IS_PROD = process.env.NODE_ENV === "production";

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(80).optional(),
  mode: z.string().optional(),
});

// Primary entry point. When email is configured, sends a one-time magic link
// (secure). When it isn't (local dev / email not set up yet), falls back to an
// immediate session so the app is still usable.
export async function requestMagicLink(formData: FormData) {
  const parsed = schema.safeParse({
    email: String(formData.get("email") || "").trim().toLowerCase(),
    name: String(formData.get("name") || "").trim() || undefined,
    mode: String(formData.get("mode") || "") || undefined,
  });
  if (!parsed.success) redirect("/login?error=invalid");

  const { email, name, mode } = parsed.data;
  const isSignup = mode !== "login";

  // Secure path: email a one-time magic link (verified sign-in).
  if (emailEnabled() && authReady) {
    // Never send to reserved/demo domains (undeliverable → hard bounces). Show
    // the same confirmation so we don't leak which addresses exist.
    if (!isSendableAddress(email)) {
      redirect(`/login?sent=1&mode=${isSignup ? "signup" : "login"}`);
    }
    const raw = await createLoginToken(email, name);
    const mail = magicLinkEmail({ url: magicLinkUrl(raw), isSignup });
    // Best-effort send: a provider hiccup must not throw the action. We still
    // show the confirmation (and don't leak whether the email exists).
    try {
      await sendEmail({ to: email, subject: mail.subject, html: mail.html, text: mail.text });
    } catch (e) {
      console.warn("[requestMagicLink] email send failed:", e);
    }
    redirect(`/login?sent=1&mode=${isSignup ? "signup" : "login"}`);
  }

  // In production we NEVER sign in without verifying the email (no "log in as
  // anyone"). If email/auth isn't configured, sign-in is unavailable.
  if (IS_PROD) {
    redirect("/login?error=unavailable");
  }

  // Dev convenience only: no email provider locally — sign in directly.
  await directSignIn(email, name);
}

// Shared direct sign-in (fallback). Creates the user if new, sets the session.
async function directSignIn(email: string, name?: string): Promise<never> {
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
