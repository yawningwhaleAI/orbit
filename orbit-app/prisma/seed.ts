// Seed the demo building (DLF Tower, Gurugram) with members so the app runs
// out of the box, then generate this week's introductions.
//
// Demo logins (dev email login, any of these):
//   demo@orbit.app      -> "You" (founder) — the main member to explore as
//   operator@orbit.app  -> operator dashboard for DLF Tower

import { PrismaClient } from "@prisma/client";
import { generateForBuilding } from "../src/lib/matching";
import { isoWeekKey } from "../src/lib/week";

const db = new PrismaClient();

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
  {
    email: "demo@orbit.app",
    name: "You",
    role: "Founder",
    company: "Seed-stage startup",
    floor: 9,
    seniority: "founder",
    education: "Georgia Tech",
    bio: "Building a seed-stage product company. Figuring out first go-to-market and early hiring.",
    gives: ["Product strategy", "Hiring advice", "Engineering mentorship"],
    wants: ["A GTM / growth partner", "Fundraising intros", "First customers"],
  },
  {
    email: "priya@orbit.app",
    name: "Priya Nair",
    role: "Head of GTM",
    company: "Meridian",
    floor: 3,
    seniority: "senior",
    education: "Wharton MBA",
    bio: "Launched three products to market. Love helping founders find their first wedge.",
    gives: ["Go-to-market help", "Sales & BD intros", "Marketing & brand"],
    wants: ["Product feedback", "Fundraising intros", "Hiring (design)"],
  },
  {
    email: "rohan@orbit.app",
    name: "Rohan Mehta",
    role: "Design Lead",
    company: "Loop Studio",
    floor: 11,
    seniority: "senior",
    education: "NID Ahmedabad",
    bio: "Design systems and product design. Hiring a founding designer this quarter.",
    gives: ["Design feedback", "Figma / design systems", "Portfolio reviews"],
    wants: ["Hiring (design)", "A technical co-founder", "Fundraising intros"],
  },
  {
    email: "ananya@orbit.app",
    name: "Ananya Rao",
    role: "Angel investor",
    company: "Rao Capital",
    floor: 14,
    seniority: "investor",
    education: "IIM Bangalore",
    bio: "Angel in pre-seed and seed. Backing technical founders in B2B and fintech.",
    gives: ["Angel / investor intros", "Fundraising advice", "Finance & accounting"],
    wants: ["Portfolio reviews", "Partnerships", "Customer intros"],
  },
  {
    email: "devin@orbit.app",
    name: "Devin Alvarez",
    role: "Backend Engineer",
    company: "Northwind",
    floor: 6,
    seniority: "senior",
    education: "BITS Pilani",
    bio: "Distributed systems and platform engineering. Tinkering on a side project.",
    gives: ["Systems architecture", "Engineering mentorship", "Data & analytics"],
    wants: ["A design partner", "Portfolio reviews", "Product feedback"],
  },
  {
    email: "sana@orbit.app",
    name: "Sana Kapoor",
    role: "Growth Marketer",
    company: "Brightfold",
    floor: 7,
    seniority: "mid",
    education: "SRCC Delhi",
    bio: "Performance and content growth for early-stage SaaS.",
    gives: ["Content & growth", "Marketing & brand"],
    wants: ["A mentor", "Hiring (engineering)", "Product feedback"],
  },
  {
    email: "karan@orbit.app",
    name: "Karan Singh",
    role: "Founder",
    company: "LedgerIQ",
    floor: 5,
    seniority: "founder",
    education: "IIT Delhi",
    bio: "Fintech founder, raising a seed round. Strong on engineering, learning GTM.",
    gives: ["Systems architecture", "Engineering mentorship"],
    wants: ["Fundraising intros", "Angel investors", "A GTM / growth partner"],
  },
  {
    email: "neha@orbit.app",
    name: "Neha Gupta",
    role: "Product Manager",
    company: "Tideline",
    floor: 8,
    seniority: "mid",
    education: "Delhi University",
    bio: "B2B product manager. Curious about design and early-stage startups.",
    gives: ["Product strategy", "Customer intros"],
    wants: ["Design feedback", "A mentor", "Advice on scaling"],
  },
  {
    email: "vikram@orbit.app",
    name: "Vikram Shetty",
    role: "Engineering Manager",
    company: "Northwind",
    floor: 6,
    seniority: "senior",
    education: "NIT Trichy",
    bio: "Lead a backend team. Mentor junior engineers and hire often.",
    gives: ["Engineering mentorship", "Hiring advice", "Systems architecture"],
    wants: ["Marketing help", "Partnerships"],
  },
  {
    email: "aisha@orbit.app",
    name: "Aisha Khan",
    role: "Corporate Lawyer",
    company: "Khan & Co",
    floor: 12,
    seniority: "senior",
    education: "NLSIU Bangalore",
    bio: "Startup and commercial law. Happy to help founders with contracts.",
    gives: ["Legal / compliance"],
    wants: ["Customer intros", "Partnerships"],
  },
  {
    email: "arjun@orbit.app",
    name: "Arjun Verma",
    role: "Data Scientist",
    company: "Tideline",
    floor: 8,
    seniority: "mid",
    education: "ISI Kolkata",
    bio: "ML and analytics. Want to move into a founding role eventually.",
    gives: ["Data & analytics"],
    wants: ["A mentor", "A technical co-founder", "Fundraising intros"],
  },
  {
    email: "meera@orbit.app",
    name: "Meera Iyer",
    role: "Brand Designer",
    company: "Loop Studio",
    floor: 11,
    seniority: "mid",
    education: "Srishti Institute",
    bio: "Brand and visual identity for startups.",
    gives: ["Design feedback", "Marketing & brand"],
    wants: ["Hiring (engineering)", "Advice on scaling", "A mentor"],
  },
  {
    email: "rahul@orbit.app",
    name: "Rahul Desai",
    role: "Sales Lead",
    company: "Brightfold",
    floor: 7,
    seniority: "senior",
    education: "XLRI Jamshedpur",
    bio: "Enterprise sales. Can open doors to mid-market customers.",
    gives: ["Sales & BD intros", "Customer intros", "Go-to-market help"],
    wants: ["Product feedback", "Fundraising intros"],
  },
  {
    email: "tara@orbit.app",
    name: "Tara Menon",
    role: "Ops Lead",
    company: "Meridian",
    floor: 3,
    seniority: "senior",
    education: "FMS Delhi",
    bio: "Operations and scaling for growth-stage teams.",
    gives: ["Operations & scaling", "Finance & accounting"],
    wants: ["A mentor", "Partnerships", "Hiring (engineering)"],
  },
];

// Lightweight member templates to populate the other buildings so every
// building choice shows real suggestions during the demo.
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

async function main() {
  console.log("Seeding Orbit demo data...");

  // Clean slate (dev only)
  await db.meeting.deleteMany();
  await db.match.deleteMany();
  await db.profileTag.deleteMany();
  await db.user.deleteMany();
  await db.inviteCode.deleteMany();
  await db.building.deleteMany();
  await db.operator.deleteMany();

  const operator = await db.operator.create({
    data: { name: "Orbit Pilot Operator", email: "ops@orbit.app", plan: "pilot" },
  });

  // The four pilot buildings, selectable at onboarding.
  const BUILDINGS = [
    { name: "DLF Tower", code: "DLF-TOWER", type: "tower", floors: 15 },
    { name: "CDS", code: "CDS", type: "tower", floors: 12 },
    { name: "WoCo Building", code: "WOCO", type: "coworking", floors: 8 },
    { name: "Capital Tower", code: "CAPITAL", type: "tower", floors: 18 },
  ];
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

  // Detailed members -> DLF Tower
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

  // Generated members -> the other three buildings, so every choice is alive.
  for (const code of ["CDS", "WOCO", "CAPITAL"]) {
    const bId = buildingByCode[code];
    const b = BUILDINGS.find((x) => x.code === code)!;
    for (let i = 0; i < 7; i++) {
      const t = POOL[i % POOL.length];
      const first = FIRST[(i * 2) % FIRST.length];
      const last = LAST[(i * 3) % LAST.length];
      await db.user.create({
        data: {
          email: `${code.toLowerCase()}-${i}@orbit.app`,
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

  // Operator account for the dashboard (DLF Tower)
  await db.user.create({
    data: {
      email: "operator@orbit.app",
      name: "DLF Tower Ops",
      isOperator: true,
      onboarded: true,
      buildingId: dlfId,
    },
  });

  console.log(`Created ${BUILDINGS.length} buildings with members.`);

  const results = [];
  for (const b of BUILDINGS) {
    results.push(await generateForBuilding(buildingByCode[b.code], { week: isoWeekKey(), regenerate: true }));
  }
  console.log("Matching complete:", results.map((r) => r.matchesCreated).reduce((a, c) => a + c, 0), "intros");

  // Mark a few OTHER DLF members' meetings as held so the operator dashboard
  // looks alive — but leave the demo user's own intros open to try accept/pass.
  const demo = await db.user.findUnique({ where: { email: "demo@orbit.app" } });
  const others = await db.match.findMany({
    where: { buildingId: dlfId, ownerId: { not: demo?.id } },
    take: 10,
  });
  // A realistic spread: some accepted (coffees held), some passed, rest open.
  const accept = others.slice(0, 5);
  const pass = others.slice(5, 8);
  for (const mt of accept) {
    await db.match.update({ where: { id: mt.id }, data: { status: "accepted", respondedAt: new Date() } });
    await db.meeting.create({
      data: {
        matchId: mt.id,
        scheduledAt: new Date(Date.now() + 2 * 24 * 3600 * 1000),
        venue: "the ground-floor cafe, DLF Tower",
        status: "held",
      },
    });
  }
  for (const mt of pass) {
    await db.match.update({ where: { id: mt.id }, data: { status: "passed", respondedAt: new Date() } });
  }

  console.log("\nDone. Log in at /login with demo@orbit.app (member) or operator@orbit.app (operator).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
