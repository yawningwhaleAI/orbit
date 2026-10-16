import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Wordmark, Eyebrow, buttonClass } from "@/components/ui";
import { ArrowRight } from "@/components/icons";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const user = await getCurrentUser();
  if (user) {
    if (user.isOperator) redirect("/dashboard");
    redirect(user.onboarded ? "/home" : "/onboarding");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <Wordmark className="mb-10" />
      <Eyebrow>Request access</Eyebrow>
      <h1 className="text-[2rem] leading-tight">
        Sign in to <em className="not-italic text-accent-deep">Orbit</em>.
      </h1>
      <p className="mt-3 text-ink-soft">
        Members use Orbit free. Enter your work email to continue.
      </p>

      {searchParams?.error && (
        <p className="mt-4 rounded-lg border border-accent bg-[color:var(--accent-tint)] px-3 py-2 text-sm text-accent-deep">
          Please enter a valid email.
        </p>
      )}

      <form action={login} className="mt-8 space-y-3">
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
          Continue <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <div className="mt-8 rounded-xl border border-line bg-sunken px-4 py-3 text-sm text-ink-soft">
        <p className="font-medium text-ink">Demo logins</p>
        <p className="mt-1">
          Member: <span className="text-accent-deep">demo@orbit.app</span>
          <br />
          Operator: <span className="text-accent-deep">operator@orbit.app</span>
        </p>
      </div>
    </main>
  );
}
