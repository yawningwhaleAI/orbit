# Orbit — What It Is, What We're Doing, What Problem We Solve

> Short context brief. For full detail see `CONTEXT.md` (idea and strategy) and `HANDOFF.md` (technical handoff).
> Live site: https://withinorbit.space · Repo: https://github.com/yawningwhaleAI/orbit

---

## 1. What is Orbit?

**Orbit is the professional network for the people inside your building.**

Every week, Orbit finds **three people in your own office tower or coworking space** who are worth meeting:
- someone who can **help you**, and
- someone **you can help**.

Then it **books a 15-minute coffee** downstairs. The AI does the matching, writes a one-line "why you two", and handles the scheduling. You just show up.

> **AI finds the person. You have the coffee.**

It is deliberately **not a feed**: no posts, no likes, no followers, no DMs. Just three good introductions a week.

---

## 2. The problem we're solving

**You share a building with hundreds of useful people, and you'll meet almost none of them.**

- Professionals network in two ways today: **who they've worked with** (past colleagues, alumni) and **who they're connected to online** (LinkedIn).
- There is a third way that nobody uses: **where you physically are.** The GTM expert six floors down, an investor in the next tower, a designer in the café.
- People badge in, go to their floor, and leave. Hybrid work made it worse. The chance hallway meetings that used to create useful connections have mostly disappeared.

**Why existing options fail:**

| Option | Why it doesn't work |
|---|---|
| LinkedIn | Global, not local. Built for posting, not meeting. |
| Events / mixers | Rare, awkward, and the same extroverts show up every time. |
| Coworking member directories | Passive. You have to browse and reach out yourself, and almost nobody does. |
| Building WhatsApp/Slack groups | Noisy broadcasts with no matching. |

**The gap:** nothing proactively introduces you to the *specific* people near you who are worth your time and removes the awkwardness of reaching out. Orbit fills that gap.

---

## 3. Who it's for (B2B2C)

| | Who | What they get |
|---|---|---|
| **Member (user)** | Founders, operators, engineers, designers, sales leaders, investors working in the building | 3 high-signal intros a week, zero networking effort. **Free.** |
| **Operator (buyer, pays)** | Coworking operators (WoCo, Awfis, Smartworks, WeWork) and office-tower management (e.g. DLF) | Tenant retention, a leasing differentiator, and engagement data to show leadership. **₹15,000 / building / month.** |

Members are free because the product only works when many people in a building join. The operator pays because it's a tenant-engagement amenity.

**Launch market:** Gurugram, India. Pilot cluster: **DLF Tower, CDS, Capital Building, WoCo** (WoCo is the lead pilot).

---

## 4. How it works

1. **Join**: scan a QR flyer or open the building's invite link (`/join/<CODE>`) and sign in with a magic link (no password).
2. **Profile in 2 minutes**: upload a resume (AI autofills it) or type a few lines: role, company, what you can **give**, what you **want**.
3. **Get 3 intros a week**: weekly AI matching pairs complementary people (my "give" ↔ your "want") and explains why.
4. **Book the coffee**: pick a 15-minute slot you're both free for; the other person confirms. Both get emails and a calendar link, plus a reminder the day before.
5. **Feedback**: after the coffee, "Did you meet? Was it worth it?" This feeds the operator dashboard.

**Operator dashboard:** members joined, activation funnel, coffees confirmed and held, show-up rate, worth-it rate, members by floor, and a printable QR code for the building's invite link.

---

## 5. What we've built (current status)

**Live at https://withinorbit.space**, a working product, not a mockup.

- Next.js 14 web app (mobile-friendly), Postgres database, hosted on Vercel, custom domain + HTTPS
- Secure magic-link login (Resend email, verified domain)
- Resume autofill (PDF/DOCX) and AI matching via OpenRouter, with Gemini as a fallback
- Two-sided coffee booking: propose → confirm / decline / reschedule / cancel
- Day-before reminders, post-coffee feedback, operator analytics dashboard, invite links and QR codes
- Privacy, Terms and Refund pages, plus a sitemap and SEO basics

**Integrations added for launch:**
- **Microsoft Clarity**: session recordings and heatmaps (installed, receiving live visitors)
- **Google Search Console**: site verified, sitemap submitted
- **Dodo Payments**: pricing section with a subscription checkout for operators (₹15,000/month + GST). Checkout works in test mode; live-mode verification has been submitted.

---

## 6. How we measure success

- **Activation:** % of new members with a *confirmed* coffee within 7 days of signing up.
- **North star:** coffees held per member per month, tracked per building.
- **Riskiest assumption:** strangers in the same building will accept an intro and actually show up.
- **Test:** 20 people in one building for one week. Success means more than 50% of booked coffees actually happen.

---

## 7. Next steps

1. Run the WoCo pilot and get 50+ opted-in members.
2. Switch Dodo to live payments once verification is approved and sign the first paying operator.
3. Add WhatsApp reminders (India's default channel) and company-email verification on signup.
4. Use feedback ("worth it?") to improve matching quality.
