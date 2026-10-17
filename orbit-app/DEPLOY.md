# Deploying Orbit (production backend + live URL)

The app runs on SQLite locally. For a live deployment it needs a real
**Postgres** database. This guide uses **Neon** (free Postgres) + **Vercel**
(hosting). Total time: ~15 minutes. You only do this once.

---

## Step 1 — Create a free Postgres database (Neon)

1. Go to **https://neon.tech** and sign up (free tier is plenty for the pilot).
2. Create a project (name it `orbit`). Pick a region near your users (e.g.
   Singapore / Mumbai for India).
3. Copy the **connection string** it shows — it looks like:
   ```
   postgresql://USER:PASSWORD@ep-xxxx.ap-southeast-1.aws.neon.tech/orbit?sslmode=require
   ```
   Keep it handy for Step 3.

> Alternatives that work identically: **Vercel Postgres** (create it from the
> Vercel dashboard → Storage) or **Supabase** (Project → Settings → Database →
> Connection string, "URI"). Any Postgres URL works.

## Step 2 — Switch Prisma to Postgres (one line)

Edit `orbit-app/prisma/schema.prisma` — change the datasource provider:

```prisma
datasource db {
  provider = "postgresql"   // was "sqlite"
  url      = env("DATABASE_URL")
}
```

You can do this directly on GitHub (open the file → pencil icon → commit), or
locally and push. Commit the change.

## Step 3 — Create the Vercel project

1. Go to **https://vercel.com/new** and import **`yawningwhaleAI/orbit`**.
2. **Important:** set **Root Directory** to **`orbit-app`**.
3. Framework preset will auto-detect **Next.js** — leave the defaults.
4. Add **Environment Variables** (Settings → Environment Variables):
   | Name | Value |
   |---|---|
   | `DATABASE_URL` | your Neon connection string from Step 1 |
   | `AUTH_SECRET` | a long random string (run `openssl rand -base64 32`) |
   | `CRON_SECRET` | any random string |
   | `OPENAI_API_KEY` | *(optional)* enables embeddings matching |
   | `ANTHROPIC_API_KEY` | *(optional)* enables Claude "why you two" |
5. Click **Deploy**.

## Step 4 — Create the tables + seed demo data (one time)

The database is empty on first deploy. Create the schema and demo data by
pointing your **local** machine at the production database once:

```bash
cd orbit-app
# put the Neon URL in .env.local (overrides .env; never commit it)
echo 'DATABASE_URL="postgresql://...your neon url..."' > .env.local
npm run db:push     # creates all tables in Postgres
npm run db:seed     # seeds DLF Tower + members + this week's intros
```

(Delete `.env.local` afterward if you don't want local commands hitting prod.)

Your live site is now at `https://<project>.vercel.app`. Log in with
`demo@orbit.app` / `operator@orbit.app`.

## Step 5 — Weekly matching runs automatically

`vercel.json` already schedules the matcher every Monday 09:00 UTC via Vercel
Cron (`/api/cron/weekly-match`). Vercel sends the `CRON_SECRET` automatically.
You can also trigger it manually any time:
```
curl -X POST "https://<project>.vercel.app/api/cron/weekly-match?secret=<CRON_SECRET>"
```

---

## Custom domain

In the Vercel project → **Settings → Domains → Add**. Two paths:

- **Buy the domain through Vercel** (easiest): DNS + SSL are configured
  automatically, nothing to wire up. Costs a little more than a registrar.
- **Buy it cheaper elsewhere** (Cloudflare, Namecheap, GoDaddy) and add it as a
  custom domain in Vercel for free: Vercel shows you the DNS records (an `A`
  record and/or `CNAME`) to paste into your registrar. SSL is still automatic.

**Recommendation:** if you want zero hassle, buy it on Vercel. If you care about
the lowest price and already use Cloudflare, buy there and point it at Vercel —
it's a 5-minute DNS step and free on Vercel's side.

> Note: the **marketing landing page** (`index.html` at the repo root) and the
> **app** (`orbit-app`) are two separate Vercel projects. Common setup: point
> `orbit.app` (or your domain) at the landing page, and `app.orbit.app` at the
> app. Add each domain/subdomain to its respective Vercel project.

---

## What still needs real credentials (later)

- **Google sign-in + two-way calendar availability** — requires a Google Cloud
  OAuth client (Calendar API scope). Once added, the slot picker can show each
  person's real free/busy instead of in-app availability.
- **WhatsApp / email notifications** — Gupshup/Twilio + Resend keys.
