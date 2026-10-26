// Demo data seeding, reusable from the CLI (prisma/seed.ts) and from a
// protected API route (/api/admin/seed) so production can be populated with
// one click. Safe by default: skips if data already exists unless force=true.

import { db } from "./db";
import { generateForBuilding } from "./matching";
import { isoWeekKey } from "./week";

type Seed = {
  email: string;
  name: string;
  role: string;
  company: string;
  floor: number;
  seniority: string;
  education: string;
  bio: string;
  gives: string[];
  wants: string[];
};

const MEMBERS: Seed[] = [
  { email: "demo@example.com", name: "You", role: "Founder", company: "Seed-stage startup", floor: 9, seniority: "founder", education: "Georgia Tech", bio: "Building a seed-stage product company. Figuring out first go-to-market and early hiring.", gives: ["Product strategy", "Hiring advice", "Engineering mentorship"], wants: ["A GTM / growth partner", "Fundraising intros", "First customers"] },
  // Test account — real inbox, so the booking confirmation email actually arrives.
  { email: "aryanaiagents@gmail.com", name: "Aryan (Test)", role: "Founder", company: "Scoutwise", floor: 10, seniority: "founder", education: "Masters' Union", bio: "Testing Orbit end to end. Building an AI research tool for founders.", gives: ["Product strategy", "Data & analytics", "Fundraising advice"], wants: ["A GTM / growth partner", "Hiring (engineering)", "Design feedback"] },
  { email: "priya@example.com", name: "Priya Nair", role: "Head of GTM", company: "Meridian", floor: 3, seniority: "senior", education: "Wharton MBA", bio: "Launched three products to market. Love helping founders find their first wedge.", gives: ["Go-to-market help", "Sales & BD intros", "Marketing & brand"], wants: ["Product feedback", "Fundraising intros", "Hiring (design)"] },
  { email: "rohan@example.com", name: "Rohan Mehta", role: "Design Lead", company: "Loop Studio", floor: 11, seniority: "senior", education: "NID Ahmedabad", bio: "Design systems and product design. Hiring a founding designer this quarter.", gives: ["Design feedback", "Figma / design systems", "Portfolio reviews"], wants: ["Hiring (design)", "A technical co-founder", "Fundraising intros"] },
  { email: "ananya@example.com", name: "Ananya Rao", role: "Angel investor", company: "Rao Capital", floor: 14, seniority: "investor", education: "IIM Bangalore", bio: "Angel in pre-seed and seed. Backing technical founders in B2B and fintech.", gives: ["Angel / investor intros", "Fundraising advice", "Finance & accounting"], wants: ["Portfolio reviews", "Partnerships", "Customer intros"] },
  { email: "devin@example.com", name: "Devin Alvarez", role: "Backend Engineer", company: "Northwind", floor: 6, seniority: "senior", education: "BITS Pilani", bio: "Distributed systems and platform engineering. Tinkering on a side project.", gives: ["Systems architecture", "Engineering mentorship", "Data & analytics"], wants: ["A design partner", "Portfolio reviews", "Product feedback"] },
  { email: "sana@example.com", name: "Sana Kapoor", role: "Growth Marketer", company: "Brightfold", floor: 7, seniority: "mid", education: "SRCC Delhi", bio: "Performance and content growth for early-stage SaaS.", gives: ["Content & growth", "Marketing & brand"], wants: ["A mentor", "Hiring (engineering)", "Product feedback"] },
  { email: "karan@example.com", name: "Karan Singh", role: "Founder", company: "LedgerIQ", floor: 5, seniority: "founder", education: "IIT Delhi", bio: "Fintech founder, raising a seed round. Strong on engineering, learning GTM.", gives: ["Systems architecture", "Engineering mentorship"], wants: ["Fundraising intros", "Angel investors", "A GTM / growth partner"] },
  { email: "neha@example.com", name: "Neha Gupta", role: "Product Manager", company: "Tideline", floor: 8, seniority: "mid", education: "Delhi University", bio: "B2B product manager. Curious about design and early-stage startups.", gives: ["Product strategy", "Customer intros"], wants: ["Design feedback", "A mentor", "Advice on scaling"] },
  { email: "vikram@example.com", name: "Vikram Shetty", role: "Engineering Manager", company: "Northwind", floor: 6, seniority: "senior", education: "NIT Trichy", bio: "Lead a backend team. Mentor junior engineers and hire often.", gives: ["Engineering mentorship", "Hiring advice", "Systems architecture"], wants: ["Marketing help", "Partnerships"] },
  { email: "aisha@example.com", name: "Aisha Khan", role: "Corporate Lawyer", company: "Khan & Co", floor: 12, seniority: "senior", education: "NLSIU Bangalore", bio: "Startup and commercial law. Happy to help founders with contracts.", gives: ["Legal / compliance"], wants: ["Customer intros", "Partnerships"] },
  { email: "arjun@example.com", name: "Arjun Verma", role: "Data Scientist", company: "Tideline", floor: 8, seniority: "mid", education: "ISI Kolkata", bio: "ML and analytics. Want to move into a founding role eventually.", gives: ["Data & analytics"], wants: ["A mentor", "A technical co-founder", "Fundraising intros"] },
  { email: "meera@example.com", name: "Meera Iyer", role: "Brand Designer", company: "Loop Studio", floor: 11, seniority: "mid", education: "Srishti Institute", bio: "Brand and visual identity for startups.", gives: ["Design feedback", "Marketing & brand"], wants: ["Hiring (engineering)", "Advice on scaling", "A mentor"] },
  { email: "rahul@example.com", name: "Rahul Desai", role: "Sales Lead", company: "Brightfold", floor: 7, seniority: "senior", education: "XLRI Jamshedpur", bio: "Enterprise sales. Can open doors to mid-market customers.", gives: ["Sales & BD intros", "Customer intros", "Go-to-market help"], wants: ["Product feedback", "Fundraising intros"] },
  { email: "tara@example.com", name: "Tara Menon", role: "Ops Lead", company: "Meridian", floor: 3, seniority: "senior", education: "FMS Delhi", bio: "Operations and scaling for growth-stage teams.", gives: ["Operations & scaling", "Finance & accounting"], wants: ["A mentor", "Partnerships", "Hiring (engineering)"] },

  // --- Real members (from provided resumes), placed in DLF Tower ---
  { email: "aryan.singh@example.com", name: "Aryan Singh", role: "Strategy & Analytics", company: "Vikabh Securities", floor: 9, seniority: "senior", education: "Masters' Union · VIT", bio: "Strategy and analytics operator across trading, D2C and engineering; building Scoutwise, an AI research tool for founders.", gives: ["Data & analytics", "Product strategy", "Fundraising advice", "Finance & accounting"], wants: ["A technical co-founder", "Hiring (engineering)", "Customer intros"] },
  { email: "pragya.rathi@example.com", name: "Pragya Rathi", role: "Finance & Business Strategy", company: "Recur Club", floor: 4, seniority: "senior", education: "Masters' Union · CFA L3", bio: "Finance and business strategy; structured 100 Cr+ in debt financing for startups and MSMEs.", gives: ["Finance & accounting", "Fundraising advice", "Data & analytics"], wants: ["Partnerships", "A mentor", "Customer intros"] },
  { email: "navya.juneja@example.com", name: "Navya Juneja", role: "Product Manager", company: "PhonePe", floor: 8, seniority: "mid", education: "Masters' Union · Christ University", bio: "Product manager from PhonePe; pricing, GTM and launch across payments.", gives: ["Product strategy", "Go-to-market help", "Data & analytics"], wants: ["A technical co-founder", "Hiring (design)", "Design feedback"] },
  { email: "ishani.handa@example.com", name: "Ishani Handa", role: "Growth / Category Manager", company: "PhonePe", floor: 7, seniority: "mid", education: "Masters' Union · Christ University", bio: "Category and growth from PhonePe; co-founded a D2C brand.", gives: ["Content & growth", "Marketing & brand", "Customer intros"], wants: ["A technical co-founder", "A mentor", "Product feedback"] },
];

const POOL = [
  { role: "Founder", seniority: "founder", gives: ["Product strategy", "Hiring advice"], wants: ["Fundraising intros", "A GTM / growth partner"] },
  { role: "Backend Engineer", seniority: "senior", gives: ["Systems architecture", "Engineering mentorship"], wants: ["A design partner", "Portfolio reviews"] },
  { role: "Product Designer", seniority: "mid", gives: ["Design feedback", "Figma / design systems"], wants: ["A technical co-founder", "Hiring (design)"] },
  { role: "Head of GTM", seniority: "senior", gives: ["Go-to-market help", "Sales & BD intros"], wants: ["Product feedback", "Fundraising intros"] },
  { role: "Angel Investor", seniority: "investor", gives: ["Angel / investor intros", "Fundraising advice"], wants: ["Portfolio reviews", "Customer intros"] },
  { role: "Growth Marketer", seniority: "mid", gives: ["Content & growth", "Marketing & brand"], wants: ["A mentor", "Product feedback"] },
  { role: "Data Scientist", seniority: "mid", gives: ["Data & analytics"], wants: ["A mentor", "A technical co-founder"] },
];
const FIRST = ["Aarav", "Diya", "Kabir", "Isha", "Reyansh", "Anaya", "Vivaan", "Myra", "Aditya", "Saanvi"];
const LAST = ["Sharma", "Verma", "Reddy", "Nair", "Gupta", "Shah", "Bose", "Kaur", "Jain", "Rao"];
const COMPANIES = ["Northstar", "Quanta", "Finlytics", "Brightwave", "Axon", "Lumen", "Cadence"];

const BUILDINGS = [
  { name: "DLF Tower", code: "DLF-TOWER", type: "tower", floors: 15 },
  { name: "CDS", code: "CDS", type: "tower", floors: 12 },
  { name: "WoCo Building", code: "WOCO", type: "coworking", floors: 8 },
  { name: "Capital Tower", code: "CAPITAL", type: "tower", floors: 18 },
];

export interface SeedResult {
  skipped: boolean;
  users?: number;
  buildings?: number;
  intros?: number;
}

export async function seedDemo({ force = false } = {}): Promise<SeedResult> {
  const existing = await db.user.count();
  if (existing > 0 && !force) {
    return { skipped: true, users: existing };
  }

  // Clean slate (safe: DB is empty, or force was requested).
  await db.meeting.deleteMany();
  await db.match.deleteMany();
  await db.profileTag.deleteMany();
  await db.user.deleteMany();
  await db.inviteCode.deleteMany();
  await db.building.deleteMany();
  await db.operator.deleteMany();

  const operator = await db.operator.create({
    data: { name: "Orbit Pilot Operator", email: "ops@example.com", plan: "pilot" },
  });

  const buildingByCode: Record<string, string> = {};
  for (const b of BUILDINGS) {
    const created = await db.building.create({
      data: {
        name: b.name,
        type: b.type,
        city: "Gurugram",
        address: `${b.name}, Gurugram`,
        floors: b.floors,
        cafeName: "the ground-floor cafe",
        pilotDay: 32,
        pilotLength: 60,
        operatorId: operator.id,
      },
    });
    buildingByCode[b.code] = created.id;
    await db.inviteCode.create({ data: { code: b.code, buildingId: created.id, emailDomains: "" } });
  }
  const dlfId = buildingByCode["DLF-TOWER"];

  for (const m of MEMBERS) {
    await db.user.create({
      data: {
        email: m.email,
        name: m.name,
        avatarSeed: m.name[0],
        onboarded: true,
        status: "active",
        role: m.role,
        company: m.company,
        floor: m.floor,
        seniority: m.seniority,
        education: m.education,
        bio: m.bio,
        buildingId: dlfId,
        tags: {
          create: [
            ...m.gives.map((label) => ({ kind: "give", label })),
            ...m.wants.map((label) => ({ kind: "want", label })),
          ],
        },
      },
    });
  }

  for (const code of ["CDS", "WOCO", "CAPITAL"]) {
    const bId = buildingByCode[code];
    const b = BUILDINGS.find((x) => x.code === code)!;
    for (let i = 0; i < 7; i++) {
      const t = POOL[i % POOL.length];
      const first = FIRST[(i * 2) % FIRST.length];
      const last = LAST[(i * 3) % LAST.length];
      await db.user.create({
        data: {
          email: `${code.toLowerCase()}-${i}@example.com`,
          name: `${first} ${last}`,
          avatarSeed: first[0],
          onboarded: true,
          status: "active",
          role: t.role,
          company: COMPANIES[i % COMPANIES.length],
          floor: 1 + ((i * 2) % b.floors),
          seniority: t.seniority,
          bio: `${t.role} in ${b.name}.`,
          buildingId: bId,
          tags: {
            create: [
              ...t.gives.map((label) => ({ kind: "give", label })),
              ...t.wants.map((label) => ({ kind: "want", label })),
            ],
          },
        },
      });
    }
  }

  await db.user.create({
    data: {
      email: "operator@example.com",
      name: "DLF Tower Ops",
      isOperator: true,
      onboarded: true,
      buildingId: dlfId,
    },
  });

  let intros = 0;
  for (const b of BUILDINGS) {
    const r = await generateForBuilding(buildingByCode[b.code], { week: isoWeekKey(), regenerate: true });
    intros += r.matchesCreated;
  }

  // Make the operator dashboard look alive; leave demo user's intros open.
  const demo = await db.user.findUnique({ where: { email: "demo@example.com" } });
  const others = await db.match.findMany({
    where: { buildingId: dlfId, ownerId: { not: demo?.id } },
    take: 10,
  });
  const picked = others.slice(0, 5);
  for (let i = 0; i < picked.length; i++) {
    const mt = picked[i];
    await db.match.update({ where: { id: mt.id }, data: { status: "accepted", respondedAt: new Date() } });
    // Mix of confirmed upcoming and past-held coffees for a lively dashboard.
    const held = i >= 3;
    await db.meeting.create({
      data: {
        matchId: mt.id,
        scheduledAt: new Date(Date.now() + (held ? -2 : 2) * 24 * 3600 * 1000),
        venue: "the ground-floor cafe, DLF Tower",
        status: held ? "held" : "confirmed",
        proposedById: mt.ownerId,
        respondedAt: new Date(),
      },
    });
  }
  for (const mt of others.slice(5, 8)) {
    await db.match.update({ where: { id: mt.id }, data: { status: "passed", respondedAt: new Date() } });
  }

  return { skipped: false, buildings: BUILDINGS.length, intros };
}
