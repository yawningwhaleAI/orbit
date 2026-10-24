"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { buttonClass } from "./ui";
import { Check, Clock } from "./icons";
import type { Slot } from "@/lib/slots";
import { confirmMeeting, cancelMeeting, rescheduleMeeting } from "@/app/meeting/[id]/actions";

export function MeetingActions({
  meetingId,
  role,
  status,
  slots,
  calendarUrl,
}: {
  meetingId: string;
  role: "proposer" | "invitee";
  status: string; // proposed | confirmed | cancelled
  slots: Slot[];
  calendarUrl?: string;
}) {
  const [rescheduling, setRescheduling] = useState(false);
  const [sel, setSel] = useState("");

  if (status === "cancelled") {
    return (
      <p className="text-sm text-ink-soft">
        This coffee was cancelled. You&apos;ll get fresh intros next week.
      </p>
    );
  }

  const reschedulePanel = rescheduling && (
    <form action={rescheduleMeeting} className="mt-3">
      <input type="hidden" name="meetingId" value={meetingId} />
      <input type="hidden" name="scheduledAt" value={sel} />
      {slots.length === 0 ? (
        <p className="rounded-xl border border-line bg-sunken p-3 text-sm text-ink-soft">
          No other shared free times right now.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {slots.map((s) => (
            <button
              key={s.iso}
              type="button"
              onClick={() => setSel(s.iso)}
              className={clsx(
                "rounded-xl border px-3 py-2.5 text-sm transition",
                sel === s.iso
                  ? "border-accent bg-[color:var(--accent-tint)] text-accent-deep"
                  : "border-line-strong text-ink hover:border-accent"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
      <div className="mt-3 flex gap-2">
        <button type="submit" disabled={!sel} className={clsx(buttonClass("primary"), "flex-1")}>
          Propose new time
        </button>
        <button
          type="button"
          onClick={() => setRescheduling(false)}
          className={buttonClass("pass")}
        >
          Back
        </button>
      </div>
    </form>
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {status === "proposed" && role === "invitee" && (
          <form action={confirmMeeting}>
            <input type="hidden" name="meetingId" value={meetingId} />
            <button type="submit" className={buttonClass("primary")}>
              <Check className="h-4 w-4" /> Confirm this time
            </button>
          </form>
        )}

        {status === "confirmed" && calendarUrl && (
          <a
            href={calendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass("primary")}
          >
            Add to Google Calendar
          </a>
        )}

        {!rescheduling && (
          <button
            type="button"
            onClick={() => setRescheduling(true)}
            className={buttonClass("ghost")}
          >
            <Clock className="h-4 w-4" /> Reschedule
          </button>
        )}

        <form action={cancelMeeting}>
          <input type="hidden" name="meetingId" value={meetingId} />
          <button type="submit" className={buttonClass("pass")}>
            {role === "invitee" && status === "proposed" ? "Decline" : "Cancel"}
          </button>
        </form>
      </div>

      {reschedulePanel}
    </div>
  );
}
