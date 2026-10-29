import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppNav } from "@/components/app-nav";
import { Eyebrow } from "@/components/ui";
import { AvailabilityGrid } from "@/components/availability-grid";
import { ALL_SLOT_KEYS } from "@/lib/availability";
import { slotKey } from "@/lib/slots";

export const dynamic = "force-dynamic";

export default async function AvailabilityPage({
  searchParams,
}: {
  searchParams?: { welcome?: string; saved?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.isOperator) redirect("/dashboard");
  if (!user.onboarded) redirect("/onboarding");

  const rows = await db.availability.findMany({ where: { userId: user.id } });
  const initial = user.availabilitySet ? rows.map((r) => slotKey(r.weekday, r.slot)) : ALL_SLOT_KEYS;
  const welcome = !!searchParams?.welcome;

  return (
    <>
      <AppNav profile />
      <main className="mx-auto max-w-xl px-5 py-10">
        <Eyebrow>{welcome ? "One last step" : "Your free times"}</Eyebrow>
        <h1 className="mt-3 font-serif text-[2rem] leading-tight">
          When are you free for a <span className="text-accent">coffee</span>?
        </h1>
        <p className="mb-6 mt-2 text-ink-soft">
          Tap the hours you're usually free for a coffee, every week (India time). People are offered
          these times for a 30-minute or 1-hour coffee. You can change them any time.
        </p>
        {searchParams?.saved && (
          <div className="mb-4 rounded-xl border border-accent bg-[color:var(--accent-tint)] px-4 py-3 text-sm text-accent-deep">
            Saved. New bookings will use these times.
          </div>
        )}
        <AvailabilityGrid initial={initial} welcome={welcome} />
      </main>
    </>
  );
}
