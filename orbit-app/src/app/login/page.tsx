import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Wordmark, Eyebrow, buttonClass } from "@/components/ui";
import { ArrowRight, Check } from "@/components/icons";
import { requestMagicLink } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; mode?: string; sent?: string };
}) {
  const user = await getCurrentUser();
  if (user) {
    if (user.isOperator) redirect("/dashboard");
    redirect(user.onboarded ? "/home" : "/onboarding");
  }

  const signup = searchParams?.mode !== "login"; // default to sign-up
  const sent = searchParams?.sent === "1";

  if (sent) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <Link href="/" className="mb-10 inline-block">
          <Wordmark />
        </Link>
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-[color:var(--accent-tint)] text-accent-deep">
          <Check className="h-6 w-6" />
        </div>
        <h1 className="text-[2rem] leading-tight">Check your email.</h1>
        <p className="mt-3 text-ink-soft">
          We sent you a one-time sign-in link. It works once and expires in 20 minutes. Open it in
          this same browser. If you don&apos;t see it, check spam.
        </p>
        <Link href="/login" className="mt-6 text-sm text-accent-deep hover:underline">
          ← Use a different email
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <Link href="/" className="mb-10 inline-block">
        <Wordmark />
      </Link>

      <Eyebrow>{signup ? "Join your building" : "Welcome back"}</Eyebrow>
      <h1 className="text-[2rem] leading-tight">
        {signup ? (
          <>
            Sign up for <em className="not-italic text-accent-deep">Orbit</em>.
          </>
        ) : (
          <>
            Log in to <em className="not-italic text-accent-deep">Orbit</em>.
          </>
        )}
      </h1>
      <p className="mt-3 text-ink-soft">
        {signup
          ? "Enter your work email to create your account. Next you'll set up your profile and get your first three intros."
          : "Enter the work email you signed up with to continue."}
      </p>

      {searchParams?.error && (
        <p className="mt-4 rounded-lg border border-accent bg-[color:var(--accent-tint)] px-3 py-2 text-sm text-accent-deep">
          {searchParams.error === "expired"
            ? "That sign-in link has expired or was already used. Enter your email to get a fresh one."
            : searchParams.error === "unavailable"
              ? "Sign-in is temporarily unavailable. Please try again shortly."
              : "Please enter a valid email."}
        </p>
      )}

      <form action={requestMagicLink} className="mt-8 space-y-3">
        <input type="hidden" name="mode" value={signup ? "signup" : "login"} />
        {signup && (
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-faint">
              Name
            </label>
            <input
              name="name"
              type="text"
              placeholder="Your name"
              className="w-full rounded-xl border border-line bg-elev px-4 py-3 text-ink outline-none focus:border-accent"
            />
          </div>
        )}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-faint">
            Work email
          </label>
          <input
            name="email"
            type="email"
            required
            placeholder="you@work.com"
            className="w-full rounded-xl border border-line bg-elev px-4 py-3 text-ink outline-none focus:border-accent"
          />
        </div>
        <button type="submit" className={buttonClass("primary") + " w-full"}>
          Email me a sign-in link <ArrowRight className="h-4 w-4" />
        </button>
        <p className="text-center text-xs text-ink-faint">
          No password. We&apos;ll send a secure one-time link.
        </p>
      </form>

      <p className="mt-6 text-sm text-ink-faint">
        {signup ? (
          <>
            Already have an account?{" "}
            <Link href="/login?mode=login" className="text-accent-deep hover:underline">
              Log in
            </Link>
          </>
        ) : (
          <>
            New to Orbit?{" "}
            <Link href="/login?mode=signup" className="text-accent-deep hover:underline">
              Sign up
            </Link>
          </>
        )}
      </p>
    </main>
  );
}
