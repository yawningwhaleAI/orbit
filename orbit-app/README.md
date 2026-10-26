# Orbit — App

The full-stack Orbit product: onboarding, the AI weekly-introduction engine, the
member app, and the operator dashboard. Marketing site lives at the repo root
(`../index.html`); product context is in [`../CONTEXT.md`](../CONTEXT.md).

## Stack

- **Next.js 14** (App Router) + **TypeScript** + **Tailwind** (brand design system)
- **Prisma** ORM — **SQLite** in dev, **Postgres** (Supabase/Neon/Vercel) in prod
- **Auth** — signed-JWT session cookie (`jose`), email dev login
- **Matching** — Give/Get reciprocity scoring; **embeddings (OpenAI) + Claude**
  "why you two" when keys are set, **lexical + complementary-tag fallback** otherwise
- **Scheduling / notifications** — booking + venue now; Google Calendar + WhatsApp
  are wired as optional integrations (stubbed in dev)

## Run it locally (zero config)

```bash
npm install
npm run setup     # copies .env.example -> .env, creates the SQLite db, seeds + generates intros
npm run dev       # http://localhost:3000
```

`setup`/`dev` create a local `.env` from `.env.example` automatically (it's
gitignored and holds no real secrets). For production, set `AUTH_SECRET`,
`CRON_SECRET`, `RESEND_API_KEY` and `DATABASE_URL` in your host's env settings.

Log in at `/login` (local dev signs in directly — any email works):
- **Member:** `demo@example.com`
- **Operator:** `operator@example.com`

In **production**, sign-in is a verified **magic link** emailed via Resend —
there is no password and no direct login. Set `AUTH_SECRET` (>=32 chars) and
`RESEND_API_KEY` for it to work. Demo accounts use reserved `@example.com`
addresses that can never receive mail, so they can't be claimed.

## Useful scripts

```bash
npm run db:seed        # reseed demo data + regenerate intros
npm run db:studio      # browse the database (Prisma Studio)
npm run match:run      # run the weekly matcher (add -- --regen to wipe + rebuild)
npm run build          # production build
```

## Turn on the AI upgrades (optional)

Add to `.env` and everything upgrades automatically:

```bash
OPENROUTER_API_KEY=...  # LLM for "why you two" + resume autofill (recommended)
# or ANTHROPIC_API_KEY=...   # same LLM features, direct to Anthropic
OPENAI_API_KEY=...      # optional: embeddings-based matching
```

Without an LLM key the app still matches and explains (deterministic fallback)
and onboarding works manually — only the resume autofill needs a key.

## Deploy (Vercel)

1. New Vercel project, **Root Directory = `orbit-app`**.
2. Set env vars: `DATABASE_URL` (Postgres), `AUTH_SECRET`, `CRON_SECRET`, and
   optionally `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`.
3. Switch `prisma/schema.prisma` datasource `provider` to `"postgresql"`.
4. Run `prisma db push` against the Postgres DB (and seed if you want demo data).
5. The weekly matcher runs via Vercel Cron (`vercel.json`) every Monday 09:00 UTC.

## How matching works

See [`../CONTEXT.md`](../CONTEXT.md) §7. In short: each member's Give and Want
lists are compared so that *their give meets your want* and *your give meets
their want* (two-way relevance), with boosts for floor proximity, complementary
seniority, and shared interests. Each member gets up to 3 intros per week with a
one-line reason, and accepting books a 15-minute coffee.

## Project layout

```
prisma/schema.prisma      data model
prisma/seed.ts            demo building + members + first week of intros
src/lib/matching.ts       the matching engine
src/lib/similarity.ts     cosine + lexical/complementary scoring
src/lib/embeddings.ts     optional OpenAI embeddings
src/lib/ai.ts             optional Claude "why you two" (+ template fallback)
src/lib/auth.ts           JWT session
src/app/login             email dev login
src/app/onboarding        profile + Give/Want capture
src/app/home              the weekly three
src/app/intro/[id]        intro detail + accept/pass + booking
src/app/dashboard         operator dashboard
src/app/api/cron/...      weekly matching job
```
