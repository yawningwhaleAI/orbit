# Deploying Orbit to Vercel (live, with a real database)

The app is deploy-ready. On Vercel it automatically switches Prisma to Postgres
and creates the tables — **no manual schema edits**. You only need to: create
the project, attach a Postgres database, set a few env vars, and (optionally)
load demo data with one click.

Prerequisites: your GitHub is already connected to Vercel, and `main` has the
full project.

---

## 1. Create the app's Vercel project

1. Go to **https://vercel.com/new**.
2. Import **`yawningwhaleAI/orbit`**.
3. **Root Directory → set to `orbit-app`** (click Edit, choose the folder). This
   is the most important setting.
4. Framework auto-detects **Next.js**. Leave build/output at defaults.
5. Name it e.g. **`orbit-app`** (keep your existing `orbit` project for the
   landing page).
6. Don't deploy yet — add the database and env vars first (or deploy, then add
   them and redeploy).

## 2. Attach a Postgres database (Vercel Postgres)

1. In the new project → **Storage → Create Database → Postgres** → create.
2. Connect it to the project when prompted. This auto-injects the database env
   vars (`DATABASE_URL` and a direct/unpooled URL) into the project. The app
   picks the right one automatically.

## 3. Environment variables

Project → **Settings → Environment Variables** → add (Production + Preview):

| Name | Value |
|---|---|
| `AUTH_SECRET` | **required** — 32+ random chars (`openssl rand -base64 32`). If missing/weak in prod, sign-in is disabled (never falls back to a default). |
| `CRON_SECRET` | **required** — random string; protects admin + cron endpoints (sent as `Authorization: Bearer`). |
| `RESEND_API_KEY` | **required for login** — enables magic-link sign-in + emails. Verify a domain in Resend to email anyone. |
| `EMAIL_FROM` | e.g. `Orbit <hello@withinorbit.space>` |
| `GEMINI_API_KEY` / `OPENROUTER_API_KEY` | optional — AI matching + resume parsing |

(The database vars from step 2 are already there.) Changing `AUTH_SECRET` logs
out all existing sessions.

## 4. Deploy

Trigger a deploy (Deployments → Redeploy, or push to `main`). The build:
- switches Prisma to Postgres,
- creates all tables in your database,
- builds the Next.js app.

Your live URL: `https://<project>.vercel.app`.

## 5. Load demo data (one click, optional)

The database starts empty. To populate the DLF Tower demo (four buildings +
members + this week's intros), run once (secret in the header, not the URL):

```
curl -X POST -H "Authorization: Bearer <CRON_SECRET>" \
  https://<project>.vercel.app/api/admin/seed            # seed if empty
curl -X POST -H "Authorization: Bearer <CRON_SECRET>" \
  "https://<project>.vercel.app/api/admin/seed?force=1"  # wipe + reseed
```

Safe by default: it won't touch a populated DB unless you pass `force=1`. Demo
accounts use reserved `@example.com` emails that can't receive mail (so they
can't be claimed). Skip this entirely if you only want real signups.

## 6. Weekly matching

Runs automatically every Monday 09:00 UTC via Vercel Cron (`vercel.json`).
Manual run:
`curl -X POST -H "Authorization: Bearer <CRON_SECRET>" https://<project>.vercel.app/api/cron/weekly-match`.

---

## Custom domain

Project → **Settings → Domains → Add**. Buy through Vercel for zero-config DNS,
or buy elsewhere (Cloudflare/Namecheap) and point the DNS records Vercel shows.
Typical: `app.yourdomain.com` → this app; `yourdomain.com` → the landing page
project.

## Notes
- Local dev is unaffected: it stays on SQLite (`npm run dev`).
- Secrets live only in Vercel env settings and your local `.env.local` — never
  in the committed `.env`.
- Free OpenRouter models are rate-limited; switch `OPENROUTER_MODEL` to a cheap
  paid model (e.g. `openai/gpt-4o-mini`) if you hit limits.
