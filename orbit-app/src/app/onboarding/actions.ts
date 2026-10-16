"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { generateForBuilding } from "@/lib/matching";

function splitList(v: FormDataEntryValue | null): string[] {
  return String(v || "")
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export async function saveOnboarding(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") || user.name).trim();
  const role = String(formData.get("role") || "").trim() || null;
  const company = String(formData.get("company") || "").trim() || null;
  const education = String(formData.get("education") || "").trim() || null;
  const seniority = String(formData.get("seniority") || "").trim() || null;
  const bio = String(formData.get("bio") || "").trim() || null;
  const floorRaw = String(formData.get("floor") || "").trim();
  const floor = floorRaw ? Math.max(0, Math.min(200, parseInt(floorRaw, 10) || 0)) : null;
  const code = String(formData.get("inviteCode") || "DLF-TOWER").trim().toUpperCase();

  const gives = splitList(formData.get("gives"));
  const wants = splitList(formData.get("wants"));

  // Resolve building from invite code; fall back to the first building (demo).
  const invite = await db.inviteCode.findUnique({ where: { code } });
  const buildingId =
    invite?.buildingId ??
    (await db.building.findFirst({ select: { id: true } }))?.id ??
    null;

  await db.profileTag.deleteMany({ where: { userId: user.id } });
  await db.user.update({
    where: { id: user.id },
    data: {
      name,
      role,
      company,
      education,
      seniority,
      bio,
      floor,
      buildingId,
      onboarded: true,
      // reset embeddings so they recompute from new profile (if keys set)
      giveVec: null,
      wantVec: null,
      tags: {
        create: [
          ...gives.map((label) => ({ kind: "give", label })),
          ...wants.map((label) => ({ kind: "want", label })),
        ],
      },
    },
  });

  // Generate this week's intros so the member lands on a populated home.
  if (buildingId) {
    try {
      await generateForBuilding(buildingId);
    } catch (e) {
      console.warn("[onboarding] match generation failed:", e);
    }
  }

  redirect("/home");
}
