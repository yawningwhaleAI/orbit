import Link from "next/link";
import type { Metadata } from "next";
import { Wordmark, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms for using Orbit.",
};

export default function TermsPage() {
  return (
    <div>
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
          <Wordmark />
          <Link href="/" className="text-sm text-ink-soft hover:text-ink">
            ← Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-12">
        <Eyebrow>Terms</Eyebrow>
        <h1 className="font-serif text-[2.2rem] leading-tight">Terms of service.</h1>
        <p className="mt-3 text-ink-soft">
          These terms cover your use of Orbit (withinorbit.space). By using Orbit you agree to them. Last updated {new Date().getFullYear()}.
        </p>

        <div className="mt-10 space-y-8 text-ink-soft">
          <section>
            <h2 className="mb-2 font-serif text-xl text-ink">The service</h2>
            <p>Orbit matches people who work in the same building and helps them book short in-person coffees. Members use Orbit free of charge. Building operators pay a monthly subscription for their building.</p>
          </section>

          <section>
            <h2 className="mb-2 font-serif text-xl text-ink">Your account</h2>
            <p>Sign in with an email address you control. Keep your profile honest and up to date. You are responsible for activity on your account.</p>
          </section>

          <section>
            <h2 className="mb-2 font-serif text-xl text-ink">Acceptable use</h2>
            <p>Be respectful to the people you meet. Don&apos;t use Orbit to spam, harass, sell to people who haven&apos;t asked, or collect other members&apos; data. We may suspend accounts that break these rules.</p>
          </section>

          <section>
            <h2 className="mb-2 font-serif text-xl text-ink">Subscriptions and payment</h2>
            <p>Operator plans are billed monthly in advance through our payment partner, Dodo Payments, which acts as merchant of record. Prices are shown on our pricing section and include applicable taxes where required. You can cancel at any time; cancellation takes effect at the end of the current billing period.</p>
          </section>

          <section>
            <h2 className="mb-2 font-serif text-xl text-ink">Liability</h2>
            <p>Orbit is provided as is. We do our best to keep it running and accurate, but we are not responsible for what happens at meetings arranged between members.</p>
          </section>

          <section>
            <h2 className="mb-2 font-serif text-xl text-ink">Changes and contact</h2>
            <p>We may update these terms and will post the new version here. Questions: hello@withinorbit.space.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
