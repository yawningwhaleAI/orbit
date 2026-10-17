import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppNav } from "@/components/app-nav";
import { Eyebrow } from "@/components/ui";
import { OnboardingForm } from "@/components/onboarding-form";
import { GIVE_SUGGESTIONS, WANT_SUGGESTIONS, SENIORITY } from "@/lib/tags";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.isOperator) redirect("/dashboard");

  const buildings = await db.building.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const gives = user.tags.filter((t) => t.kind === "give").map((t) => t.label);
  const wants = user.tags.filter((t) => t.kind === "want").map((t) => t.label);

  return (
    <>
      <AppNav right="Set up your profile" />
      <main className="mx-auto max-w-2xl px-5 py-10">
        <Eyebrow>Your profile</Eyebrow>
        <h1 className="text-[2.2rem] leading-tight">
          What can you <em className="not-italic text-accent-deep">give</em>, and what do you{" "}
          <em className="not-italic text-accent-deep">want</em>?
        </h1>
        <p className="mb-8 mt-3 text-ink-soft">
          A few lines. Orbit uses this to find the three people worth meeting each week. Nothing is public.
        </p>

        <OnboardingForm
          defaults={{
            name: user.name,
            role: user.role,
            company: user.company,
            education: user.education,
            floor: user.floor,
            seniority: user.seniority,
            bio: user.bio,
            buildingId: user.buildingId,
            gives,
            wants,
          }}
          buildings={buildings}
          giveOptions={GIVE_SUGGESTIONS}
          wantOptions={WANT_SUGGESTIONS}
          seniority={SENIORITY}
        />
      </main>
    </>
  );
}
