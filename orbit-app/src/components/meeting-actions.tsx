"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { buttonClass } from "./ui";
import { Check, Clock } from "./icons";
import type { Slot } from "@/lib/slots";
import { TimeChooser } from "./time-chooser";
import { confirmMeeting, cancelMeeting, rescheduleMeeting } from "@/app/meeting/[id]/actions";

export function MeetingActions({
  meetingId,
  role,
  status,
  slots30,
  slots60,
  otherFirstName,
  calendarUrl,
}: {
  meetingId: string;
  role: "proposer" | "invitee";
  status: string; // proposed | confirmed | cancelled
  slots30: Slot[];
  slots60: Slot[];
  otherFirstName: string;
  calendarUrl?: string;
}) {
  const [rescheduling, setRescheduling] = useState(false);

  if (status === "cancelled") {
    return (
      <p className="text-sm text-ink-soft">
        This coffee was cancelled. You&apos;ll get fresh intros next week.
      </p>
    );
  }

  const reschedulePanel = rescheduling && (
    <div className="mt-4">
      <TimeChooser
        action={rescheduleMeeting}
        hidden={{ meetingId }}
        submitLabel="Propose new time"
        slots30={slots30}
        slots60={slots60}
        otherFirstName={otherFirstName}
      />
      <button type="button" onClick={() => setRescheduling(false)} className={clsx(buttonClass("pass"), "mt-2 w-full")}>
        Back
      </button>
    </div>
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
            <Clock className="h-4 w-4" /> {role === "invitee" && status === "proposed" ? "Suggest another time" : "Reschedule"}
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
