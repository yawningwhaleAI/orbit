// Lightweight session auth: a signed JWT in an httpOnly cookie.
//
// Dev login is email-based (enter email + name). Production can add Google
// OAuth / email OTP on top of this same session mechanism without changing
// the rest of the app. Kept dependency-light (just `jose`) and fully
// server-side so it's a real backend session, not client state.

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { db } from "./db";

const COOKIE = "orbit_session";
const IS_PROD = process.env.NODE_ENV === "production";

// Resolve the signing secret WITHOUT an insecure production fallback. In prod we
// require a real AUTH_SECRET (>=32 chars); if it's missing or weak, auth is
// DISABLED (no sessions issued or accepted) rather than falling back to a known
// default that would let anyone forge a session cookie. Dev gets a local secret.
const RAW = process.env.AUTH_SECRET?.trim();
const DEV_SECRET = "dev-only-insecure-secret-not-used-in-production-000";
const effectiveSecret = RAW && RAW.length >= 32 ? RAW : IS_PROD ? null : RAW || DEV_SECRET;

// True when auth can safely operate. When false (prod + no strong secret),
// login is unavailable and no cookie is trusted — a safe failure, not a hole.
export const authReady = !!effectiveSecret;

const secret = new TextEncoder().encode(effectiveSecret || "disabled");

export async function signSession(userId: string): Promise<string> {
  if (!authReady) throw new Error("AUTH_SECRET not configured");
  return new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function setSessionCookie(userId: string): Promise<void> {
  const token = await signSession(userId);
  cookies().set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: IS_PROD,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSessionCookie(): void {
  cookies().set(COOKIE, "", { path: "/", maxAge: 0 });
}

export async function getSessionUserId(): Promise<string | null> {
  if (!authReady) return null;
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return (payload.uid as string) || null;
  } catch {
    return null;
  }
}

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export async function getCurrentUser() {
  const uid = await getSessionUserId();
  if (!uid) return null;
  const user = await db.user.findUnique({
    where: { id: uid },
    include: { building: true, tags: true },
  });
  return user;
}
