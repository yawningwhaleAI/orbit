import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Wordmark, Eyebrow, buttonClass } from "@/components/ui";
import { ArrowRight } from "@/components/icons";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; mode?: string };
}) {
  const user = await getCurrentUser();
  if (user) {
    if (user.isOperator) redirect("/dashboard");
    redirect(user.onboarded ? "/home" : "/onboarding");
  }

  const signup = searchParams?.mode !== "login"; // default to sign-up

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
          Please enter a valid email.
        </p>
      )}

      <form action={login} className="mt-8 space-y-3">
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
          {signup ? "Create account" : "Log in"} <ArrowRight className="h-4 w-4" />
        </button>
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
