// The Orbit matching engine (see CONTEXT.md §7).
//
// For a building and a given week, produce up to `introsPerWeek` directional
// introductions per active, onboarded member: the people whose Give/Want best
// complements theirs, scored for TWO-WAY relevance. Uses embeddings when
// available, lexical + complementary-tag scoring otherwise.

import { db } from "./db";
import { cosine, lexicalGiveWant, tokenize, jaccard } from "./similarity";
import { embed, embeddingsEnabled, parseVec, serializeVec } from "./embeddings";
import { whyYouTwo } from "./ai";
import { isoWeekKey } from "./week";

type TagRow = { kind: string; label: string };
type Member = {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  floor: number | null;
  seniority: string | null;
  bio: string | null;
  introsPerWeek: number;
  giveVec: string | null;
  wantVec: string | null;
  gives: string[];
  wants: string[];
};

function gw(member: Member) {
  return {
    giveText: member.gives.join(". "),
    wantText: member.wants.join(". "),
  };
}

// Which of `gives` plausibly satisfy any of `wants` (for display + reason).
function matchedTags(gives: string[], wants: string[]): string[] {
  const out: string[] = [];
  for (const g of gives) {
    for (const w of wants) {
      if (lexicalGiveWant(g, w) >= 0.33) {
        out.push(g);
        break;
      }
    }
  }
  return out;
}

const COMPLEMENT_SENIORITY: Record<string, string[]> = {
  founder: ["investor", "senior", "mid"],
  investor: ["founder"],
  junior: ["senior", "founder"],
  senior: ["junior", "mid", "founder"],
  mid: ["senior", "founder"],
};

function seniorityBonus(a: Member, b: Member): number {
  if (!a.seniority || !b.seniority) return 0;
  return COMPLEMENT_SENIORITY[a.seniority]?.includes(b.seniority) ? 0.07 : 0;
}

function simGiveWant(
  giverGiveText: string,
  wanterWantText: string,
  giverGiveVec: number[] | null,
  wanterWantVec: number[] | null
): number {
  if (giverGiveVec && wanterWantVec) {
    // cosine is -1..1; clamp to 0..1 range of interest
    return Math.max(0, cosine(giverGiveVec, wanterWantVec));
  }
  return lexicalGiveWant(giverGiveText, wanterWantText);
}

export interface PairScore {
  score: number;
  pct: number;
  otherGiveToOwnerWant: string[];
  ownerGiveToOtherWant: string[];
}

export function scorePair(owner: Member, other: Member): PairScore {
  const o = gw(owner);
  const t = gw(other);
  const ownerGiveVec = parseVec(owner.giveVec);
  const ownerWantVec = parseVec(owner.wantVec);
  const otherGiveVec = parseVec(other.giveVec);
  const otherWantVec = parseVec(other.wantVec);

  // other's give -> owner's want (what owner gets)
  const gw1 = simGiveWant(t.giveText, o.wantText, otherGiveVec, ownerWantVec);
  // owner's give -> other's want (what owner offers)
  const gw2 = simGiveWant(o.giveText, t.wantText, ownerGiveVec, otherWantVec);

  const base = 0.5 * gw1 + 0.5 * gw2;
  const twoWay = gw1 > 0.15 && gw2 > 0.15 ? 0.15 : 0;
  const floor =
    owner.floor != null && other.floor != null && Math.abs(owner.floor - other.floor) <= 2
      ? 0.05
      : 0;
  const sen = seniorityBonus(owner, other);
  const interest =
    owner.bio && other.bio ? jaccard(tokenize(owner.bio), tokenize(other.bio)) * 0.1 : 0;

  const score = Math.max(0, Math.min(1, base + twoWay + floor + sen + interest));
  const pct = Math.max(40, Math.min(98, Math.round(50 + score * 55)));

  return {
    score,
    pct,
    otherGiveToOwnerWant: matchedTags(other.gives, owner.wants),
    ownerGiveToOtherWant: matchedTags(owner.gives, other.wants),
  };
}

async function loadMembers(buildingId: string): Promise<Member[]> {
  const users = await db.user.findMany({
    where: { buildingId, onboarded: true, status: "active", isOperator: false },
    include: { tags: true },
  });
  return users.map((u) => ({
    id: u.id,
    name: u.name,
    role: u.role,
    company: u.company,
    floor: u.floor,
    seniority: u.seniority,
    bio: u.bio,
    introsPerWeek: u.introsPerWeek,
    giveVec: u.giveVec,
    wantVec: u.wantVec,
    gives: u.tags.filter((t: TagRow) => t.kind === "give").map((t: TagRow) => t.label),
    wants: u.tags.filter((t: TagRow) => t.kind === "want").map((t: TagRow) => t.label),
  }));
}

// Compute + persist embeddings for members that don't have them yet (no-op
// without an OpenAI key).
async function ensureEmbeddings(members: Member[]): Promise<void> {
  if (!embeddingsEnabled()) return;
  const need = members.filter((m) => !m.giveVec || !m.wantVec);
  if (need.length === 0) return;
  const giveVecs = await embed(need.map((m) => m.gives.join(". ") || m.role || m.name));
  const wantVecs = await embed(need.map((m) => m.wants.join(". ") || m.role || m.name));
  if (!giveVecs || !wantVecs) return;
  for (let i = 0; i < need.length; i++) {
    const m = need[i];
    m.giveVec = serializeVec(giveVecs[i]);
    m.wantVec = serializeVec(wantVecs[i]);
    await db.user.update({
      where: { id: m.id },
      data: { giveVec: m.giveVec, wantVec: m.wantVec },
    });
  }
}

export interface GenerateOptions {
  week?: string;
  regenerate?: boolean; // delete existing matches for the week first
}

export interface GenerateResult {
  week: string;
  buildingId: string;
  members: number;
  matchesCreated: number;
}

export async function generateForBuilding(
  buildingId: string,
  opts: GenerateOptions = {}
): Promise<GenerateResult> {
  const week = opts.week || isoWeekKey();
  const members = await loadMembers(buildingId);

  if (opts.regenerate) {
    await db.match.deleteMany({ where: { buildingId, week } });
  }

  await ensureEmbeddings(members);

  const byId = new Map(members.map((m) => [m.id, m]));
  let created = 0;

  for (const owner of members) {
    // Skip owners who already have intros this week (idempotent unless regen).
    const existing = await db.match.count({ where: { ownerId: owner.id, week } });
    if (existing > 0) continue;

    // Pairs already introduced historically — avoid repeating people.
    const prior = await db.match.findMany({
      where: { ownerId: owner.id },
      select: { otherId: true },
    });
    const seen = new Set(prior.map((p: { otherId: string }) => p.otherId));

    const scored = members
      .filter((m) => m.id !== owner.id && !seen.has(m.id))
      .map((other) => ({ other, ...scorePair(owner, other) }))
      .filter((s) => s.score > 0.08)
      .sort((a, b) => b.score - a.score)
      .slice(0, owner.introsPerWeek || 3);

    for (const s of scored) {
      const other = byId.get(s.other.id)!;
      const reason = await whyYouTwo({
        ownerName: owner.name,
        ownerGives: owner.gives,
        ownerWants: owner.wants,
        otherName: other.name,
        otherRole: other.role,
        otherCompany: other.company,
        otherFloor: other.floor,
        otherGives: other.gives,
        otherWants: other.wants,
        matchedOtherGiveToOwnerWant: s.otherGiveToOwnerWant,
        matchedOwnerGiveToOtherWant: s.ownerGiveToOtherWant,
      });

      await db.match.create({
        data: {
          buildingId,
          week,
          ownerId: owner.id,
          otherId: other.id,
          score: s.score,
          matchPct: s.pct,
          reason,
          status: "proposed",
        },
      });
      created++;
    }
  }

  return { week, buildingId, members: members.length, matchesCreated: created };
}

export async function generateForAllBuildings(opts: GenerateOptions = {}) {
  const buildings = await db.building.findMany({ select: { id: true } });
  const results: GenerateResult[] = [];
  for (const b of buildings) {
    results.push(await generateForBuilding(b.id, opts));
  }
  return results;
}
