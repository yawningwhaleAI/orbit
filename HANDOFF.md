# Orbit — Project Handoff

> **Purpose of this file:** everything a new AI agent or developer needs to
> continue building Orbit without the original chat history. Read this first,
> then `orbit-app/README.md`, `orbit-app/DEPLOY.md`, and `CONTEXT.md`.
> Last updated: 2026-11-16 (see section 0 for the latest state).

---

## 0. LATEST STATE: read this first (updated 2026-11-16)

> Sections 1 to 16 below are from 2026-10-27 and partly outdated (for example, they say "15-minute coffee"). Where they disagree with this section, this section wins. For marketing and positioning, see `MARKETING.md`.

**Owner:** Aryan Singh (`@yawningwhale21` on Product Hunt). Non-technical and on a tight budget, so give short, numbered, click-by-click steps.

**Workflow:** commit on branch `claude/orbit-landing-page-ejo0rn`, then push the same commit to `main`, which auto-deploys on Vercel (project `orbit-app`, team `yawningwhaleais-projects`). Schema changes are applied by `prisma db push` during the Vercel build (`scripts/vercel-prebuild.mjs`). **Never commit secrets or real members' personal data.**

### Product as it works now
- **Sign-up:** magic-link email. The profile requires building, name, **phone (WhatsApp)** and **LinkedIn** (validated, saved as `https://www.linkedin.com/in/<handle>`), plus give/want tags. **Resume autofill is hidden** (`RESUME_AUTOFILL = false` in `components/onboarding-form.tsx`) because the free AI was too slow.
- **Free times** (`/availability`): a weekly grid of one-hour blocks, Mon–Fri 10:00–18:00 IST (model `Availability`, `User.availabilitySet`). Shown as the last onboarding step. Saving returns to `/home`.
- **Matching** (`lib/matching.ts`):
  - **Pool:** across **all buildings in the same city**, because the pilot buildings are a short walk apart.
  - **Scoring:** two-way give/want word overlap, plus bonuses for both directions, seniority, same-building nearby floors, and bio overlap.
  - **Weekly quota:** each week is topped up to 3 intros on onboarding, whenever `/home` has fewer than 3, and by the weekly cron.
  - **Reason lines:** a template by default; AI only if `AI_MATCH_REASONS=on`.
- **Booking** (`components/time-chooser.tsx`):
  - the chooser sees the **other person's** free times (solid = both free, dashed = they'd adjust) or can send a **custom time**;
  - **30 min or 1 hour** (`Meeting.durationMin`);
  - **where to meet:** DLF cafeteria / CDS 2nd floor / CDS canteen (`lib/venues.ts`);
  - the invitee can confirm, decline or suggest another time (counter-offer).
- **Emails** (Resend, from `hello@withinorbit.space`):
  - **Invite:** includes a "New to Orbit?" note for members listed by the team who never signed in (`User.lastLoginAt` null and no phone).
  - **Confirmed:** both get each other's **phone and WhatsApp link** (phone shown only after confirmation).
  - **Declined:** the proposer is told.
  - **Reminders:** a 24-hour nudge if unanswered, and a day-before reminder (cron `/api/cron/coffee-reminders`).
- **Return to the invite after sign-in:** the magic link carries `next=/meeting|intro/<id>`, validated by `safeNext()` in `lib/magic.ts`.
- **"This week"** (`/home`) lists intros plus every coffee from both sides ("needs your reply" is highlighted).
- **Times** are all IST (`lib/slots.ts`).

### Admin tools (all need the `CRON_SECRET` header, `Authorization: Bearer …`, except `/admin/members`)
- `POST /api/admin/add-members`: adds members from a JSON body, `{building, members:[…]}`.
  - It's non-destructive: it skips existing emails, and claims same-name demo placeholders instead of duplicating them.
  - Real members' data is sent this way and **never stored in the repo**.
- `POST /api/admin/remove-demo`: a dry run unless `?confirm=1`. Removes accounts on demo domains (`DEMO_EMAIL_DOMAINS` in `lib/email.ts`: example.com/org/net and orbit.app), then tops up intros. **This has been run on production; the demo people are gone.**
- `GET /api/admin/members-report`: a self-contained HTML report (masked emails, no phones), for screenshots and assignment proof.
- `/admin/members`: the same report as a page, for signed-in users listed in `ADMIN_EMAILS`.
- `POST /api/admin/seed?force=1` **wipes the database**. Never use it on production now that real members exist.

### Environment variables added since 2026-10-27
`TEST_RESET_EMAILS` (these accounts are deleted and recreated on every sign-in, for re-testing onboarding; the owner's test email is set), `ADMIN_EMAILS`, `OFFLINE_COFFEES` (coffees arranged outside the app, added to the coffee totals with an "includes N arranged offline" note), `AI_MATCH_REASONS`, `LLM_PRIMARY=anthropic` (optional Claude-first), `NEXT_PUBLIC_PRODUCT_HUNT_URL` / `NEXT_PUBLIC_PRODUCT_HUNT_LABEL` (homepage launch banner; set the URL to the live PH page once it exists, or "off"). Values live only in Vercel.

**AI status:** the Gemini free quota is exhausted and the OpenRouter free model was removed, so the app currently runs without AI (templates and word-overlap matching).

### Production data (as of 2026-11-16)
- **10 real members** were added via add-members, in DLF Tower, from CVs the owner shared, using their real emails. There are also real self-signups, such as one in CDS.
- Two earlier placeholders from CVs may remain on `@example.com` addresses, for example the owner's own "Aryan Singh" profile.

### Product Hunt
- A draft "Orbit" is fully prepared on the owner's account (`@yawningwhale21`), with launch date **2026-11-16**, but it is **not submitted yet**. Submitting needs the owner's explicit OK on the `submit_launch` preview.
- If the date has passed, pick a new `launchDate` with `update_launch`.
- Draft ID: `RWX5DMYYXM2EDD4LHXUKPW5YIPVMDEH2U3`.
- Launch images are served from `orbit-app/public/launch/` (demo names only).

### Open ideas, not built
Company-email verification at sign-up, WhatsApp reminders, Google Calendar free/busy sync, using shared free time and feedback as matching signals, and a re-enabled resume autofill once there's a paid AI key.

---

## 1. What Orbit is

Orbit is **the professional network for the people inside your building**. Every
week it finds **three reciprocal people worth meeting** (someone who can help
you + someone you can help) and books a **15-minute coffee** downstairs. It is
explicitly **not a feed** — no posts, no likes, no DMs.

- **ICP / buyer:** building operators & coworking managers (multi-tenant towers
  like DLF Cyber City). Sell as a tenant-engagement amenity (~₹15–25k/building/mo);
  free for members.
- **Pilot geography:** Gurugram, India (DLF Tower, CDS, WoCo, Capital Tower).

## 2. Links & accounts

| Thing | Value |
|---|---|
| Live site | https://withinorbit.space |
| GitHub repo | https://github.com/yawningwhaleAI/orbit |
| Default branch (deploys) | `main` |
| Working branch | `claude/orbit-landing-page-ejo0rn` (merged into `main` after each change) |
| Host | Vercel (project `orbit-app`, root dir `orbit-app/`, team `yawningwhaleais-projects`) |
| Domain registrar | GoDaddy (DNS: A `@` → Vercel; see §9) |
| DB | Prisma Postgres (Accelerate) on Vercel |
| Email | Resend |
| AI | OpenRouter (primary), Gemini (backup), Anthropic (optional) |
| Owner email | aryan.singh2027@mastersunion.org / aryanaiagents@gmail.com |

**Workflow convention:** develop on the working branch, commit, then
`git merge` into `main` with `-X theirs` and push — Vercel auto-deploys `main`.

## 3. Tech stack

- **Next.js 14** (App Router, Server Components + Server Actions), TypeScript
- **Tailwind** (brand tokens via CSS vars; light/dark)
- **Prisma 6** ORM — SQLite locally, **PostgreSQL** in prod (provider swapped at
  build by `orbit-app/scripts/vercel-prebuild.mjs`)
- **Auth:** custom signed-JWT session cookie via `jose` + **magic-link** email sign-in
- **AI:** plain `fetch` to OpenRouter / Gemini / Anthropic with fallback chain;
  no SDKs. Tag-overlap matching fallback when no key.
- **Email:** Resend REST API (plain fetch)
- **PDF:** `unpdf`; **DOCX:** `mammoth`

## 4. Repo structure (key files)

```
/                         landing page (static index.html), docs, screens
/orbit-app/               the Next.js app (Vercel root dir)
  prisma/schema.prisma    data model (SQLite provider; swapped to postgres on build)
  prisma/seed.ts          CLI seed entrypoint
  scripts/
    vercel-prebuild.mjs   on Vercel: rewrite provider->postgresql + db push
    ensure-env.mjs        copies .env.example -> .env on fresh clone
    run-matching.ts       manual match run
  src/lib/
    db.ts                 Prisma client (Accelerate when prisma+postgres URL)
    auth.ts               session cookie; authReady gate (NO insecure prod fallback)
    magic.ts              magic-link token create/consume (hashed, single-use)
    llm.ts                chat()/chatDetailed() provider chain + timeouts/retries
    resume.ts             extract text (pdf/docx) + parseResume() via LLM
    email.ts              Resend send + all email templates + isSendableAddress()
    meetings.ts           availableSlots()/hasClash() (shared slot/conflict logic)
    meeting-notify.ts     routes proposed/confirmed/cancelled emails
    matching.ts           generateForBuilding()/generateForAllBuildings()
    embeddings.ts, similarity.ts, slots.ts, tags.ts, week.ts, seed.ts
  src/app/
    page.tsx              public product landing + signed-in booked coffees
    login/                magic-link request + page (?mode, ?sent, ?error)
    api/auth/verify/      magic-link landing -> sets session
    onboarding/           profile form (resume autofill, building select)
    home/                 member's 3 weekly intros
    intro/[id]/           intro detail + propose a time (SlotPicker)
    meeting/[id]/         two-sided meeting: confirm/decline/cancel/reschedule
    dashboard/            operator analytics (KPIs, members-by-floor)
    privacy/              privacy policy
    api/admin/{seed,llm-check,or-models}/  header-auth admin endpoints
    api/cron/weekly-match/ weekly matching (Vercel Cron)
    robots.ts, sitemap.ts
```

## 5. Data model (Prisma — see `orbit-app/prisma/schema.prisma`)

- **Operator** → has many **Building**
- **Building** → has many **User**, **Match**, **InviteCode**
- **InviteCode** (per building, optional email-domain allowlist)
- **User** (email unique, name, isOperator, onboarded, company/role/seniority/
  education/floor/bio, giveVec/wantVec, buildingId) → **ProfileTag[]** (give|want)
- **LoginToken** (tokenHash, email, name, expiresAt, usedAt) — magic links
- **Match** (directional: owner sees `other`; week key; score/matchPct/reason;
  status proposed|accepted|passed|expired) → one **Meeting**
- **Meeting** (scheduledAt, venue, **status: proposed|confirmed|cancelled|held**,
  **proposedById**, respondedAt, **reminderSentAt**). Legacy `"booked"` still honored.
- **MeetingFeedback** (meetingId, userId, showed, worthwhile, note) — one per
  participant; drives dashboard show-up / worth-it rates.

## 6. Auth (magic-link) — `src/lib/auth.ts`, `magic.ts`, `login/`, `api/auth/verify/`

- **Production:** sign-in is **verified magic-link only**. User enters email →
  `requestMagicLink` creates a hashed single-use token (20-min expiry) → emails a
  link → `/api/auth/verify?token=` consumes it atomically, creates/finds the user,
  sets the session cookie, routes to onboarding/home/dashboard.
- **`authReady`** (auth.ts): true only when `AUTH_SECRET` is a real ≥32-char
  secret. In prod with a missing/weak secret, **auth is disabled** (no sessions
  issued/accepted) — a safe failure, never the old insecure default.
- **Dev fallback:** when no email provider is configured AND not production,
  login signs in directly (local convenience only).
- New users never get `isOperator` — only the seed sets operators.

## 7. AI layer — `src/lib/llm.ts`

- Provider order: **OpenRouter → Gemini → Anthropic**. First with text wins.
- Models (env-overridable, defaults in code & `.env.example`):
  - `OPENROUTER_MODEL=nvidia/nemotron-3-super-120b-a12b:free`
  - `OPENROUTER_FALLBACK_MODEL=openrouter/free` (auto-routes to a live free model)
  - `GEMINI_MODEL=gemini-3.8-flash`
- Hardening learned the hard way: free model slugs **retire often** (check live
  ones via `/api/admin/or-models`); Gemini free tier hits **429 quota** / **503
  overload**; all calls have a **40s abort timeout**; 503 retries, 429 fails fast.
- `chatDetailed()` returns the exact upstream error → surfaced by
  `/api/admin/llm-check` for diagnosis.

## 8. Booking lifecycle — `intro/[id]/`, `meeting/[id]/`, `lib/meetings.ts`, `meeting-notify.ts`

1. Owner opens an intro, picks a slot (only times **both are free**) → Meeting
   `status=proposed`, `proposedById=owner`. Emails the other person.
2. Other person opens `/meeting/[id]` → **Confirm** (→ confirmed, emails both with
   calendar link) / **Decline** / **Reschedule**.
3. Either party can **Cancel** or **Reschedule** (reschedule re-proposes a new
   time needing re-confirm). Clash checks + status guards throughout.
4. **Day-before reminder** emailed via `/api/cron/coffee-reminders` (daily cron).
5. After the time passes, `/meeting/[id]` shows a **feedback form** ("Did you
   meet? Was it worth 15 min?"); submitting marks the meeting `held` and records
   `MeetingFeedback`. Powers the dashboard's show-up / worth-it rates.

**Invite links:** `/join/<INVITE_CODE>` (e.g. `/join/DLF-TOWER`) pre-selects the
building (cookie) and sends to sign-up — for QR flyers. Operators see their
building's join link on the dashboard.

## 9. Environment variables (set in Vercel → Settings → Environment Variables)

**Secrets are NOT in the repo.** `.env` is gitignored; `.env.example` is the
template. Required in production:

| Var | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | Prisma Postgres (Accelerate `prisma+postgres://…`) |
| `AUTH_SECRET` | **yes** | ≥32 chars (`openssl rand -base64 32`). Missing/weak ⇒ login disabled. |
| `CRON_SECRET` | **yes** | protects admin + cron (sent as `Authorization: Bearer`) |
| `RESEND_API_KEY` | **yes for login** | enables magic-link + booking emails |
| `EMAIL_FROM` | recommended | `Orbit <hello@withinorbit.space>` (needs verified domain to email anyone) |
| `OPENROUTER_API_KEY` | optional | AI matching + resume parsing |
| `GEMINI_API_KEY` | optional | AI backup |
| `APP_URL` | recommended | `https://withinorbit.space` (magic-link + referer) |

**Domain (GoDaddy DNS):** A record `@` → Vercel IP `216.198.79.1` (or legacy
`76.76.21.21`); `www` CNAME. For email, add Resend's SPF/DKIM records and verify
the domain in Resend (unlocks sending to anyone, not just the owner).

## 10. Admin & cron endpoints (header auth only — no `?secret=`)

```bash
# Seed demo data (force wipes + reseeds):
curl -X POST -H "Authorization: Bearer <CRON_SECRET>" \
  "https://withinorbit.space/api/admin/seed?force=1"
# Diagnose AI providers:
curl -H "Authorization: Bearer <CRON_SECRET>" https://withinorbit.space/api/admin/llm-check
# List currently-free OpenRouter models:
curl -H "Authorization: Bearer <CRON_SECRET>" https://withinorbit.space/api/admin/or-models
# Manual weekly match:
curl -X POST -H "Authorization: Bearer <CRON_SECRET>" https://withinorbit.space/api/cron/weekly-match
# Manual coffee reminders:
curl -X POST -H "Authorization: Bearer <CRON_SECRET>" https://withinorbit.space/api/cron/coffee-reminders
```
`<CRON_SECRET>` lives in Vercel env vars — get it from the dashboard (never commit it).

## 11. Run / deploy

**Local:** `cd orbit-app && npm install && npm run setup && npm run dev`
(`setup`/`dev` auto-create `.env` from `.env.example`; SQLite, zero-config).

**Deploy:** push to `main` → Vercel builds. Build runs
`vercel-prebuild.mjs` (provider→postgresql + `prisma db push`) → `prisma generate`
→ `next build`. After deploy, seed via the curl above.

## 12. Current status (2026-10-27)

**Working / done:**
- Live product + custom domain + HTTPS.
- Public landing, magic-link auth (secure), onboarding (resume autofill PDF/docx),
  weekly 3-intro matching, two-sided booking (confirm/decline/reschedule/cancel),
  booking + magic-link emails, privacy page, SEO basics.
- **Post-coffee feedback loop** + **operator activation dashboard** (funnel,
  activation rate, show-up & worth-it rates).
- **Day-before coffee reminders** (daily cron) to lift show-up rate.
- **Building invite links** (`/join/<code>`) for QR-flyer growth.
- AI via OpenRouter free models with diagnostics.
- Security pass addressing the Ship It review (see §13).

**Crons (`vercel.json`):** weekly-match (Mon 09:00 UTC), coffee-reminders
(daily 02:30 UTC).

**Pending / needs the owner (outside code):**
1. **Set `AUTH_SECRET` + `RESEND_API_KEY` in Vercel** — until then production
   login is disabled by design. (This was the state at handoff time — verify.)
2. **Verify the domain in Resend** (GoDaddy DNS) so magic links reach all users,
   not just the owner's Resend address.
3. Re-seed prod after deploys if demo data is wanted.

## 13. Ship It review (58/100) — what was fixed & what's left

Fixed in commit `a2dda81`:
- 🔴 "Log in as anyone" → verified magic-link only; seed accounts moved to
  reserved `@example.com` (can't be claimed); `isOperator` only via seed.
- 🔴 Committed `.env` / default `AUTH_SECRET` → removed; no insecure prod fallback.
- 🟠 Admin secret in query string → header-only.
- 🟡 Polish → robots/sitemap/OG/favicon/privacy.

Reviewer's recommended next features:
1. ✅ **Post-coffee feedback loop** — built.
2. ✅ **Operator analytics dashboard** with activation funnel — built.
3. ⬜ Company-email domain verification on signup (deferred — risky for a pilot
   where people use personal emails; `InviteCode.emailDomains` allowlist exists
   to build on). Also: feedback-informed matching, SMS/WhatsApp reminders.

## 14. Key product metric

**Activation = % of new members with a *confirmed* coffee within 7 days of signup**
(`Meeting.status="confirmed"` ≤7 days of `User.createdAt`). Two-sided = real value.
North star: **coffees held / member / month**. Track **per building** (needs
~15–20 active members for liquidity). Supporting funnel: onboarded → got intro →
accepted/proposed → confirmed → held.

**Riskiest assumption:** strangers in a building will accept + show up. 1-week
test: 20 people in one building; target >50% of booked coffees actually happen.

## 15. Known gotchas

- Free AI model slugs retire frequently — if parsing breaks, run `/api/admin/or-models`
  and update `OPENROUTER_MODEL`.
- Resend free tier without a verified domain only emails the account owner.
- The sandbox these agents run in blocks outbound to the live site — use the
  browser or `curl` from your own machine to hit endpoints; rely on
  `/api/admin/llm-check` output pasted back for diagnosis.
- Changing `AUTH_SECRET` logs everyone out (expected).

## 16. How another AI should continue

1. Clone `https://github.com/yawningwhaleAI/orbit`, work in `orbit-app/`.
2. Read this file, `orbit-app/README.md`, `orbit-app/DEPLOY.md`, `CONTEXT.md`.
3. `npm install && npm run setup && npm run dev`, build with `npm run build`.
4. Develop on a branch, merge to `main` to deploy. Ask the owner for secret
   *values* (Vercel) — they are never in the repo.
5. Suggested next work: §13 features + finish the owner tasks in §12.
