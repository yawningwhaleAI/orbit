"use client";

import { buttonClass } from "./ui";
import { Clock } from "./icons";
import { TimeChooser } from "./time-chooser";
import { respond, requestMoreTimes } from "@/app/intro/[id]/actions";
import type { Slot } from "@/lib/slots";

export function SlotPicker({
  matchId,
  slots30,
  slots60,
  otherFirstName,
}: {
  matchId: string;
  slots30: Slot[];
  slots60: Slot[];
  otherFirstName: string;
}) {
  return (
    <div className="px-5 pb-5 pt-4">
      <div className="mb-3 flex items-center gap-2 text-sm text-ink-soft">
        <Clock className="h-4 w-4 text-accent-deep" />
        Pick a time for coffee with {otherFirstName}.
      </div>

      <TimeChooser
        action={respond}
        hidden={{ matchId, decision: "accept" }}
        submitLabel="Propose this time"
        slots30={slots30}
        slots60={slots60}
        otherFirstName={otherFirstName}
        emptyExtra={
          <form action={requestMoreTimes} className="mt-3">
            <input type="hidden" name="matchId" value={matchId} />
            <button type="submit" className={buttonClass("primary")}>
              Ask {otherFirstName} to open up a time
            </button>
          </form>
        }
      />

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
