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
| `AUTH_SECRET` | a long random string (one is provided in chat, or run `openssl rand -base64 32`) |
| `CRON_SECRET` | a random string (provided in chat) |
| `OPENROUTER_API_KEY` | your (rotated) OpenRouter key |
| `OPENROUTER_MODEL` | `meta-llama/llama-3.3-70b-instruct:free` |

(The database vars from step 2 are already there.)

## 4. Deploy

Trigger a deploy (Deployments → Redeploy, or push to `main`). The build:
- switches Prisma to Postgres,
- creates all tables in your database,
- builds the Next.js app.

Your live URL: `https://<project>.vercel.app`.

## 5. Load demo data (one click, optional)

The database starts empty. To populate the DLF Tower demo (so you can log in as
`demo@orbit.app` / `operator@orbit.app` and see matches), visit **once**:

```
https://<project>.vercel.app/api/admin/seed?secret=<CRON_SECRET>
```

It seeds the four buildings + members and this week's intros. It's safe: it
won't touch the data again unless you add `&force=1`. Skip this entirely if you
only want real signups.

## 6. Weekly matching

Runs automatically every Monday 09:00 UTC via Vercel Cron (`vercel.json`).
Manual run: `POST https://<project>.vercel.app/api/cron/weekly-match?secret=<CRON_SECRET>`.

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
