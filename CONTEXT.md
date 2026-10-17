# Orbit — Full Project Context

> **Purpose of this document:** a single, self-contained source of truth for Orbit. If you are an AI assistant or engineer picking this project up with no prior conversation, read this top to bottom and you will understand the idea, the problem, the research and reasoning behind every decision, the product, the tech, the go-to-market, and what is still open. Nothing here assumes outside context.

> **One line:** Orbit is the professional network for the people inside your building. AI finds the three people worth meeting each week and books a 15-minute coffee. **AI finds the person; you have the coffee.**

---

## 0. Status & facts (as of this writing)

- **Stage:** pre-seed / prototype. Landing page built and deployed; applying to an 8-week build accelerator.
- **Market entry:** Gurugram, India (National Capital Region). Dense cluster of office towers and coworking centres.
- **Launch cluster (first buildings):** **DLF Tower, CDS, Capital Building, and WoCo** (coworking). **WoCo is the week-1 lead pilot** (coworking operators have a single decision-maker, dense membership, and a community mandate — fastest path to a signed pilot).
- **Current repo:** a single self-contained marketing site (`index.html`) plus docs. The *product* (the app described below) is not built yet — this document is the brief for building it.
- **Name meaning:** the most useful people are **already in your orbit** — same building, a few floors away. Orbit pulls them close. The brand has a subtle cosmic/orbital motif (rings, drifting dots = people in orbit).

---

## 1. The idea

Your office tower, business park, or coworking space is full of useful people you will never meet. Orbit uses AI to find the **three people worth meeting each week** inside your own building and sets up a **15-minute coffee** with each. The AI does the matching, the reasoning, and the scheduling. The human just shows up.

It is deliberately **not a social network / feed**. There are no posts, likes, followers, comments, or endless scroll. The entire product is: *here are three people worth meeting this week, and here's why — want the coffee?*

---

## 2. The problem (deep)

**Headline:** You share a building with hundreds of people you should know. You'll meet almost none of them.

### The "third axis" framing
Professionals currently network along two axes:
1. **Who you've worked with** — your history: colleagues, clients, alumni. Backward-looking.
2. **Who you're linked to** — your online graph (LinkedIn): profiles you scroll past but rarely convert into real conversations.

There is a third axis **nobody uses**:
3. **Where you physically are** — the person two floors up, at a company you'd love to know. We have never systematically networked through *place*.

Proximity is the most underused signal in professional networking. The hallway/elevator/coffee-queue serendipity that used to create weak ties has quietly disappeared: people badge in, go to their floor, work, and leave. Hybrid work thinned it further. The result is enormous latent value — a GTM expert six floors down, an angel investor in the next tower, a founding-designer candidate in the café — sitting unrealised because there is no mechanism to surface it.

### Why existing things don't solve it
- **LinkedIn** is an online graph and a content feed. It is global, not local; it rewards broadcasting, not meeting; proximity is irrelevant to it.
- **Events / mixers** are sporadic, awkward, self-selecting (same extroverts), and don't scale to "every week, the right person."
- **Coworking community apps** (member directories, event boards) are passive directories — you have to go browse and initiate, which almost nobody does.
- **Slack/WhatsApp building groups** are noisy broadcast channels with no matching and no intent.

The gap: **no product proactively, intelligently introduces you to the specific people near you who are worth your time, and removes the activation energy of reaching out.**

---

## 3. Philosophy & principles (the soul of the product)

These are load-bearing. If a feature violates one, it's wrong.

1. **AI finds the person, you have the coffee.** The AI does the awkward middle — matching, the "why," scheduling. The human only does the human part: show up and talk.
2. **Explicitly NOT a feed.** No posts, likes, followers, comments, infinite scroll, or vanity metrics. Ever. The anti-feed stance is the brand.
3. **Curation over volume.** Three considered introductions a week beat a thousand weak signals. Scarcity makes it premium and drives action.
4. **Manufacture relevance, not content.** We don't fill a timeline; we engineer specific, useful, two-way introductions.
5. **It should feel like a place, not an app.** Warm, calm, human, premium.
6. **Mutual opt-in, always.** A coffee books only when both people accept. No one is ambushed, browsed, or put on display.
7. **Density is sacred.** Members are free, because the product only works when lots of people in a building join. Never tax the side you need volume from.
8. **Privacy and safety are features, not afterthoughts** (see §10) — especially important in the Indian market.

---

## 4. Target users

### Primary: the member (the professional in the building)
- Founders, operators, designers, engineers, GTM/sales leaders, investors, consultants — anyone whose work benefits from the right introduction.
- Pain: time-poor, wants high-signal connections, hates networking theatre and cold outreach, won't maintain yet another profile/feed.
- Motivation: meet genuinely useful people with near-zero effort; the person is *right here* so the cost of a coffee is 15 minutes, not a commute.

### The buyer: the building operator (B2B customer — the one who pays)
- **Coworking operators** (e.g. WoCo, and chains like Awfis, Smartworks, 91springboard, Innov8, Table Space).
- **Office-tower / business-park landlords and management** (e.g. DLF, and the management of CDS, Capital Building).
- **Workplace / community / tenant-experience teams.**
- Pain / motivation: tenant **retention** (churn is expensive), **leasing differentiation** (every building has wifi and a gym; few can say "our tenants actually meet the people who matter"), and justifying **amenity spend** to leadership with real engagement data.

This is a **B2B2C** model: we sell to the operator (B2B); the operator offers Orbit to their tenants/members (the C) as a free amenity.

---

## 5. The solution & core loop

### Member experience (3 steps)
1. **Tell Orbit about you** — join with a building invite code; verify (work email / SSO); add a lightweight profile: role, company, education, **"what I can give"**, **"what I want."** ~60 seconds. No résumé to polish.
2. **Meet three a week** — the AI introduces you to up to three people in your building each week, each with a one-line **"why you two."**
3. **Accept the coffee** — tap Yes and Orbit books a 15-minute coffee (time + on-site café) and notifies both people. Tap Pass and it quietly disappears (the other person is never told).

### The Give / Get matching model (the core mechanic)
Each member lists:
- **"I can give"** — e.g. product strategy, hiring advice, design feedback, investor intros, legal know-how.
- **"I want"** — e.g. a technical co-founder, GTM help, a mentor, customers, fundraising intros.

Orbit finds the **overlap that runs both ways**: your *give* → their *want*, AND their *give* → your *want*. A match is strongest when the exchange is reciprocal.

**Worked example:**

| | Maya (Product Designer) | Devin (Backend Engineer) |
|---|---|---|
| Can give | Design feedback, Figma systems | Systems architecture, angel intros |
| Wants | A technical co-founder, fundraising intros | A design partner, portfolio reviews |

Maya's *design feedback* meets Devin's want for a *design partner*; Devin's *angel intros* meet Maya's want for *fundraising intros*. Two-way relevance → high-quality match.

---

## 6. Key product decisions & the reasoning (READ THIS before changing the product)

These are decisions already made in research/discussion, with rationale. Don't silently reverse them.

### 6.1 Curated 3/week — NOT a browsable "who's nearby" directory
**Decision:** Orbit pushes three AI-curated introductions per week. It does **not** let members browse a list/map of everyone nearby.
**Why:**
- A browsable list *is* a directory/feed — it recreates the exact thing we're positioning against (LinkedIn-lite with a map).
- Curation + a specific "why" drives a decision; a long browsable list causes choice paralysis and inaction.
- Curation solves the cold-start: with 40–60 members a curated match still feels magical, whereas a browse screen of 40 strangers looks empty and dead.
- **Safety/privacy (critical in India):** "see whoever is nearby" makes people browsable and locatable — a real safety concern (especially for women) and a creep risk, and it discourages honest profiles. Curated + mutual opt-in is far safer.
- "Nearby" implies **real-time location tracking** — a hard build and a privacy liability we deliberately avoid.
- Reciprocity: scored matching guarantees two-way value; browsing lets people cherry-pick the "popular" person and kills reciprocity.
**Approved escape hatch (later, not MVP):** a **skill-based "request an intro"** — a member searches by a *need/skill* ("someone who's raised a seed round"), NOT by browsing people, and Orbit routes a candidate through the same AI match + mutual opt-in. Gives agency without a people-directory or location exposure.

### 6.2 Members free, operators pay (B2B2C)
See §4 and §9. Density requires free members; operators have budget and clear ROI (retention, leasing, amenity).

### 6.3 Location = "same building," verified cheaply (no GPS tracking)
Building membership is proven by **invite code + corporate email-domain allow-list**, not continuous location. Optional **one-tap geofence check-in at coffee time** (browser geolocation, foreground only) can later confirm meetings happened. Never background tracking.

### 6.4 No custom ML model
Matching uses **text embeddings + an LLM re-ranker** (see §7). This is a solved retrieval pattern, not research — essential for an 8-week build.

### 6.5 Launch one building at a time
Relevance is computed, not crowd-sourced, so we don't need a city-wide network. We need ~40–60 opted-in members in a *single* building, then expand building by building. This sidesteps the cold-start problem that kills community apps.

### 6.6 WhatsApp-first delivery (India)
Intros, confirmations, and reminders go via **WhatsApp** (highest open rates in India), with email fallback.

---

## 7. How the matching engine works (design spec)

Goal: once a week, for each member in a building, produce up to 3 high-quality, reciprocal, not-recently-seen introductions, each with a human "why you two" sentence.

### Pipeline
1. **Profile → structured record:** role, company, education, seniority, `give[]`, `want[]`, free-text interests, building_id, floor.
2. **Embeddings:** embed the `give` text and the `want` text (and a combined profile text) into vectors using an embeddings API (e.g. OpenAI `text-embedding-3-small`, or Voyage). Store in Postgres with **pgvector**.
3. **Candidate generation (reciprocity scoring):** for member A, find members B in the same building where:
   - similarity( A.give , B.want ) is high **AND** similarity( B.give , A.want ) is high (two-way fit), using cosine similarity on the vectors.
   - Combine into a reciprocity score, e.g. `score = w1 * sim(A.give,B.want) + w1 * sim(B.give,A.want) + boosts`.
4. **Boosts / rules:** same building (required), floor/zone proximity, shared interests, sensible seniority pairing (mentor↔mentee), and penalties for: already-introduced pair, recently-passed pair, over-exposure (don't over-match a popular person).
5. **LLM re-rank + "why you two":** take the top ~8 candidates and pass to an LLM (**Anthropic Claude API**) to (a) re-rank for genuine, non-generic complementarity, and (b) write the one-sentence "why you two." This is where match quality becomes human-feeling.
6. **Select 3**, respecting each member's weekly cap and preferences.
7. **Deliver** via WhatsApp + email + in-app.
8. **Feedback loop:** accept/pass (and later, meeting-held + "how did it go") update weights and the penalty tables, improving future matches per building.

### Cadence
- Weekly batch job per building (e.g. Monday 9am local), run by a scheduler (Vercel Cron / Inngest). Not real-time.

### Cold-start math (why it works small)
- `C(n,2)` unique pairs: 60 members → **1,770** possible pairs; 100 → 4,950. Ample supply for 3 quality intros/member/week even at pilot scale. You do NOT need a large network — you need ~40–60 in one building.

---

## 8. Data model (starting point)

Entities (fields illustrative, not exhaustive):

- **building**: id, name, type (coworking|tower|park), operator_id, city, address, floors, café/venue info, pilot_status, created_at.
- **operator**: id, name, contact, plan, buildings[], billing info.
- **user (member)**: id, name, email, auth_provider, building_id, company, floor, role, seniority, education, created_at, status (active|paused), prefs (intros_per_week, times).
- **profile_tags**: user_id, type (give|want), tag, source (suggested|freetext).
- **embedding**: user_id, give_vec, want_vec, profile_vec, updated_at. (pgvector columns.)
- **match**: id, building_id, week, user_a, user_b, score, reasons (json), status (proposed|accepted_a|accepted_b|mutual|passed|expired), why_you_two (text).
- **meeting**: id, match_id, scheduled_time, venue, calendar_event_ids, status (booked|held|cancelled|no_show), feedback (json).
- **invite_code**: code, building_id, email_domain_allowlist[], expiry.
- **event_log**: user/match/meeting events for analytics (sent, viewed, accepted, passed, booked, held).

---

## 9. Business model & pricing (detailed)

**Model:** B2B2C. Operators pay; members are free.

**Why operators pay:** (1) **retention** — tenants who've built real relationships don't leave; (2) **leasing differentiation** — a marketable amenity no competitor building offers; (3) **premium amenity** — cheaper and more differentiated than another event.

**Pricing structure:**
- **Step 1 — Free 60-day pilot** for one building. Not the price — a zero-risk way in that generates real usage data and proof.
- **Step 2 — Flat monthly platform fee per building**, tiered by active members:

| Active members in building | Price (per building / month) |
|---|---|
| Up to 100 | ₹25,000 |
| 100–300 | ₹50,000 |
| 300+ | ₹90,000 (or custom / multi-centre) |

- **Alternative** (lead with flat fee; offer only if asked): **₹350–500 / active member / month** with a monthly minimum.

**Why flat-per-building (not per-seat):** Indian operators budget amenities per centre, not per seat; a flat fee is predictable and easy for finance to approve; per-seat creates variable bills and an incentive to under-report members (the opposite of what we want).

**Revenue illustration:** 1 building @ ₹50k/mo = ₹6L/yr (~$7k). 10 buildings = ₹60L/yr (~$72k ARR). Launch cluster = 4 buildings; Gurugram has hundreds.

**One-sentence pitch:** "Members use Orbit free. We charge the building operator a flat monthly fee per building — ₹25k–₹90k by size — and every building starts with a free 60-day pilot before it converts to paid."

---

## 10. Trust, safety & privacy (first-class, India-aware)

- **Verified-only:** invite code + work-email-domain allow-list → real people in real buildings.
- **No public profiles / no directory:** give/want is used only to generate matches, never shown as a browsable list.
- **Mutual opt-in:** details shared only when both accept; Pass is silent and private.
- **Block & report:** one-tap block (never matched again) + report to the operator.
- **Data minimisation:** only what's needed to match and schedule; no continuous location, no message scraping.
- **Women's safety consideration:** because meetings are in-building, in public café spaces, during work hours, mutually opted-in, and never location-broadcast, Orbit is structurally safer than proximity/browse apps. Keep it that way.
- **Leave anytime:** pause intros or delete account + data in one tap.

---

## 11. Competitive landscape & differentiation

- **LinkedIn:** online graph + content feed; global, not place-based; rewards broadcasting, not meeting. Orbit is local, curated, action-oriented, feed-free.
- **Swipe-to-network apps (Bumble Bizz, Shapr-style):** browsing/swiping, choice overload, novelty churn. Orbit removes browsing entirely.
- **AI 1:1 networking (Lunchclub-style):** virtual and global; Orbit is physical and building-bounded, which makes the meeting frictionless (walk downstairs) and the match pool verified and relevant.
- **Coworking community apps / member directories (Nexudus, OfficeRnD community, WeWork Member Network, Habu):** passive directories + event boards inside one operator; low engagement because the user must browse and initiate. Orbit is proactive (pushes 3/week) and operator-agnostic (works across towers, not just one coworking brand).
- **Slack/WhatsApp building groups:** noisy broadcast, no matching, no intent.

**Orbit's wedge = place-based + AI-curated + action-oriented (books the coffee) + explicitly anti-feed + mutual-opt-in safe.** No incumbent combines these.

---

## 12. Tech architecture (recommended, chosen to de-risk an 8-week build)

- **Frontend / app:** Next.js (React), deployed on **Vercel**. Mobile-first responsive **web** app — no native iOS/Android for the pilot.
- **Backend / data:** **Supabase** (Postgres + Auth + Row Level Security) with **pgvector** for embeddings.
- **Auth:** Google / Microsoft SSO + email OTP (Supabase Auth). Building identity attached via invite code at signup.
- **AI matching:** embeddings via OpenAI `text-embedding-3-small` (or Voyage); **Anthropic Claude API** for re-ranking + "why you two" generation.
- **Scheduling:** **Google Calendar API** + **Microsoft Graph** (Outlook); **Cal.com** (open-source, self-hostable) for 15-min slot booking. Do not build scheduling in-house.
- **Messaging:** **WhatsApp Business API** via **Gupshup** or **Twilio**; email via Resend/Postmark.
- **Jobs:** weekly matching + delivery via **Vercel Cron** or **Inngest**.
- **Operator dashboard:** part of the same Next.js app, gated to operator accounts.
- **Env/secrets (names only):** `ANTHROPIC_API_KEY`, `OPENAI_API_KEY` (or Voyage), `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_OAUTH_*`, `MICROSOFT_OAUTH_*`, `CALCOM_*`, `WHATSAPP_PROVIDER_KEY`, `RESEND_API_KEY`.

**Deliberately NOT building in the pilot:** native apps; real-time GPS tracking; custom-trained ML; in-app chat/feed.

---

## 13. User flows

### Member onboarding
Invite code → verify email/SSO → company + floor → "I can give" tags → "I want" tags → done. (3-step, ~60s.)

### Weekly intro loop
Monday batch → 3 intros delivered (WhatsApp + in-app) → member opens intro → sees "why you two" + match strength → Accept or Pass → on mutual Accept, Orbit proposes time + café → books calendar + WhatsApp confirmation → reminder before → (later) post-coffee "how did it go?".

### Operator
Operator logs into dashboard → sees members joined, intros sent, accept rate, coffees held, engagement-over-time, recent intros → manages invite codes + members → (later) multi-building, exports, billing.

---

## 14. Screens (already designed as mockups in `/screens`)
1. **Onboarding / profile** (give & want capture).
2. **Weekly intros** (the three, with match % and why).
3. **Intro detail** (two people, "why you two," proposed time, Yes/Pass) — the emotional core.
4. **Coffee booked** (confirmation, calendar, WhatsApp).
5. **Operator dashboard** (KPIs, meetings-held chart, recent intros).

---

## 15. Metrics / KPIs
- **Activation:** % of invited who complete a profile.
- **Weekly accept rate** (target ≥ 40%).
- **Coffees held / accepted** (target ≥ 60% of accepted actually happen).
- **Repeat participation** (members acting on intros week over week).
- **Member NPS** (target ≥ 40).
- **Operator-visible retention signal** (participation trend; input to renewal).
- North-star: **real 15-minute coffees held per building per week.**

---

## 16. 8-week build plan (accelerator)
- **W1:** Lock WoCo free pilot; open DLF Tower / CDS / Capital conversations. Build auth + invite-code building identity + profile capture.
- **W2:** Matching engine v1 (embeddings + reciprocity scoring in pgvector); seed 30–50 members in pilot building.
- **W3:** Weekly intro delivery + accept/pass; calendar booking (Cal.com + Google); WhatsApp/email notifications.
- **W4:** First live intros; operator dashboard v1; 5–10 operators contacted.
- **W5–6:** Improve match quality from real accept/pass; optional geofence check-in; retention metrics; sign pilot #2.
- **W7:** Polish; measure activation/accept/meetings-held; testimonials.
- **W8:** Pilot readout + case study; convert pilot building to paid; pricing validated across ≥10 operator conversations.

---

## 17. Go-to-market (Gurugram)
- **Week-1 lead:** WoCo (coworking — single decision-maker, dense, community mandate).
- **Cluster:** DLF Tower, CDS, Capital Building, WoCo.
- **Channel:** direct to centre heads / community managers / tenant-experience leads (they own amenity budgets and tenant experience). Warm intros where possible + a one-page free-pilot offer.
- **Commitments:** contact 5 operators by end of week 2, 10 by week 4; secure a second signed free pilot by week 6.
- **Named expansion targets:** WeWork India, Awfis, Smartworks, 91springboard, Innov8 (OYO Workspaces), Table Space, Cowrks; DLF leasing/community for towers.

---

## 18. Risks & mitigations
- **Density / cold-start** → launch one building, computed relevance, ~40–60 members is enough; operator drives sign-ups with our onboarding kit.
- **Operator buy-in / sales cycle** → start with coworking (fast decision), free pilot removes procurement friction, lead with retention ROI.
- **Match quality** → embeddings + LLM re-rank + fast feedback loop; human-feeling "why you two."
- **Scheduling friction** → use proven calendar APIs + Cal.com; propose times, don't negotiate.
- **Privacy/safety concerns** → no public profiles, mutual opt-in, no tracking, in-building public venues.
- **Engagement decay** → strict 3/week cadence, WhatsApp delivery, quality over volume; never add a feed to "boost engagement."

---

## 19. Open questions / decisions to revisit
- Final confirmation of warmest week-1 building (currently WoCo) — adjust if a tower has warmer access.
- Exact embeddings provider (OpenAI vs Voyage) — pick on cost/quality in build.
- Whether to add the skill-based "request an intro" escape hatch during or after pilot.
- Pricing validation: confirm the ₹25k–₹90k/centre tiers against real operator willingness-to-pay in weeks 1–4.
- Post-coffee outcome capture design (how light can it be while still proving ROI?).
- Multi-building/operator console timing.

---

## 20. Brand & design system (for any UI you build)
- **Mood:** warm, calm, premium, human, with a subtle cosmic/orbital undertone (rings, drifting dots = people in orbit). References: Linear's quiet confidence, a specialty-coffee brand's warmth, a design studio's typographic care. "A place, not an app."
- **Color (light):** bg `#FAF7F2`, elevated `#FFFCF7`, sunken `#F3EEE5`, ink `#221E1A`, soft ink `#57514A`, faint `#8A837A`, lines `#E7DFD3`/`#D8CDBD`. **Dark:** bg `#1A1714`, elevated `#221E1A`, ink `#F4EEE4`. Never pure white/black.
- **One signature accent:** warm amber / burnt caramel `#C8752D`–`#E08B3E` (deep `#A65E1F`). Used *sparingly* — CTAs, orbital lines, match connections, highlights. Rare = expensive.
- **Type:** **Fraunces** (display serif) for headlines; **Inter** (sans) for body. Large confident headlines, generous spacing. Type is the primary visual element.
- **Motion:** subtle, tasteful — scroll-reveal (fade+rise), slow faint orbital ring, gentle drifting dots, one refined hover micro-interaction. Calm confidence, never bouncy. Honor `prefers-reduced-motion`.
- **Copy voice:** confident, warm, concrete, few words. Short sentences. No buzzwords or corporate filler. Write like a founder with taste. **House style: no em dashes in visible copy** — use periods, commas, or colons.
- **Signature lines:** "AI finds the person. You have the coffee." · "Networking stops feeling random." · "AI does the awkward middle. You just show up." · "Just three people worth meeting each week."

---

## 21. Repository structure (current)
- `index.html` — the complete marketing/landing site (self-contained; all CSS/JS inline; Google Fonts only). Deployed on Vercel.
- `CONTEXT.md` — this file (full project context).
- `FEATURE_LIST.md` — detailed MVP/later feature list.
- `SUBMISSION_JOBSPEC.md` — accelerator job spec (building access, APIs, pricing).
- `screens/` — product screen mockups: `screens.html` (source) + rendered PNGs (`01-onboarding.png` … `05-operator-dashboard.png`).

> The **product app** described in §5–§14 is NOT built yet. This repo currently holds the marketing site, the design system, and the specs. Build the app as a new Next.js project using §7, §8, and §12 as the blueprint.

---

## 22. Glossary
- **Member:** a professional in a building who uses Orbit (free).
- **Operator:** the company that runs the building and pays for Orbit (coworking operator or landlord/management).
- **Give / Get (Give / Want):** the two lists each member fills — what they can offer and what they seek; the basis of matching.
- **Intro / introduction:** one AI-proposed match delivered to a member, with a "why you two."
- **The weekly three:** the (up to) three introductions a member receives each week.
- **Mutual opt-in:** a coffee books only when both people accept.
- **The anti-feed:** the product principle that Orbit has no posts/likes/followers/scroll.

---

## 23. One-paragraph pitch (for reuse)
Orbit is the professional network for the people inside your building. Instead of another feed, it uses AI to find the three people worth meeting each week — a designer two floors up, an engineer down the hall, the GTM lead who shares your elevator — explains why you two should meet, and books a 15-minute coffee. AI finds the person; you have the coffee. We sell it to building operators as a retention and leasing amenity (members free), start with one building in Gurugram, and manufacture relevance, not a timeline.
