"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { buttonClass } from "./ui";
import { saveAvailability } from "@/app/availability/actions";
import { SLOT_TIMES, WEEKDAYS, slotKey } from "@/lib/slots";

function pretty(t: string) {
  const h = Number(t.split(":")[0]);
  const f = (x: number) => `${((x + 11) % 12) + 1}`;
  return `${f(h)}–${f(h + 1)} ${h + 1 >= 12 && h + 1 < 24 ? "PM" : "AM"}`.replace(/^(\d+)–12 AM$/, "$1–12 PM");
}

export function AvailabilityGrid({ initial, welcome }: { initial: string[]; welcome?: boolean }) {
  const [sel, setSel] = useState<Set<string>>(new Set(initial));
  const toggle = (k: string) =>
    setSel((s) => {
      const n = new Set(s);
      n.has(k) ? n.delete(k) : n.add(k);
      return n;
    });
  const all = WEEKDAYS.flatMap((d) => SLOT_TIMES.map((t) => slotKey(d.n, t)));

  return (
    <form action={saveAvailability}>
      <input type="hidden" name="slots" value={[...sel].join(",")} />
      {welcome && <input type="hidden" name="welcome" value="1" />}

      <div className="overflow-x-auto rounded-2xl border border-line bg-elev p-4">
        <div className="grid min-w-[420px] grid-cols-[64px_repeat(5,1fr)] gap-2">
          <div />
          {WEEKDAYS.map((d) => (
            <div key={d.n} className="pb-1 text-center text-xs font-semibold text-ink-faint">
              {d.label}
            </div>
          ))}
          {SLOT_TIMES.map((t) => (
            <div key={t} className="contents">
              <div className="self-center text-xs text-ink-faint">{pretty(t)}</div>
              {WEEKDAYS.map((d) => {
                const k = slotKey(d.n, t);
                const on = sel.has(k);
                return (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(k)}
                    className={clsx(
                      "h-11 rounded-xl border text-sm transition",
                      on
                        ? "border-accent bg-[color:var(--accent-tint)] text-accent-deep"
                        : "border-line-strong text-ink-faint hover:border-accent"
                    )}
                  >
                    {on ? "Free" : "—"}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-sm">
        <button type="button" onClick={() => setSel(new Set(all))} className="text-ink-soft hover:text-ink">
          Select all
        </button>
        <button type="button" onClick={() => setSel(new Set())} className="text-ink-soft hover:text-ink">
          Clear
        </button>
      </div>

      <button type="submit" className={clsx(buttonClass("primary"), "mt-5 w-full")}>
        {welcome ? "Save & see my intros" : "Save my free times"}
      </button>
    </form>
  );
}
