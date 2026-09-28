# Orbit — Feature List

Orbit is the professional network for the people inside your building. AI finds the three people worth meeting each week and books a 15-minute coffee. It is explicitly NOT a feed — no posts, likes, followers, or endless scroll.

Features are grouped by area. Each line says what it is and why it matters.
Legend: **[MVP]** = built in the 8-week pilot · **[Later]** = fast-follow after the first paid pilot.

---

## 1. Getting in — onboarding & identity

- **Building invite code join [MVP]** — You join with a code given by your building or operator (e.g. WoCo, DLF Tower). The code ties your account to that specific building. This is how Orbit guarantees everyone you meet is actually in your building, without any GPS tracking.
- **Work email / SSO sign-in [MVP]** — Sign in with Google or Microsoft, or a one-time email code (OTP). Fast, passwordless, and familiar.
- **Corporate email-domain allow-list [MVP]** — Each building can allow-list the email domains of its tenant companies, so only real, verified people from that building can join. Keeps out spam and randoms.
- **Floor & company capture [MVP]** — During signup you note your company and floor. This powers "the person two floors up" proximity context and lets operators see participation by company.
- **60-second setup [MVP]** — The whole onboarding is a few taps. No long forms, no résumé. Designed so a busy professional finishes it in the lift.
- **Manual location fallback + optional geofence check-in [MVP / Later]** — For the pilot, building membership is proven by invite code + email domain (no tracking). Later, an optional one-tap "I'm here" at coffee time (browser location) confirms meetings actually happened. Never background tracking.

## 2. Your profile — the "Give / Get" model

- **"I can give" list [MVP]** — You list what you can offer: e.g. product strategy, hiring advice, design feedback, intros to investors, legal know-how. This is one half of what the AI matches on.
- **"I want" list [MVP]** — You list what you're looking for: e.g. a technical co-founder, GTM help, a mentor, customers, fundraising intros. The other half of the match.
- **Suggested tags + free text [MVP]** — Orbit suggests common give/want tags so you can tap instead of type, but you can add anything in your own words.
- **Lightweight bio fields [MVP]** — Role, company, education, and a one-line "what I'm working on." Just enough for a warm, human match — nothing to polish.
- **Interests & topics [Later]** — Optional non-work interests (running, chess, parenting) so matches can also be human, not only transactional.
- **Availability & preferences [Later]** — Set how many intros you want per week, preferred meeting times, and pause anytime.

## 3. The weekly introduction — Orbit's core loop

- **AI matching engine [MVP]** — Turns each profile into a vector (embedding) and finds complementary pairs: your "give" meeting someone's "want," and theirs meeting yours. Two-way relevance is scored highest. Runs weekly, per building.
- **Complementary-fit scoring [MVP]** — Beyond raw similarity, Orbit boosts matches where the exchange runs both directions, where seniority fits (mentor/mentee), and where people share a building, floor cluster, or interest.
- **3 introductions per week [MVP]** — You receive up to three curated intros each week. Deliberately capped — this is the anti-feed. Quality over volume.
- **"Why you two" reason [MVP]** — Every introduction comes with one AI-written sentence explaining the specific reason you two should meet. This is what makes it feel personal and considered, not random spam.
- **Match confidence score [MVP]** — Each intro shows a simple match strength (e.g. "92% match") so you can prioritise.
- **Accept / Pass [MVP]** — One tap. Accept books the coffee; Pass quietly drops it — no awkward decline message to the other person, and no explanation needed from you.
- **Feedback loop [MVP]** — Every accept/pass (and later, whether the coffee happened) feeds back to improve future matches for you and the whole building.
- **Weekly cadence & reset [MVP]** — Intros arrive on a set day each week; unactioned ones expire so your list never piles up. Fresh three, every week.
- **Reason transparency & mutual opt-in [MVP]** — A coffee is only booked when both people accept, so no one is ambushed.

## 4. Scheduling the coffee — the automated middle

- **15-minute coffee booking [MVP]** — On accept, Orbit proposes a time and a spot (e.g. the ground-floor café) and books it. No back-and-forth messaging.
- **Smart time suggestion [MVP]** — Orbit proposes a slot that works for both calendars and both people's stated preferences.
- **Calendar integration [MVP]** — Adds the meeting to both people's Google or Outlook calendars via calendar APIs, with a location and a short agenda ("why you two").
- **Reschedule / cancel [MVP]** — Either person can move or cancel in one tap; the other is notified automatically and a new slot is offered.
- **In-building venue suggestions [MVP]** — Orbit knows the building's café/lounge and proposes a convenient on-site spot, reinforcing that these people are steps away.
- **Reminders [MVP]** — Timely nudges before the meeting on WhatsApp and email so coffees actually happen.
- **Post-coffee check-in [Later]** — A light "How did it go?" prompt that captures whether the meeting happened and how useful it was — feeding both match quality and operator metrics.

## 5. Notifications & channels

- **WhatsApp delivery [MVP]** — Weekly intros, confirmations, and reminders arrive on WhatsApp, where Indian professionals actually are. Highest open rates.
- **Email fallback [MVP]** — Everything is mirrored to email for anyone who prefers it.
- **In-app notifications [MVP]** — A clean home screen showing this week's three intros and any upcoming coffees.
- **Quiet by design [MVP]** — Orbit contacts you at most a few times a week. No engagement-farming pings, ever.

## 6. Operator dashboard — the B2B buyer's view

- **Building overview [MVP]** — At-a-glance health: active members, intros sent, accept rate, and coffees held.
- **Engagement over time [MVP]** — A simple chart of meetings held per week, so the operator can see the community coming alive and show it to leadership.
- **Members view [MVP]** — Who has joined, by company and floor; adoption across the building.
- **Recent introductions feed [MVP]** — A live view of intros made and their status (booked / met), so the operator sees real activity.
- **Retention & community signal [MVP]** — Participation trends and repeat-meeting rates — the evidence that justifies the amenity spend and supports lease renewals.
- **Invite-code & member management [MVP]** — Generate and share building codes, manage the member list, and remove people who leave the building.
- **Onboarding kit [MVP]** — Ready-made posters, email templates, and QR codes the operator uses to drive tenant sign-ups in week one.
- **Multi-building management [Later]** — One operator (e.g. a coworking chain or DLF across multiple towers) managing several centres from a single dashboard.
- **Exportable reports [Later]** — Monthly PDF/CSV summaries the operator can circulate internally or use in leasing conversations.
- **Billing & plan management [Later]** — See the current plan, member tier, and invoices; upgrade as the building grows.

## 7. Trust, safety & privacy

- **Verified-only network [MVP]** — Invite code + email verification means real people in real buildings. No fake profiles.
- **No public profiles [MVP]** — Your give/want is used only to generate matches; it is not a browsable, public directory. Nobody scrolls a list of everyone in the building.
- **Mutual, private introductions [MVP]** — Details are shared only when both people accept. Pass is silent and private.
- **Block & report [MVP]** — One-tap block so you never get matched with someone again, plus reporting for the operator to act on.
- **Data minimisation [MVP]** — We collect only what's needed to match and schedule. No continuous location, no message scraping.
- **Leave anytime [MVP]** — Pause intros or delete your account and data in one tap.

## 8. The no-feed guarantee (product guardrails)

- **No posts, no likes, no followers, no comments [MVP]** — There is nothing to broadcast and nothing to perform. Orbit is not social media.
- **No infinite scroll [MVP]** — The home screen is three people this week, then you're done. The product's job ends at "you two are meeting for coffee."
- **No vanity metrics [MVP]** — No follower counts, no clout. Success is a real 15-minute coffee, not engagement.

## 9. Platform, stack & reliability (build-risk notes)

- **AI via embeddings + LLM re-ranker [MVP]** — Profiles → embeddings (OpenAI/Voyage) stored in Postgres + pgvector; the weekly shortlist is re-ranked and the "why you two" line written by the Anthropic Claude API. No custom model training required.
- **Calendar via Google Calendar API + Cal.com [MVP]** — Proven scheduling infrastructure, not built in-house.
- **Messaging via WhatsApp Business API (Gupshup/Twilio) [MVP]** — Reliable delivery on India's default channel.
- **Auth via Google/Microsoft SSO + email OTP [MVP]** — Standard, secure, passwordless.
- **Web app on Next.js + Vercel, data on Supabase [MVP]** — Mobile-first responsive web (no native app needed for the pilot); fast to build, easy to iterate, scales per building.
- **Weekly batch jobs (Vercel Cron / Inngest) [MVP]** — Matching and delivery run on a schedule; simple, observable, cheap.

## 10. Explicitly NOT building in the pilot (scope discipline)

- **No native iOS/Android apps** — Mobile web covers the pilot; native comes only if adoption demands it.
- **No real-time/continuous GPS tracking** — Building identity comes from invite codes and email domains, not surveillance.
- **No custom-trained ML model** — We stand on embeddings + an LLM re-ranker, which is enough for high-quality matches.
- **No in-app chat or feed** — Orbit hands off to a real coffee; conversation happens in person, not in another inbox.

---

## Roadmap after the pilot (direction, not commitments)

- Multi-building and multi-city rollout with a single operator console.
- Post-coffee outcomes tracking to prove ROI (meetings → collaborations → hires → deals).
- Smarter matching from accumulated accept/pass and outcome data.
- Events layer: opt-in small-group coffees and themed meetups within a building.
- Operator API / HRIS & access-system integrations for automatic member provisioning.
- Regional language support for onboarding and notifications.
