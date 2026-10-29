import Link from "next/link";
import { Wordmark } from "./ui";
import { ThemeToggle } from "./theme-toggle";
import { logout } from "@/app/actions";

export function AppNav({ right, profile }: { right?: string; profile?: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-[color:var(--bg)]/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
        <Wordmark />
        <div className="flex items-center gap-3">
          {right && <span className="hidden text-sm text-ink-faint sm:inline">{right}</span>}
          {profile && (
            <Link href="/availability" className="text-sm text-ink-soft transition hover:text-ink">
              Free times
            </Link>
          )}
          {profile && (
            <Link href="/onboarding" className="text-sm text-ink-soft transition hover:text-ink">
              Your profile
            </Link>
          )}
          <ThemeToggle />
          <form action={logout}>
            <button className="text-sm text-ink-soft transition hover:text-ink">Sign out</button>
          </form>
        </div>
      </div>
    </header>
  );
}
