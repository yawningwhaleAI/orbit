# Orbit — Project Handoff

> **Purpose of this file:** everything a new AI agent or developer needs to
> continue building Orbit without the original chat history. Read this first,
> then `orbit-app/README.md`, `orbit-app/DEPLOY.md`, and `CONTEXT.md`.
> Last updated: 2026-10-27.

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
  **proposedById**, respondedAt). Legacy `"booked"` still honored in filters.

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
  booking + magic-link emails, operator dashboard, privacy page, SEO basics.
- AI via OpenRouter free models with diagnostics.
- Security pass addressing the Ship It review (see §13).

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

Reviewer's recommended **next features** (high ROI, not yet built):
1. **Post-coffee feedback loop** ("Was this worth 15 min?") → improves matching + proves value.
2. **Operator analytics dashboard** with the activation funnel (see §14).
3. Company-email domain verification on signup (prove members work in the building).

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
