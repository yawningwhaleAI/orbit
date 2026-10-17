"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { buttonClass } from "./ui";
import { Clock } from "./icons";
import { respond } from "@/app/intro/[id]/actions";
import type { Slot } from "@/lib/slots";

export function SlotPicker({
  matchId,
  slots,
  busy,
  otherFirstName,
}: {
  matchId: string;
  slots: Slot[];
  busy: string[];
  otherFirstName: string;
}) {
  const [sel, setSel] = useState("");
  const busySet = new Set(busy);

  return (
    <div className="px-5 pb-5 pt-4">
      <div className="mb-3 flex items-center gap-2 text-sm text-ink-soft">
        <Clock className="h-4 w-4 text-accent-deep" />
        Pick a 15-minute slot that works. Greyed times are when {otherFirstName} is busy.
      </div>

      <form action={respond}>
        <input type="hidden" name="matchId" value={matchId} />
        <input type="hidden" name="decision" value="accept" />
        <input type="hidden" name="scheduledAt" value={sel} />

        <div className="grid grid-cols-2 gap-2">
          {slots.map((s) => {
            const isBusy = busySet.has(s.iso);
            const isSel = sel === s.iso;
            return (
              <button
                key={s.iso}
                type="button"
                disabled={isBusy}
                onClick={() => setSel(s.iso)}
                className={clsx(
                  "rounded-xl border px-3 py-2.5 text-sm transition",
                  isBusy && "cursor-not-allowed border-line bg-sunken text-ink-faint line-through opacity-50",
                  !isBusy && isSel && "border-accent bg-[color:var(--accent-tint)] text-accent-deep",
                  !isBusy && !isSel && "border-line-strong text-ink hover:border-accent"
                )}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        <button
          type="submit"
          disabled={!sel}
          className={clsx(buttonClass("primary"), "mt-4 w-full")}
        >
          {sel ? "Yes, book this time" : "Select a time to book"}
        </button>
      </form>

      <form action={respond} className="mt-2 text-center">
        <input type="hidden" name="matchId" value={matchId} />
        <input type="hidden" name="decision" value="pass" />
        <button type="submit" className="py-2 text-sm text-ink-faint transition hover:text-ink">
          Pass on this intro
        </button>
      </form>
    </div>
  );
}
