// Manually run the weekly matching for all buildings.
//   npm run match:run            -> fill gaps (skip members who already have intros)
//   npm run match:run -- --regen -> wipe this week's intros and regenerate
import { generateForAllBuildings } from "../src/lib/matching";
import { db } from "../src/lib/db";

(async () => {
  const regenerate = process.argv.includes("--regen");
  const results = await generateForAllBuildings({ regenerate });
  console.log(JSON.stringify(results, null, 2));
  await db.$disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
