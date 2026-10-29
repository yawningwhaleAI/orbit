"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { buttonClass } from "./ui";
import { submitFeedback } from "@/app/meeting/[id]/actions";

export function FeedbackForm({
  meetingId,
  otherFirstName,
}: {
  meetingId: string;
  otherFirstName: string;
}) {
  const [showed, setShowed] = useState<"" | "yes" | "no">("");
  const [worth, setWorth] = useState<"yes" | "no">("yes");

  const pill = (active: boolean) =>
    clsx(
      "rounded-xl border px-4 py-2 text-sm transition",
      active
        ? "border-accent bg-[color:var(--accent-tint)] text-accent-deep"
        : "border-line-strong text-ink hover:border-accent"
    );

  return (
    <form action={submitFeedback} className="space-y-4">
      <input type="hidden" name="meetingId" value={meetingId} />

      <div>
        <div className="mb-2 text-sm font-medium">Did your coffee with {otherFirstName} happen?</div>
        <div className="flex gap-2">
          <label className={pill(showed === "yes")}>
            <input
              type="radio"
              name="showed"
              value="yes"
              className="hidden"
              onChange={() => setShowed("yes")}
            />
            Yes, we met
          </label>
          <label className={pill(showed === "no")}>
            <input
              type="radio"
              name="showed"
              value="no"
              className="hidden"
              onChange={() => setShowed("no")}
            />
            No, it didn&apos;t
          </label>
        </div>
      </div>

      {showed === "yes" && (
        <div>
          <div className="mb-2 text-sm font-medium">Was it worth 30 minutes?</div>
          <div className="flex gap-2">
            <label className={pill(worth === "yes")}>
              <input
                type="radio"
                name="worthwhile"
                value="yes"
                className="hidden"
                checked={worth === "yes"}
                onChange={() => setWorth("yes")}
              />
              👍 Worth it
            </label>
            <label className={pill(worth === "no")}>
              <input
                type="radio"
                name="worthwhile"
                value="no"
                className="hidden"
                checked={worth === "no"}
                onChange={() => setWorth("no")}
              />
              👎 Not really
            </label>
          </div>
        </div>
      )}

      {showed && (
        <>
          <textarea
            name="note"
            rows={2}
            placeholder="Anything we should know? (optional)"
            className="w-full rounded-xl border border-line bg-elev px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <button type="submit" className={clsx(buttonClass("primary"), "w-full")}>
            Submit feedback
          </button>
        </>
      )}
    </form>
  );
}
