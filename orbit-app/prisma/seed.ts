// CLI seed: `npm run db:seed`. Wipes and reseeds demo data (DLF Tower + the
// four Gurugram buildings) and generates this week's introductions.
//
// Demo logins (email dev login):
//   demo@orbit.app      -> "You" (founder) — explore the member app
//   operator@orbit.app  -> operator dashboard

import { seedDemo } from "../src/lib/seed";
import { db } from "../src/lib/db";

seedDemo({ force: true })
  .then((r) => {
    console.log("Seed complete:", r);
    console.log("\nLog in at /login with demo@orbit.app or operator@orbit.app");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
