"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { buttonClass } from "./ui";
import { ArrowRight } from "./icons";
import { saveOnboarding } from "@/app/onboarding/actions";

function ChipSelect({
  label,
  tone,
  options,
  value,
  onChange,
}: {
  label: string;
  tone: "give" | "want";
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [custom, setCustom] = useState("");
  const all = Array.from(new Set([...options, ...value]));

  function toggle(tag: string) {
    onChange(value.includes(tag) ? value.filter((t) => t !== tag) : [...value, tag]);
  }
  function addCustom() {
    const t = custom.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setCustom("");
  }

  return (
    <div>
      <div
        className={clsx(
          "mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em]",
          tone === "give" ? "text-accent-deep" : "text-ink-faint"
        )}
      >
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {all.map((tag) => {
          const on = value.includes(tag);
          return (
            <button
              type="button"
              key={tag}
              onClick={() => toggle(tag)}
              className={clsx(
                "rounded-lg border px-3 py-1.5 text-sm transition",
                on
                  ? "border-accent bg-[color:var(--accent-tint)] text-accent-deep"
                  : "border-line bg-sunken text-ink-soft hover:border-line-strong"
              )}
            >
              {tag}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
          placeholder="Add your own…"
          className="flex-1 rounded-lg border border-line bg-elev px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button type="button" onClick={addCustom} className="rounded-lg border border-line-strong px-3 py-2 text-sm text-ink-soft hover:border-accent hover:text-accent-deep">
          Add
        </button>
      </div>
    </div>
  );
}

export function OnboardingForm({
  defaults,
  giveOptions,
  wantOptions,
  seniority,
}: {
  defaults: {
    name: string;
    role?: string | null;
    company?: string | null;
    education?: string | null;
    floor?: number | null;
    seniority?: string | null;
    bio?: string | null;
    gives: string[];
    wants: string[];
  };
  giveOptions: string[];
  wantOptions: string[];
  seniority: { value: string; label: string }[];
}) {
  const [gives, setGives] = useState<string[]>(defaults.gives);
  const [wants, setWants] = useState<string[]>(defaults.wants);

  const input =
    "w-full rounded-xl border border-line bg-elev px-4 py-3 text-ink outline-none focus:border-accent";
  const lbl = "mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-faint";

  return (
    <form action={saveOnboarding} className="space-y-6">
      <input type="hidden" name="gives" value={gives.join("|")} />
      <input type="hidden" name="wants" value={wants.join("|")} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={lbl}>Name</label>
          <input name="name" defaultValue={defaults.name} className={input} required />
        </div>
        <div>
          <label className={lbl}>Role</label>
          <input name="role" defaultValue={defaults.role ?? ""} placeholder="e.g. Founder" className={input} />
        </div>
        <div>
          <label className={lbl}>Company</label>
          <input name="company" defaultValue={defaults.company ?? ""} placeholder="e.g. Seed-stage startup" className={input} />
        </div>
        <div>
          <label className={lbl}>Education</label>
          <input name="education" defaultValue={defaults.education ?? ""} placeholder="e.g. IIT Delhi" className={input} />
        </div>
        <div>
          <label className={lbl}>Floor</label>
          <input name="floor" type="number" defaultValue={defaults.floor ?? ""} placeholder="e.g. 9" className={input} />
        </div>
        <div>
          <label className={lbl}>Seniority</label>
          <select name="seniority" defaultValue={defaults.seniority ?? ""} className={input}>
            <option value="">Select…</option>
            {seniority.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={lbl}>One line about you</label>
        <input name="bio" defaultValue={defaults.bio ?? ""} placeholder="What you're working on right now" className={input} />
      </div>

      <ChipSelect label="I can give" tone="give" options={giveOptions} value={gives} onChange={setGives} />
      <ChipSelect label="I want" tone="want" options={wantOptions} value={wants} onChange={setWants} />

      <div>
        <label className={lbl}>Building invite code</label>
        <input name="inviteCode" defaultValue="DLF-TOWER" className={input} />
        <p className="mt-1 text-xs text-ink-faint">Given by your building. Demo code: DLF-TOWER.</p>
      </div>

      <button type="submit" className={buttonClass("primary") + " w-full"}>
        Finish & see my intros <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
