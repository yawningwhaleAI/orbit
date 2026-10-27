import Link from "next/link";
import type { Metadata } from "next";
import { Wordmark, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Refunds",
  description: "Orbit's cancellation and refund policy.",
};

export default function RefundsPage() {
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
        <Eyebrow>Refunds</Eyebrow>
        <h1 className="font-serif text-[2.2rem] leading-tight">Cancellation and refunds.</h1>
        <p className="mt-3 text-ink-soft">
          This policy covers paid operator subscriptions. Members use Orbit for free. Last updated {new Date().getFullYear()}.
        </p>

        <div className="mt-10 space-y-8 text-ink-soft">
          <section>
            <h2 className="mb-2 font-serif text-xl text-ink">Cancelling</h2>
            <p>You can cancel your building&apos;s subscription at any time by emailing hello@withinorbit.space. Your plan stays active until the end of the period you&apos;ve paid for, and you won&apos;t be charged again.</p>
          </section>

          <section>
            <h2 className="mb-2 font-serif text-xl text-ink">Refunds</h2>
            <p>If you&apos;re not happy within the first 14 days of your first payment, email us and we&apos;ll refund that payment in full. After that, payments for the current month are non-refundable, but you can cancel to stop future charges.</p>
          </section>

          <section>
            <h2 className="mb-2 font-serif text-xl text-ink">Billing errors</h2>
            <p>If you were charged twice or charged by mistake, contact us and we&apos;ll refund the incorrect amount.</p>
          </section>

          <section>
            <h2 className="mb-2 font-serif text-xl text-ink">How refunds are paid</h2>
            <p>Refunds are processed through Dodo Payments to your original payment method, usually within 5–10 business days.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
