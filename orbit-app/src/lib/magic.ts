// Magic-link sign-in: generate a one-time token, email a link, and verify it.
// We store only a SHA-256 hash of the token; the raw token lives solely in the
// emailed URL. Tokens are single-use and expire after TTL_MINUTES.

import { createHash, randomBytes } from "crypto";
import { db } from "./db";

const TTL_MINUTES = 20;

function hash(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function appUrl(): string {
  return (process.env.APP_URL?.trim() || "https://withinorbit.space").replace(/\/+$/, "");
}

// Create a login token for an email and return the raw token (for the link).
export async function createLoginToken(email: string, name?: string): Promise<string> {
  const raw = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TTL_MINUTES * 60 * 1000);
  await db.loginToken.create({
    data: { tokenHash: hash(raw), email, name: name || null, expiresAt },
  });
  return raw;
}

export function magicLinkUrl(raw: string): string {
  return `${appUrl()}/api/auth/verify?token=${raw}`;
}

// Verify and consume a token. Returns the email/name if valid, else null.
export async function consumeLoginToken(
  raw: string
): Promise<{ email: string; name?: string | null } | null> {
  if (!raw) return null;
  const rec = await db.loginToken.findUnique({ where: { tokenHash: hash(raw) } });
  if (!rec) return null;
  if (rec.usedAt) return null;
  if (rec.expiresAt.getTime() < Date.now()) return null;
  // Mark used immediately (single-use).
  await db.loginToken.update({ where: { id: rec.id }, data: { usedAt: new Date() } });
  return { email: rec.email, name: rec.name };
}
