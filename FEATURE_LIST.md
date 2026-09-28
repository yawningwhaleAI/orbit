# Orbit — Feature List

Features grouped by area. Each line says what it is and why it matters. Bold = in the 8-week MVP; *(later)* = fast-follow after pilot.

## Member — Onboarding & profile
- **Building invite code join** — you enter a code given by your building/operator, which ties your account to that building. This is how we guarantee everyone you meet is actually in your building, without GPS tracking.
- **Work email / SSO verification** — sign in with Google or Microsoft (or email OTP); corporate email domains are allow-listed per building so members are verified, real people.
- **Lightweight profile** — a few lines, no résumé to polish: role, company, education, and free-text interests.
- **"I can give" / "I want" lists** — the heart of Orbit. You list what you can offer (e.g. design feedback, hiring advice, angel intros) and what you're looking for (e.g. a technical co-founder, GTM help). This is what the AI matches on.

## Member — Matching & the weekly intro
- **AI matching engine** — turns each profile into an embedding (vector) and finds complementary pairs: your "give" meeting someone's "want" and theirs meeting yours. Runs weekly per building.
- **3 intros per week** — you get up to three curated introductions each week. Deliberately capped — quality over a feed.
- **"Why you two" reason** — every intro comes with one AI-written sentence explaining the specific reason you two should meet. This is what makes it feel personal, not random.
- **Accept / Pass** — one tap. Accept books the coffee; Pass quietly drops it, no explanation needed, and feeds back into future matching.
- **Weekly delivery via WhatsApp + email** — intros arrive where Indian professionals actually are (WhatsApp), with email fallback.

## Member — Scheduling the coffee
- **15-minute coffee booking** — on accept, Orbit proposes a time and a spot (e.g. the ground-floor café) and books it. No back-and-forth.
- **Calendar integration** — adds the meeting to both people's Google/Outlook calendars via calendar APIs; sends reminders.
- **Reschedule / cancel** — either person can move or cancel; the other is notified automatically.
- **Geofence check-in** *(later)* — an optional one-tap "I'm here" at coffee time using the browser location, to confirm meetings actually happen (feeds success metrics). No background tracking.

## Operator — Dashboard (the B2B buyer's view)
- **Members joined** — how many tenants have opted in, by company/floor.
- **Engagement metrics** — weekly intros sent, accept rate, coffees booked and held.
- **Retention / community read** — a simple view the operator can show leadership to justify the amenity (participation over time, repeat meetings).
- **Invite-code & member management** — generate codes, manage the building's member list, remove people who leave.
- **Multi-building support** *(later)* — one operator managing several centres from a single dashboard (relevant for WoCo / DLF across our launch cluster).

## Platform & trust
- **Privacy-first design** — no public profiles, no follower counts, no feed. Your give/want is used only for matching, not displayed publicly.
- **Verified-only network** — real people in real buildings; invite code + email verification keep out spam.
- **No feed, ever** — the explicit product guardrail: no posts, likes, followers, or endless scroll. Just three people worth meeting each week.
- **Matching feedback loop** — accept/pass signals continuously improve match quality per building.

## Explicitly NOT building (scope discipline for 8 weeks)
- No native iOS/Android app (mobile web is enough for the pilot).
- No real-time/continuous GPS tracking.
- No custom-trained ML model (we use embeddings + an LLM re-ranker).
- No in-app chat or feed — Orbit's job ends at "you two are meeting for coffee."
