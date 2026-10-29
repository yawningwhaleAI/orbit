"use client";

import { useMemo, useState } from "react";
import { clsx } from "clsx";
import { buttonClass } from "./ui";
import type { Slot } from "@/lib/slots";

const CUSTOM_TIMES: string[] = [];
for (let m = 8 * 60; m <= 19 * 60 + 30; m += 30) {
  CUSTOM_TIMES.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${m % 60 === 0 ? "00" : "30"}`);
}
const pretty = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h >= 12 ? "pm" : "am"}`;
};

// A reusable "pick a time" form. Offers the other person's free times for a
// 30-min or 1-hour coffee (dashed = outside your own usual free times, i.e. you'd
// adjust), or a custom time the other person can accept, decline or counter.
export function TimeChooser({
  action,
  hidden,
  submitLabel,
  slots30,
  slots60,
  otherFirstName,
  emptyExtra,
}: {
  action: (formData: FormData) => void | Promise<void>;
  hidden: Record<string, string>;
  submitLabel: string;
  slots30: Slot[];
  slots60: Slot[];
  otherFirstName: string;
  emptyExtra?: React.ReactNode;
}) {
  const [dur, setDur] = useState<30 | 60>(30);
  const [sel, setSel] = useState("");
  const [custom, setCustom] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("11:00");

  const slots = dur === 30 ? slots30 : slots60;
  const groups = useMemo(() => {
    const m = new Map<string, Slot[]>();
    for (const s of slots) m.set(s.day, [...(m.get(s.day) || []), s]);
    return [...m.entries()].slice(0, 7);
  }, [slots]);

  const customIso = custom && date ? new Date(`${date}T${time}:00+05:30`).toISOString() : "";
  const value = custom ? customIso : sel;
  const minDate = new Date(Date.now() + 86400000 + 330 * 60000).toISOString().slice(0, 10);
  const maxDate = new Date(Date.now() + 21 * 86400000 + 330 * 60000).toISOString().slice(0, 10);

  return (
    <form action={action}>
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <input type="hidden" name="scheduledAt" value={value} />
      <input type="hidden" name="durationMin" value={dur} />
      <input type="hidden" name="custom" value={custom ? "1" : ""} />

      <div className="mb-3 flex items-center gap-2">
        <span className="text-sm text-ink-soft">Length</span>
        {([30, 60] as const).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => {
              setDur(d);
              setSel("");
            }}
            className={clsx(
              "rounded-full border px-3 py-1 text-sm transition",
              dur === d
                ? "border-accent bg-[color:var(--accent-tint)] text-accent-deep"
                : "border-line-strong text-ink-soft hover:border-accent"
            )}
          >
            {d === 30 ? "30 min" : "1 hour"}
          </button>
        ))}
      </div>

      {!custom && (
        <>
          {groups.length === 0 ? (
            <div className="rounded-xl border border-line bg-sunken p-4 text-sm text-ink-soft">
              {otherFirstName} has no free {dur === 30 ? "30-minute" : "1-hour"} times in the next two weeks.
              {emptyExtra}
            </div>
          ) : (
            <>
              <p className="mb-2 text-xs text-ink-faint">
                {otherFirstName}&apos;s free times. Solid = you&apos;re free too. Dashed = you&apos;d adjust your day.
              </p>
              <div className="space-y-3">
                {groups.map(([day, list]) => (
                  <div key={day}>
                    <div className="mb-1.5 text-xs font-semibold text-ink-faint">{day}</div>
                    <div className="flex flex-wrap gap-2">
                      {list.map((s) => (
                        <button
                          key={s.iso}
                          type="button"
                          onClick={() => setSel(s.iso)}
                          className={clsx(
                            "rounded-xl border px-3 py-2 text-sm transition",
                            !s.both && "border-dashed",
                            sel === s.iso
                              ? "border-accent bg-[color:var(--accent-tint)] text-accent-deep"
                              : "border-line-strong text-ink hover:border-accent"
                          )}
                        >
                          {s.time}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {custom && (
        <div className="rounded-xl border border-line bg-sunken p-4">
          <p className="mb-3 text-sm text-ink-soft">
            Suggest your own time. {otherFirstName} can accept it, decline it, or counter-offer.
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              type="date"
              value={date}
              min={minDate}
              max={maxDate}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-line-strong bg-elev px-3 py-2 text-sm"
            />
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="rounded-lg border border-line-strong bg-elev px-3 py-2 text-sm"
            >
              {CUSTOM_TIMES.map((t) => (
                <option key={t} value={t}>
                  {pretty(t)}
                </option>
              ))}
            </select>
          </div>
          <p className="mt-2 text-xs text-ink-faint">Weekdays only, India time.</p>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          setCustom((c) => !c);
          setSel("");
        }}
        className="mt-3 text-sm text-ink-soft underline-offset-2 hover:text-ink hover:underline"
      >
        {custom ? "← Back to " + otherFirstName + "'s free times" : "None of these work? Suggest another time"}
      </button>

      <button type="submit" disabled={!value} className={clsx(buttonClass("primary"), "mt-4 w-full")}>
        {value ? submitLabel : "Select a time"}
      </button>
    </form>
  );
}
