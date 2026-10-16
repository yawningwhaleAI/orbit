import { clsx } from "clsx";
import Link from "next/link";
import type { ReactNode } from "react";
import { OrbitGlyph } from "./icons";

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link href="/" className={clsx("inline-flex items-center gap-2 font-serif text-[1.4rem] font-medium", className)}>
      <OrbitGlyph className="h-5 w-5" />
      Orbit
    </Link>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 inline-flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-accent-deep">
      <span className="h-px w-6 bg-current opacity-60" />
      {children}
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx("rounded-2xl border border-line bg-elev shadow-sm", className)}>
      {children}
    </div>
  );
}

const AVATAR_GRADIENTS = [
  "linear-gradient(140deg,#E08B3E,#C8752D)",
  "linear-gradient(140deg,#9C7B54,#6E5636)",
  "linear-gradient(140deg,#7C8B6E,#566141)",
  "linear-gradient(140deg,#B6724E,#8A4B2E)",
];

export function Avatar({
  name,
  size = 48,
  seedIndex,
}: {
  name: string;
  size?: number;
  seedIndex?: number;
}) {
  const letter = (name?.trim()?.[0] || "?").toUpperCase();
  const idx =
    seedIndex ??
    Math.abs([...name].reduce((a, c) => a + c.charCodeAt(0), 0)) % AVATAR_GRADIENTS.length;
  return (
    <span
      className="flex flex-none items-center justify-center rounded-full font-serif text-on-accent"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        background: AVATAR_GRADIENTS[idx],
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)",
      }}
    >
      {letter}
    </span>
  );
}

export function Chip({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "lit";
}) {
  return (
    <span
      className={clsx(
        "inline-block rounded-lg border px-3 py-1.5 text-sm",
        tone === "lit"
          ? "border-accent bg-[color:var(--accent-tint)] text-accent-deep"
          : "border-line bg-sunken text-ink-soft"
      )}
    >
      {children}
    </span>
  );
}

export function buttonClass(variant: "primary" | "ghost" | "pass" = "primary") {
  return clsx(
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition",
    "disabled:opacity-60 disabled:pointer-events-none",
    variant === "primary" &&
      "bg-[linear-gradient(135deg,var(--accent-bright),var(--accent))] text-on-accent shadow-[0_8px_20px_var(--accent-glow)] hover:-translate-y-0.5",
    variant === "ghost" &&
      "border border-line-strong text-ink hover:border-accent hover:text-accent-deep",
    variant === "pass" &&
      "border border-line-strong text-ink-soft hover:border-ink-faint hover:text-ink"
  );
}

export function LinkButton({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost" | "pass";
  className?: string;
}) {
  return (
    <Link href={href} className={clsx(buttonClass(variant), className)}>
      {children}
    </Link>
  );
}
