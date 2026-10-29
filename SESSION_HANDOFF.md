# Orbit — Session Handoff (Oct 27–29, 2026)

> Paste this into a new Claude chat to continue where we left off.
> Also read `HANDOFF.md` (full technical handoff) and `ORBIT_CONTEXT.md` (what Orbit is) in the repo.

## Project basics
- **Orbit**: the professional network inside your building. AI finds 3 people a week in your office tower or coworking space and books a 15-minute coffee. Members are free; building operators pay ₹15,000 per building per month.
- **Live site:** https://withinorbit.space
- **Repo:** https://github.com/yawningwhaleAI/orbit. The Next.js app lives in `orbit-app/`.
- **Hosting:** Vercel project `orbit-app` (team `yawningwhaleais-projects`). Pushing or merging to `main` deploys automatically.
- **Domain:** GoDaddy DNS. **Email:** Resend (domain `withinorbit.space` verified).
- **Owner:** Aryan Singh (aryanaiagents@gmail.com)

## What was done in this session

### 1. Code added (branch `claude/affectionate-brahmagupta-lg221s`, merged to `main` and live)
- `src/app/layout.tsx`: **Microsoft Clarity** script loads when `NEXT_PUBLIC_CLARITY_ID` is set; **Google site-verification** meta tag from `GOOGLE_SITE_VERIFICATION`.
- `src/app/page.tsx`: new **Pricing section** (Members: free; Building operators: ₹15,000/building/month). The operator button links to `NEXT_PUBLIC_DODO_CHECKOUT_URL`, or falls back to a mailto link if that's unset. The footer now links Pricing, Privacy, Terms and Refunds.
- New pages: `src/app/terms/page.tsx` and `src/app/refunds/page.tsx` (Dodo requires these for approval). Both were added to `sitemap.ts`.
- `.env.example`: documents the 3 new variables.
- Added `ORBIT_CONTEXT.md` (short brief on what Orbit is and the problem it solves). It was committed to the branch **after** the merge, so it may not be on `main` yet.

### 2. Vercel environment variables added (type: Config, Production)
| Key | Value / note |
|---|---|
| `NEXT_PUBLIC_CLARITY_ID` | `z4dsbp4cv9` |
| `GOOGLE_SITE_VERIFICATION` | the Search Console HTML-tag code |
| `NEXT_PUBLIC_DODO_CHECKOUT_URL` | `https://test.checkout.dodopayments.com/buy/pdt_0Nqf9AHKnWKHIOAsDzMqT?quantity=1` (TEST mode) |

### 3. Integrations status
- ✅ **Microsoft Clarity**: installed and receiving live visitors.
- ✅ **Google Search Console**: URL-prefix property `https://withinorbit.space/` verified via the HTML tag. A service account `orbit-780@deep-arch-512918-n4.iam.gserviceaccount.com` was added as a **Restricted** user so a submission platform can read SC data.
  - ⚠️ That submission platform's "Connect source" step failed with "Google rejected this connection". Likely fixes: enable the **Google Search Console API** in GCP project `deep-arch-512918-n4`; enter the property as `https://withinorbit.space/` (with the trailing slash); check that the pasted JSON's `client_email` matches the service account. Not confirmed fixed.
  - Sitemap submission (`sitemap.xml`) was recommended. Unconfirmed whether it was done.
- ✅ **Dodo Payments (test mode)**: product "Orbit – Building Plan", subscription, ₹15,000/month INR (checkout shows +18% GST = ₹17,700). Checkout opens from the site.
  - ⏳ **Dodo live verification** was being filled in: Product Information step (website, SaaS category, instant + subscription access, low human involvement, "None of the above", Payment links, stage Live/MVP, current platform NONE). The Personal and Bank steps are not confirmed done.
  - Once approved: switch to Live Mode, recreate the product, put the live link (without `test.`) into `NEXT_PUBLIC_DODO_CHECKOUT_URL`, then Redeploy.

### 4. 🔴 Open issue: login is broken on production
- Sign-up at withinorbit.space shows **"Sign-in is temporarily unavailable"**, which comes from `/login?error=unavailable`.
- In the code (`src/app/login/actions.ts`, `src/lib/auth.ts`) this happens only when **`RESEND_API_KEY` is missing or empty** OR **`AUTH_SECRET` is shorter than 32 characters** in production.
- Next steps given to the owner: in Vercel, check that `RESEND_API_KEY` exists with Production ticked; replace `AUTH_SECRET` with a known 32+ character value (`openssl rand -base64 32`); set `EMAIL_FROM=Orbit <hello@withinorbit.space>` and `APP_URL=https://withinorbit.space`; **Redeploy**; retest in incognito.
- Optional: add DMARC TXT record `_dmarc` → `v=DMARC1; p=none; rua=mailto:aryanaiagents@gmail.com` in GoDaddy.

## What's next (after login works)
Candidate features from `HANDOFF.md` §13. The owner hasn't picked one yet:
1. WhatsApp coffee reminders
2. Company-email domain verification on signup (`InviteCode.emailDomains` exists)
3. Feedback-informed matching (use "worth it?" feedback to improve matches)

## Notes for the next assistant
- Workflow: develop on a branch, then merge to `main` to deploy. Secret values live only in Vercel and are never committed.
- The owner is non-technical and on a tight credit budget: give short, numbered, click-by-click steps.
- Cloud sandboxes can't reach withinorbit.space (proxy blocks it), so the owner must test the live site and send screenshots.
