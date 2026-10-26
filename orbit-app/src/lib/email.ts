// Optional email layer. If RESEND_API_KEY is set we send transactional email
// via Resend's REST API; otherwise we log and no-op so the app still works
// locally and on a fresh deploy. No SDK dependency — plain fetch keeps the
// app lean and the dependency truly optional (same pattern as llm.ts).
//
// Env:
//   RESEND_API_KEY   — from resend.com (free tier works for a pilot)
//   EMAIL_FROM       — e.g. "Orbit <onboarding@resend.dev>" (default below)
//
// Note: on Resend's free tier without a verified domain you can only send
// from onboarding@resend.dev and only to the address you signed up with.
// Verify a domain in Resend to email any member.

function env(key: string): string | undefined {
  const v = process.env[key];
  return v && v.trim() ? v.trim() : undefined;
}

export function emailEnabled(): boolean {
  return !!env("RESEND_API_KEY");
}

// Synthetic demo accounts use @orbit.app addresses that don't receive mail.
// Skip them so we never rack up bounces (which hurt sender reputation).
// Real sign-ups use their own addresses and always get notified.
const DEMO_EMAIL_DOMAINS = ["@example.com", "@example.org", "@example.net", "@orbit.app"];

export function isSendableAddress(email: string | null | undefined): boolean {
  if (!email) return false;
  const e = email.trim().toLowerCase();
  if (!e.includes("@")) return false;
  // Seed/demo accounts use reserved, undeliverable domains — never email them.
  if (DEMO_EMAIL_DOMAINS.some((d) => e.endsWith(d))) return false;
  return true;
}

const FROM = env("EMAIL_FROM") || "Orbit <onboarding@resend.dev>";

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(
  input: SendEmailInput
): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const key = env("RESEND_API_KEY");
  if (!key) {
    console.log(`[email] skipped (no RESEND_API_KEY) → would send "${input.subject}" to ${input.to}`);
    return { ok: false, skipped: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        from: FROM,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.warn("[email] send failed", res.status, body);
      return { ok: false, error: `${res.status} ${body}` };
    }
    return { ok: true };
  } catch (e) {
    console.warn("[email] request failed:", e);
    return { ok: false, error: String(e) };
  }
}

// ── Templates ──────────────────────────────────────────────────────────────

const WRAP = (inner: string) => `
<div style="margin:0;padding:0;background:#f5f1ea;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:32px 20px;">
    <div style="font-size:20px;font-weight:700;letter-spacing:-0.01em;color:#b45a1f;margin-bottom:20px;">Orbit</div>
    <div style="background:#ffffff;border:1px solid #e9e1d4;border-radius:16px;padding:28px;">
      ${inner}
    </div>
    <p style="color:#9b9183;font-size:12px;text-align:center;margin-top:20px;">
      Orbit — the professional network inside your building.
    </p>
  </div>
</div>`;

export function magicLinkEmail(opts: {
  url: string;
  isSignup: boolean;
}): { subject: string; html: string; text: string } {
  const subject = opts.isSignup ? "Finish signing up for Orbit" : "Your Orbit sign-in link";
  const html = WRAP(`
    <h1 style="font-size:22px;margin:0 0 6px;color:#1c1917;">${
      opts.isSignup ? "Welcome to Orbit" : "Sign in to Orbit"
    }</h1>
    <p style="font-size:15px;color:#44403c;margin:0 0 20px;">
      Click the button below to ${opts.isSignup ? "create your account" : "sign in"}. This link
      works once and expires in 20 minutes.
    </p>
    <a href="${opts.url}" style="display:inline-block;background:#b45a1f;color:#fff;text-decoration:none;font-size:15px;font-weight:600;padding:13px 24px;border-radius:10px;">
      ${opts.isSignup ? "Create my account" : "Sign in"}
    </a>
    <p style="font-size:13px;color:#9b9183;margin:22px 0 0;">
      If you didn't request this, you can ignore this email. Link: <br/>
      <span style="word-break:break-all;color:#78716c;">${opts.url}</span>
    </p>
  `);
  const text = `${opts.isSignup ? "Create your Orbit account" : "Sign in to Orbit"} (link works once, expires in 20 min):\n${opts.url}`;
  return { subject, html, text };
}

export function coffeeProposedEmail(opts: {
  recipientFirstName: string;
  proposerName: string;
  proposerRole?: string | null;
  whenLabel: string;
  venue: string;
  meetingUrl: string;
}): { subject: string; html: string; text: string } {
  const role = opts.proposerRole ? ` (${opts.proposerRole})` : "";
  const subject = `${opts.proposerName} wants to grab a coffee`;
  const html = WRAP(`
    <h1 style="font-size:22px;margin:0 0 6px;color:#1c1917;">A coffee invite ☕</h1>
    <p style="font-size:15px;color:#44403c;margin:0 0 18px;">
      Hi ${opts.recipientFirstName}, <strong>${opts.proposerName}</strong>${role} picked you as one
      of their intros this week and proposed a time. Confirm it, or suggest another.
    </p>
    <table style="width:100%;font-size:14px;color:#1c1917;border-collapse:collapse;">
      <tr><td style="padding:8px 0;color:#78716c;width:90px;">When</td><td style="padding:8px 0;font-weight:600;">${opts.whenLabel}</td></tr>
      <tr><td style="padding:8px 0;color:#78716c;">Where</td><td style="padding:8px 0;font-weight:600;">${opts.venue}</td></tr>
    </table>
    <a href="${opts.meetingUrl}" style="display:inline-block;margin-top:20px;background:#b45a1f;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 20px;border-radius:10px;">
      Confirm or reschedule
    </a>
  `);
  const text = `${opts.proposerName}${role} proposed a coffee.
When: ${opts.whenLabel}
Where: ${opts.venue}
Confirm or reschedule: ${opts.meetingUrl}`;
  return { subject, html, text };
}

export function coffeeConfirmedEmail(opts: {
  recipientFirstName: string;
  otherName: string;
  whenLabel: string;
  venue: string;
  calendarUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = `Coffee confirmed with ${opts.otherName}`;
  const html = WRAP(`
    <h1 style="font-size:22px;margin:0 0 6px;color:#1c1917;">Coffee confirmed ✓</h1>
    <p style="font-size:15px;color:#44403c;margin:0 0 18px;">
      Hi ${opts.recipientFirstName}, you're all set to meet <strong>${opts.otherName}</strong>.
    </p>
    <table style="width:100%;font-size:14px;color:#1c1917;border-collapse:collapse;">
      <tr><td style="padding:8px 0;color:#78716c;width:90px;">When</td><td style="padding:8px 0;font-weight:600;">${opts.whenLabel}</td></tr>
      <tr><td style="padding:8px 0;color:#78716c;">Where</td><td style="padding:8px 0;font-weight:600;">${opts.venue}</td></tr>
    </table>
    <a href="${opts.calendarUrl}" style="display:inline-block;margin-top:20px;background:#b45a1f;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 20px;border-radius:10px;">
      Add to Google Calendar
    </a>
  `);
  const text = `Coffee confirmed with ${opts.otherName}.
When: ${opts.whenLabel}
Where: ${opts.venue}
Add to calendar: ${opts.calendarUrl}`;
  return { subject, html, text };
}

export function coffeeCancelledEmail(opts: {
  recipientFirstName: string;
  otherName: string;
  whenLabel: string;
}): { subject: string; html: string; text: string } {
  const subject = `Coffee with ${opts.otherName} was cancelled`;
  const html = WRAP(`
    <h1 style="font-size:22px;margin:0 0 6px;color:#1c1917;">Coffee cancelled</h1>
    <p style="font-size:15px;color:#44403c;margin:0 0 6px;">
      Hi ${opts.recipientFirstName}, your coffee with <strong>${opts.otherName}</strong>
      (${opts.whenLabel}) has been cancelled. No worries — Orbit will suggest someone new.
    </p>
  `);
  const text = `Your coffee with ${opts.otherName} (${opts.whenLabel}) was cancelled.`;
  return { subject, html, text };
}

export function coffeeBookedEmail(opts: {
  memberFirstName: string;
  otherName: string;
  otherRole?: string | null;
  whenLabel: string;
  venue: string;
  calendarUrl: string;
}): { subject: string; html: string; text: string } {
  const role = opts.otherRole ? ` (${opts.otherRole})` : "";
  const subject = `Coffee booked with ${opts.otherName}`;
  const html = WRAP(`
    <h1 style="font-size:22px;margin:0 0 6px;color:#1c1917;">Coffee booked ☕</h1>
    <p style="font-size:15px;color:#44403c;margin:0 0 20px;">
      Hi ${opts.memberFirstName}, you're all set to meet <strong>${opts.otherName}</strong>${role}.
      We've let them know too.
    </p>
    <table style="width:100%;font-size:14px;color:#1c1917;border-collapse:collapse;">
      <tr><td style="padding:8px 0;color:#78716c;width:90px;">When</td><td style="padding:8px 0;font-weight:600;">${opts.whenLabel}</td></tr>
      <tr><td style="padding:8px 0;color:#78716c;">Where</td><td style="padding:8px 0;font-weight:600;">${opts.venue}</td></tr>
    </table>
    <a href="${opts.calendarUrl}" style="display:inline-block;margin-top:22px;background:#b45a1f;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 20px;border-radius:10px;">
      Add to Google Calendar
    </a>
    <p style="font-size:13px;color:#9b9183;margin:22px 0 0;">
      Orbit does the awkward middle. You just show up.
    </p>
  `);
  const text = `Coffee booked with ${opts.otherName}${role}.
When: ${opts.whenLabel}
Where: ${opts.venue}
Add to calendar: ${opts.calendarUrl}`;
  return { subject, html, text };
}

// Sent to the OTHER person — the one the booker chose to meet.
export function coffeeInvitedEmail(opts: {
  recipientFirstName: string;
  bookerName: string;
  bookerRole?: string | null;
  whenLabel: string;
  venue: string;
  calendarUrl: string;
}): { subject: string; html: string; text: string } {
  const role = opts.bookerRole ? ` (${opts.bookerRole})` : "";
  const subject = `${opts.bookerName} booked a coffee with you`;
  const html = WRAP(`
    <h1 style="font-size:22px;margin:0 0 6px;color:#1c1917;">You've got a coffee ☕</h1>
    <p style="font-size:15px;color:#44403c;margin:0 0 20px;">
      Hi ${opts.recipientFirstName}, <strong>${opts.bookerName}</strong>${role} picked you as
      one of their three intros this week and booked a time. Just show up.
    </p>
    <table style="width:100%;font-size:14px;color:#1c1917;border-collapse:collapse;">
      <tr><td style="padding:8px 0;color:#78716c;width:90px;">When</td><td style="padding:8px 0;font-weight:600;">${opts.whenLabel}</td></tr>
      <tr><td style="padding:8px 0;color:#78716c;">Where</td><td style="padding:8px 0;font-weight:600;">${opts.venue}</td></tr>
    </table>
    <a href="${opts.calendarUrl}" style="display:inline-block;margin-top:22px;background:#b45a1f;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 20px;border-radius:10px;">
      Add to Google Calendar
    </a>
    <p style="font-size:13px;color:#9b9183;margin:22px 0 0;">
      Orbit does the awkward middle. You just show up.
    </p>
  `);
  const text = `${opts.bookerName}${role} booked a coffee with you.
When: ${opts.whenLabel}
Where: ${opts.venue}
Add to calendar: ${opts.calendarUrl}`;
  return { subject, html, text };
}
