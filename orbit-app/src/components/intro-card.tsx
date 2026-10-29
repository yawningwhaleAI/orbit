import Link from "next/link";
import { Avatar } from "./ui";
import { ArrowRight, Check, X } from "./icons";

export type IntroCardData = {
  id: string;
  matchPct: number;
  status: string;
  reason: string;
  sharedSlots?: number | null;
  other: {
    name: string;
    role: string | null;
    company: string | null;
    floor: number | null;
  };
};

export function IntroCard({ intro }: { intro: IntroCardData }) {
  const { other } = intro;
  const sub = [other.role, other.company].filter(Boolean).join(" · ");
  return (
    <Link
      href={`/intro/${intro.id}`}
      className="block rounded-2xl border border-line bg-elev p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <Avatar name={other.name} size={46} />
        <div className="min-w-0 flex-1">
          <div className="font-semibold">{other.name}</div>
          <div className="truncate text-xs text-ink-faint">
            {sub}
            {other.floor != null ? ` · ${other.floor}th floor` : ""}
          </div>
        </div>
        <StatusPill status={intro.status} pct={intro.matchPct} />
      </div>
      <p className="mt-3 font-serif text-[0.95rem] leading-snug text-ink-soft">{intro.reason}</p>
      {intro.sharedSlots != null && (
        <div className="mt-2 text-xs text-ink-faint">
          {intro.sharedSlots > 0
            ? `${intro.sharedSlots} shared free half-hours`
            : "No shared free times yet"}
        </div>
      )}
      <div className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent-deep">
        View intro <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  );
}

function StatusPill({ status, pct }: { status: string; pct: number }) {
  if (status === "accepted")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--accent-tint)] px-2.5 py-1 text-xs font-semibold text-accent-deep">
        <Check className="h-3.5 w-3.5" /> Accepted
      </span>
    );
  if (status === "passed")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-sunken px-2.5 py-1 text-xs font-medium text-ink-faint">
        <X className="h-3.5 w-3.5" /> Passed
      </span>
    );
  return (
    <span className="rounded-full bg-sunken px-2.5 py-1 text-xs font-semibold text-ink-soft">
      {pct}% match
    </span>
  );
}
