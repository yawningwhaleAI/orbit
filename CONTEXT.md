# Orbit — Project Context

> The professional network for the people inside your building.
> **AI finds the person. You have the coffee.**

This document explains what Orbit is, the problem it solves, the philosophy
behind it, and what we're building. It's the source of truth for anyone — a
teammate, a designer, or an AI assistant — picking up the project.

---

## What Orbit is

Your office tower, business park, or coworking space is full of useful people
you'll never meet. Orbit uses AI to find the **three people worth meeting each
week** and sets up a **15-minute coffee** with each.

The name is the metaphor: the most useful people are **already in your orbit** —
in the same building, a few floors away — and Orbit pulls them close.

**One line:** AI finds the person, you have the coffee.

---

## The problem

You share a building with hundreds of people you should know. You'll meet almost
none of them.

We already network along two axes:

1. **Who you've worked with** — your history: colleagues and clients behind you.
2. **Who you're linked to** — your network online: profiles you scroll past but
   rarely reach.

There's a third axis nobody uses:

3. **Where you physically are** — the person two floors up, at a company you'd
   love to know. We've never networked through *place*. Orbit does.

Proximity is the most underused signal in professional networking. The
serendipity that used to happen in hallways and elevators has quietly
disappeared — Orbit manufactures it, deliberately.

---

## Philosophy

- **AI finds the person, you have the coffee.** The AI does the awkward middle —
  the matching, the reasoning, the scheduling. The human just shows up.
- **Explicitly NOT a social feed.** No posts, no likes, no followers, no endless
  scroll. Orbit is the opposite of infinite scroll.
- **Curation over volume.** Three meaningful introductions a week beats a feed of
  a thousand weak signals.
- **Manufacture relevance, not content.** We don't fill a timeline; we engineer
  useful, specific introductions.
- **It should feel like a place, not an app.** Warm, calm, human, premium.

---

## How it works (member experience)

1. **Tell Orbit about you** — your role and company, where you studied, what you
   can give, and what you want. A few lines, no profile to polish.
2. **Meet three a week** — AI introduces you to three people in your building and
   explains, in a sentence, *why you two*.
3. **Accept the coffee** — say yes and Orbit sets up a 15-minute coffee (time,
   place, done). Say pass, no explanation needed.

### The Give / Get match (the core mechanic)

Each member lists what they **can give** and what they **want**. Orbit reads both
sides and finds the overlap — your give → their want, and their give → your want —
that you'd never spot on your own. A match is strongest when the exchange runs
both ways.

Example:

| | Maya (Product Designer) | Devin (Backend Engineer) |
|---|---|---|
| **Can give** | Design feedback, Figma systems | Systems architecture, angel intros |
| **Wants** | A technical co-founder, fundraising intros | A design partner, portfolio reviews |

Maya's *design feedback* meets Devin's want for a *design partner*; Devin's
*angel intros* meet Maya's want for *fundraising intros*. Two-way relevance.

---

## Why it works even when it's small

Most building networks fail because they start empty. Orbit doesn't.

With AI matching, even **60 people** in a single building create **~1,770**
possible pairings (that's every unique pair, `C(60,2)`) to match on — more than
enough to surface three high-quality introductions per member per week.

- We **manufacture relevance, not a feed**.
- We **launch one building at a time**, done right, rather than spreading thin.

This is the strategic edge: the classic cold-start / empty-network problem that
kills community products doesn't apply, because relevance is computed, not
crowd-sourced.

---

## Business model — two audiences

**Members** (individuals) join and get three introductions a week.

**Building operators** (office towers, business parks, coworking operators,
property managers, workplace teams) are the B2B buyers. Orbit is sold to them as
an amenity:

- **Retention you can feel** — a building where people know each other is one
  they don't leave. Belonging is the stickiest amenity there is.
- **A reason to sign** — every tower has wifi and a gym; few can promise tenants
  they'll meet the people who matter. A leasing differentiator.
- **Live from week one** — no empty-network problem; even a half-leased floor
  plate produces useful introductions immediately.

Deployment is white-glove, verified members only, one building at a time.

---

## Voice & tone

Confident, warm, concrete, few words. Short sentences. No buzzwords or corporate
filler. Write like a founder with taste. Restraint is the point.

---

## Product principles / guardrails

- No feed, no vanity metrics, ever. If a feature adds a scroll or a like, it's
  wrong.
- Every introduction must come with a clear, specific *why*.
- Verified, real people in real buildings — trust is the foundation.
- Human connection is the product; AI is the matchmaker, not the destination.

---

## This repository

A single-page marketing / landing site for Orbit.

### Files

- **`index.html`** — the entire site. Self-contained: all CSS and JavaScript are
  inline. The only external dependency is Google Fonts.

### Tech constraints (deliberate)

- One self-contained `index.html`, no build step, no framework, no bundler.
- Mobile-first, responsive, flawless on phones.
- Light/dark via CSS variables, respecting system preference, with a manual
  toggle. Both modes ship with an explicit background (never pure white/black).
- No backend — the email waitlist form is visual; on submit, JS animates to a
  "You're on the list" success state.
- Honors `prefers-reduced-motion`.

### Design language

- **Mood:** warm, calm, premium, human, with a subtle cosmic/orbital undertone.
  Think Linear's quiet confidence, a specialty-coffee brand's warmth, a design
  studio's typographic care.
- **Color:** warm editorial palette. Cream (`#FAF7F2`) in light, deep warm
  charcoal (`#1A1714`) in dark. One signature accent — warm amber / burnt
  caramel (`#C8752D`–`#E08B3E`) — used sparingly for CTAs, orbital lines, match
  connections, and key highlights. Rare on purpose; that's what makes it feel
  expensive.
- **Type:** Fraunces (display serif) for headlines, Inter (sans) for body. Large,
  confident headlines; generous line-height and spacing. Type is the primary
  visual element.
- **Space:** very generous whitespace and vertical rhythm.
- **Motion:** subtle, tasteful. Scroll-reveal (fade + rise), a slow faint orbital
  ring motif in the hero, gentle drifting dots (people in orbit), one refined
  hover micro-interaction. Calm confidence, never bouncy.

### Page sections (in order)

1. **Nav** — "Orbit" wordmark + ghost "Request access" button (and a theme
   toggle).
2. **Hero** — positioning line, headline "AI finds the person. You have the
   coffee.", sub-line, primary CTA, "Now piloting in select buildings" tag, faint
   orbital motif.
3. **The problem** — the three-axis framing; the missing axis is *place*.
4. **How it works** — three steps + "AI does the awkward middle. You just show
   up."
5. **Give / Get** — the signature animated match (two profile cards, connecting
   lines that draw in the accent color). "Networking stops feeling random."
6. **Not another feed** — no posts / likes / followers / scroll; restraint.
7. **Why it works even when it's small** — the density argument (60 people →
   ~1,770 pairings).
8. **The weekly intro card** — a sample "Your introduction this week" card with
   two real-feeling people, a "Why you two" line, a proposed time, and YES / PASS.
9. **Waitlist** — "Bring Orbit to your building", single email field + accent CTA,
   animated success state. No competing CTA.
10. **For building operators (B2B)** — retention, leasing differentiation, live
    from week one.
11. **Footer** — wordmark, one-line vision, copyright.

### Deploy

Static site. Connect the repo to Vercel (Framework Preset: **Other**, no build
command, no output directory) — Vercel serves `index.html` directly. Any change
pushed to the production branch auto-redeploys.

### Editing conventions

- Keep everything in `index.html` unless there's a strong reason to split.
- Preserve the design tokens in `:root` — colors, type, spacing, shadows all flow
  from CSS variables. Change the token, not the usage.
- No em dashes in visible copy (a house style choice); use periods, commas, or
  colons.
- Keep copy tight and founder-voiced.

---

## Status

- **Now:** landing page live / waitlist collecting interest. "Now piloting in
  select buildings."
- **Next (product, beyond this repo):** onboarding to capture give/want, the AI
  matching engine, the weekly introduction + scheduling loop, operator dashboard.

---

## One-paragraph pitch

Orbit is the professional network for the people inside your building. Instead of
another feed, it uses AI to find the three people worth meeting each week — a
designer two floors up, an engineer down the hall, the GTM lead you didn't know
shared your elevator — explains why you two should meet, and books a 15-minute
coffee. AI finds the person; you have the coffee. We start with one building and
manufacture relevance, not a timeline.
