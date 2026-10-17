# Orbit

**The professional network for the people inside your building.**
AI finds the three people worth meeting each week and books a 15-minute coffee.

> **AI finds the person. You have the coffee.**

Your office tower, business park, or coworking space is full of useful people you'll never meet. Orbit uses AI to find the three worth meeting each week, tells you why, and sets up the coffee. It is explicitly **not a feed** — no posts, likes, followers, or endless scroll. Just three people worth meeting each week.

---

## What's in this repo

| File | What it is |
|---|---|
| [`index.html`](index.html) | The complete marketing / landing site. Self-contained (all CSS + JS inline, Google Fonts only). No build step. |
| [`CONTEXT.md`](CONTEXT.md) | **Full project context** — idea, problem, research, product decisions, matching engine, data model, pricing, tech stack, GTM. Start here to understand or build Orbit. |
| [`FEATURE_LIST.md`](FEATURE_LIST.md) | Detailed feature list (MVP vs fast-follow). |
| [`SUBMISSION_JOBSPEC.md`](SUBMISSION_JOBSPEC.md) | Accelerator job spec: pilot buildings, third-party APIs, pricing and pilot terms. |
| [`screens/`](screens/) | Product screen mockups — `screens.html` source + rendered PNGs. |

> The **product app** is not built yet. This repo holds the marketing site, the design system, and the specs. Build the app as a new Next.js project using `CONTEXT.md` (§7 matching, §8 data model, §12 architecture) as the blueprint.

---

## The idea in 30 seconds

- **Problem:** You share a building with hundreds of people you should know, and you'll meet almost none of them. We network by who we've worked with and who we're linked to online, but never by *where we physically are*.
- **Solution:** AI reads what each member can **give** and what they **want**, finds the two-way overlap inside the building, and introduces three people a week with a one-line "why you two" and a booked 15-minute coffee.
- **Why it's not a feed:** curation over volume, mutual opt-in, no browsing, no scroll.
- **Business model:** B2B2C. Building operators pay a flat monthly fee per building; members are free.
- **Starting:** Gurugram, India — DLF Tower, CDS, Capital Building, and WoCo.

---

## Landing site

Single static `index.html`. Deploy on Vercel with **Framework Preset: Other**, no build command, no output directory — Vercel serves the file directly. Any push to the production branch auto-redeploys.

Local preview: open `index.html` in a browser, or run any static server (e.g. `npx serve`).

---

## Tech blueprint for the product (see CONTEXT.md §12)

Next.js + Vercel · Supabase (Postgres + Auth + pgvector) · embeddings + Anthropic Claude for matching and the "why you two" · Google Calendar API + Cal.com for scheduling · WhatsApp (Gupshup/Twilio) for delivery · weekly matching via Vercel Cron / Inngest.

---

## Brand

Warm editorial palette (cream `#FAF7F2` / charcoal `#1A1714`), one amber accent (`#C8752D`–`#E08B3E`), Fraunces display serif + Inter. Calm, premium, human, with a subtle orbital motif. Full system in `CONTEXT.md` §20.
