// CLI seed: `npm run db:seed`. Wipes and reseeds demo data (DLF Tower + the
// four Gurugram buildings) and generates this week's introductions.
//
// Demo accounts use reserved, undeliverable @example.com emails (so no one can
// claim them via magic link). In local dev (no email provider) you can sign in
// directly with any email, e.g. demo@example.com or operator@example.com.

import { seedDemo } from "../src/lib/seed";
import { db } from "../src/lib/db";

seedDemo({ force: true })
  .then((r) => {
    console.log("Seed complete:", r);
    console.log("\nDev login at /login with any email, e.g. demo@example.com (member) or operator@example.com (operator).");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
