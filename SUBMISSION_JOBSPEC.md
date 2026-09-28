# Orbit — Job Spec / Product Spec

**One line:** Orbit is the professional network for the people inside your building. AI finds the three people worth meeting each week and books a 15-minute coffee. AI finds the person; you have the coffee.

**Market entry:** Gurugram, India (office towers, business parks, and coworking centres in DLF Cyber City / Cyber Hub, Golf Course Road, Udyog Vihar).

> NOTE TO SELF — replace **[PILOT BUILDING]** below with the exact confirmed building/coworking centre name before submitting.

---

## 1. What we're building (MVP scope for 8 weeks)

A single web app (mobile-first, no native app needed for the pilot) with two surfaces:

**Member app**
1. Join with a building-specific invite code → verify → build a lightweight profile (role, company, education, "what I can give", "what I want").
2. Receive up to 3 AI-matched introductions per week, each with a one-line "why you two".
3. Accept or pass. On accept, Orbit books a 15-minute coffee (slot + ground-floor café) and notifies both people.

**Operator dashboard**
- Members joined, weekly intros sent, accept rate, meetings booked/held, and a simple retention/engagement read the operator can show their leadership.

We are deliberately **narrowing scope** to what is buildable and de-risked in 8 weeks (see §4). We are NOT building native mobile apps, real-time GPS tracking, or a custom ML model in the pilot.

---

## 2. Reviewer question 1 — Building access & week-1 outreach

**Pilot building:** **[PILOT BUILDING]** in Gurugram — a building/coworking centre we have direct access to for a captive first pilot. This gives us a warm first customer instead of a cold start.

**Week-1 outreach plan (concrete):**
- Week 1: Secure a verbal/LOI free-pilot agreement with the **[PILOT BUILDING]** centre head / community manager. Ask: run a free 60-day pilot on one floor/centre, target 50+ opted-in members.
- Weeks 1–4 pipeline (in parallel, so we're not single-threaded on one building): contact 8–10 Gurugram operators to line up pilot #2 and validate willingness-to-pay. Named targets:
  - **WeWork India** (Cyber City / Two Horizon Center) — community managers per centre.
  - **Awfis** (multiple Gurugram centres; India's largest listed flexible-workspace operator).
  - **Smartworks**, **91springboard**, **Innov8 (OYO Workspaces)**, **Table Space**, **Cowrks**.
  - **DLF** office leasing / community team (Cyber City towers) — amenity/retention angle.
- Channel: direct outreach to centre heads and community managers (the people who own tenant experience and amenity budgets), warm intros where possible, plus a one-page pilot offer.
- Concrete commitment: "Contact 5 Gurugram coworking operators by end of week 2; 10 by end of week 4; secure 1 signed free-pilot beyond the captive building by week 6."

**Why this is reachable:** Gurugram has one of the densest clusters of coworking/office towers in India. Community managers actively look for differentiated tenant experiences, and a free pilot removes procurement friction.

---

## 3. Reviewer question 2 — Third-party APIs & tools (scope + build-risk reduction)

We use proven third-party services for every hard part; we build the matching/orchestration layer.

**AI matching** — no custom-trained model.
- Structured profile → text embeddings via **OpenAI `text-embedding-3-small`** (or Voyage/Anthropic embeddings).
- Store vectors in **Supabase Postgres + pgvector**; score complementary fit (my "give" ↔ your "want", and vice-versa) with cosine similarity + rule-based boosts (same building, shared interests, seniority fit).
- Re-rank the weekly top candidates and generate the "why you two" sentence with the **Anthropic Claude API**.
- Weekly batch job, not real-time. This is a well-trodden embeddings + retrieval pattern, not research.

**Calendar & scheduling** — third-party, not in-house.
- **Cal.com** (open-source, self-hostable) for 15-minute slot booking, backed by **Google Calendar API** and **Microsoft Graph (Outlook)** for corporate accounts.
- Notifications via **WhatsApp Business API (Gupshup or Twilio)** — WhatsApp is the default channel in India — plus email fallback (Resend/Postmark).

**Location / building verification** — phased, privacy-friendly, no heavy tracking.
- Phase 1 (pilot): building-specific **invite code** distributed by the operator + **corporate email-domain allowlist** per building + self-declared floor/company. This is enough to guarantee "same building" for matching.
- Phase 2 (optional, in-pilot): lightweight **geofence check-in** at coffee time using the browser Geolocation API (confirm both parties are on-site when a meeting is accepted). No continuous/background location.

**Auth & identity**
- Email OTP + Google / Microsoft SSO. Building identity is attached at signup via the invite code.

**Stack (to minimise build risk)**
- **Next.js on Vercel** (we already deploy the landing page here), **Supabase** (Postgres + Auth + pgvector), background jobs via **Vercel Cron / Inngest**, **Claude API** for matching narratives, **Google Calendar API + Cal.com** for scheduling, **Gupshup/Twilio WhatsApp** for delivery. Operator dashboard is part of the same Next.js app.

None of these are missing stack names — they are the concrete, integratable services that remove the "non-trivial" build risk the reviewer flagged.

---

## 4. Reviewer question 3 — Monetisation, pricing & pilot terms

**Model:** B2B2C. Operators pay; members are free (density depends on it).

**Recommended pricing (to validate in pilot):**
- **Free 60-day pilot**, one building/centre, target **50+ active members**.
- **Post-pilot: flat monthly platform fee per centre**, positioned as a retention/amenity line item:
  - ≤ 100 members: **₹25,000/month**
  - 100–300 members: **₹50,000/month**
  - 300+ members: **₹90,000/month** (or custom for multi-centre)
- Alternative for operators who prefer usage-based: **₹350–500 / active member / month** with a monthly minimum.

**Why flat-per-centre:** Indian operators budget amenities per centre, not per SaaS seat; a flat fee is predictable, easy to approve, and avoids under-reporting incentives.

**Minimum viable pilot terms:**
- 1 building, free for 60 days, 50+ opted-in members.
- Success metrics: **≥ 40% weekly intro accept rate**, **≥ 60% of accepted coffees actually held**, member NPS ≥ 40, and an operator-visible engagement lift.
- Conversion: at end of pilot, convert to the flat monthly fee for that centre and expand to adjacent centres.

**Willingness-to-pay validation (weeks 1–4):** in every operator conversation, ask the amenity/retention budget and test the ₹25k–₹90k/centre range explicitly, so pricing is evidence-based by week 4, not assumed.

---

## 5. Why it works even when small (density / network-effect answer)

The reviewer flags minimum viable density. Our answer: relevance is **computed, not crowd-sourced**, so we don't need a large network to be useful.
- Even **60 members** in one building create **~1,770 unique pairs** to match on — ample supply for 3 quality intros/member/week.
- We launch **one building at a time** and only need ~40–60 opted-in members in a single building to make matching work — a reachable pilot number, not a citywide network.
- This is why the empty-network problem that kills community apps doesn't apply here.

---

## 6. 8-week build plan

- **Week 1:** Lock free pilot at **[PILOT BUILDING]**; build auth + invite-code building identity + profile capture (give/want). Start operator outreach pipeline.
- **Week 2:** Matching engine v1 (embeddings + complementary-fit scoring in pgvector); seed 30–50 members in the pilot building.
- **Week 3:** Weekly intro delivery + accept/pass; calendar booking via Cal.com + Google Calendar; WhatsApp/email notifications.
- **Week 4:** First live introductions in the pilot building; operator dashboard v1 (members, intros, accept rate, meetings booked). Hit 5–10 operators contacted.
- **Weeks 5–6:** Improve match quality from real accept/pass data; add optional geofence check-in; instrument retention metrics; sign pilot #2.
- **Week 7:** Polish, measure activation (accept rate, meetings held), collect testimonials.
- **Week 8:** Pilot readout + case study; convert pilot building to paid flat fee; pricing validated across ≥10 operator conversations.

---

## 7. Digital / automation (already met)

The core value — AI matching, weekly recommendation delivery, and coffee booking — is fully automated once a building is live. Human effort is limited to initial operator onboarding (white-glove, one-time per building). No manual matchmaking, no physical fulfilment.

---

## 8. Summary of changes made in response to feedback

- **Named a pilot building** ([PILOT BUILDING], Gurugram) + a concrete week-1 outreach plan and named operator targets.
- **Specified every third-party API**: OpenAI/Voyage embeddings + Claude for matching, Google Calendar + Cal.com for scheduling, invite-code + email-domain (then optional geofence) for location, Supabase/Next.js/Vercel stack.
- **Committed to a pricing model and pilot terms** (free 60-day pilot → flat ₹/centre/month) with in-pilot willingness-to-pay validation.
- **Reframed density** as a computed-relevance advantage that works at ~40–60 members in one building.
