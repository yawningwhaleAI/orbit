"use client";

import { useRef, useState } from "react";
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
  buildings,
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
    buildingId?: string | null;
    gives: string[];
    wants: string[];
  };
  buildings: { id: string; name: string }[];
  giveOptions: string[];
  wantOptions: string[];
  seniority: { value: string; label: string }[];
}) {
  const [buildingId, setBuildingId] = useState(defaults.buildingId ?? "");
  const [role, setRole] = useState(defaults.role ?? "");
  const [company, setCompany] = useState(defaults.company ?? "");
  const [education, setEducation] = useState(defaults.education ?? "");
  const [floor, setFloor] = useState(defaults.floor != null ? String(defaults.floor) : "");
  const [sen, setSen] = useState(defaults.seniority ?? "");
  const [bio, setBio] = useState(defaults.bio ?? "");
  const [gives, setGives] = useState<string[]>(defaults.gives);
  const [wants, setWants] = useState<string[]>(defaults.wants);

  const [resumeState, setResumeState] = useState<"idle" | "parsing" | "done" | "error">("idle");
  const [resumeMsg, setResumeMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeState("parsing");
    setResumeMsg("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/parse-resume", { method: "POST", body: fd });
      const json = await res.json();
      if (!json.ok) {
        setResumeState("error");
        setResumeMsg(json.message || "Couldn't read that resume. Fill the form manually.");
        return;
      }
      const d = json.data as {
        role?: string; company?: string; education?: string; seniority?: string;
        bio?: string; gives?: string[]; wants?: string[];
      };
      if (d.role) setRole(d.role);
      if (d.company) setCompany(d.company);
      if (d.education) setEducation(d.education);
      if (d.seniority) setSen(d.seniority);
      if (d.bio) setBio(d.bio);
      if (d.gives?.length) setGives((prev) => Array.from(new Set([...d.gives!, ...prev])).slice(0, 6));
      if (d.wants?.length) setWants((prev) => Array.from(new Set([...d.wants!, ...prev])).slice(0, 5));
      setResumeState("done");
      setResumeMsg("Prefilled from your resume. Review and tweak below.");
    } catch {
      setResumeState("error");
      setResumeMsg("Upload failed. Fill the form manually.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const input =
    "w-full rounded-xl border border-line bg-elev px-4 py-3 text-ink outline-none focus:border-accent";
  const lbl = "mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-faint";

  return (
    <form action={saveOnboarding} className="space-y-6">
      <input type="hidden" name="gives" value={gives.join("|")} />
      <input type="hidden" name="wants" value={wants.join("|")} />

      {/* Resume upload */}
      <div className="rounded-2xl border border-dashed border-line-strong bg-sunken p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Have a resume? Autofill in one tap.</div>
            <div className="text-xs text-ink-faint">Upload a PDF — we read it, prefill below, and don&apos;t store the file.</div>
          </div>
          <label className={clsx(buttonClass("ghost"), "cursor-pointer whitespace-nowrap")}>
            {resumeState === "parsing" ? "Reading…" : "Upload resume"}
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={handleFile}
              disabled={resumeState === "parsing"}
            />
          </label>
        </div>
        {resumeMsg && (
          <p className={clsx("mt-2 text-xs", resumeState === "error" ? "text-accent-deep" : "text-ink-soft")}>
            {resumeMsg}
          </p>
        )}
      </div>

      <div>
        <label className={lbl}>Which building do you work in?</label>
        <select name="buildingId" value={buildingId} onChange={(e) => setBuildingId(e.target.value)} required className={input}>
          <option value="" disabled>
            Select your building…
          </option>
          {buildings.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={lbl}>Name</label>
          <input name="name" defaultValue={defaults.name} className={input} required />
        </div>
        <div>
          <label className={lbl}>Role</label>
          <input name="role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Founder" className={input} />
        </div>
        <div>
          <label className={lbl}>Company</label>
          <input name="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Seed-stage startup" className={input} />
        </div>
        <div>
          <label className={lbl}>Education</label>
          <input name="education" value={education} onChange={(e) => setEducation(e.target.value)} placeholder="e.g. IIT Delhi" className={input} />
        </div>
        <div>
          <label className={lbl}>Floor</label>
          <input name="floor" type="number" value={floor} onChange={(e) => setFloor(e.target.value)} placeholder="e.g. 9" className={input} />
        </div>
        <div>
          <label className={lbl}>Seniority</label>
          <select name="seniority" value={sen} onChange={(e) => setSen(e.target.value)} className={input}>
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
        <input name="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="What you're working on right now" className={input} />
      </div>

      <ChipSelect label="I can give" tone="give" options={giveOptions} value={gives} onChange={setGives} />
      <ChipSelect label="I want" tone="want" options={wantOptions} value={wants} onChange={setWants} />

      <button type="submit" className={buttonClass("primary") + " w-full"}>
        Finish & see my intros <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
