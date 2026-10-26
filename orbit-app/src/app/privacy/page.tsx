import Link from "next/link";
import type { Metadata } from "next";
import { Wordmark, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Orbit handles your data.",
};

export default function PrivacyPage() {
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
        <Eyebrow>Privacy</Eyebrow>
        <h1 className="font-serif text-[2.2rem] leading-tight">Your data, handled simply.</h1>
        <p className="mt-3 text-ink-soft">
          Orbit is a private, invite-based network inside your building. Here&apos;s what we collect
          and why, in plain language. Last updated {new Date().getFullYear()}.
        </p>

        <div className="mt-10 space-y-8 text-ink-soft">
          <section>
            <h2 className="mb-2 font-serif text-xl text-ink">What we collect</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Your name and work email (to create your account and sign you in).</li>
              <li>The profile you enter: role, company, education, building, floor, and the
                &ldquo;give / want&rdquo; tags you choose.</li>
              <li>
                If you upload a resume, we read its text to pre-fill those fields. We do{" "}
                <strong>not</strong> store the file — only the fields you then save.
              </li>
              <li>The intros you receive and the coffees you book.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 font-serif text-xl text-ink">How we use it</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>To match you with three reciprocal people in your building each week.</li>
              <li>To schedule coffees and send you sign-in and booking emails.</li>
              <li>
                Building operators see <em>aggregate</em> engagement (how many intros and coffees
                happened) — not your private profile details or messages.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 font-serif text-xl text-ink">What we don&apos;t do</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>We don&apos;t sell your data or share it with advertisers.</li>
              <li>We don&apos;t post anything publicly — there is no feed.</li>
              <li>We don&apos;t show your profile to people outside your building.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 font-serif text-xl text-ink">Your choices</h2>
            <p>
              You can edit your profile any time, or ask us to delete your account and data by
              emailing{" "}
              <a href="mailto:hello@withinorbit.space" className="text-accent-deep hover:underline">
                hello@withinorbit.space
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
