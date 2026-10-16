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
    data: { name: "WoCo Spaces", email: "ops@woco.example", plan: "pilot" },
  });

  const building = await db.building.create({
    data: {
      name: "DLF Tower",
      type: "tower",
      city: "Gurugram",
      address: "DLF Cyber City, Gurugram",
      floors: 15,
      cafeName: "the ground-floor cafe",
      pilotDay: 32,
      pilotLength: 60,
      operatorId: operator.id,
    },
  });

  await db.inviteCode.create({
    data: { code: "DLF-TOWER", buildingId: building.id, emailDomains: "" },
  });

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
        buildingId: building.id,
        tags: {
          create: [
            ...m.gives.map((label) => ({ kind: "give", label })),
            ...m.wants.map((label) => ({ kind: "want", label })),
          ],
        },
      },
    });
  }

  // Operator account for the dashboard
  await db.user.create({
    data: {
      email: "operator@orbit.app",
      name: "DLF Tower Ops",
      isOperator: true,
      onboarded: true,
      buildingId: building.id,
    },
  });

  console.log(`Created building ${building.name} with ${MEMBERS.length} members.`);

  const result = await generateForBuilding(building.id, {
    week: isoWeekKey(),
    regenerate: true,
  });
  console.log("Matching complete:", result);

  // Mark a couple of meetings as held so the operator dashboard looks alive.
  const someMatches = await db.match.findMany({ take: 3 });
  for (const mt of someMatches) {
    await db.match.update({ where: { id: mt.id }, data: { status: "accepted" } });
    await db.meeting.create({
      data: {
        matchId: mt.id,
        scheduledAt: new Date(Date.now() + 2 * 24 * 3600 * 1000),
        venue: "Ground-floor cafe, DLF Tower",
        status: "held",
      },
    });
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
