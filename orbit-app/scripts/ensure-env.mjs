// Create a local .env from .env.example on first run, so a fresh clone works
// out of the box (the real .env is gitignored and holds no committed secrets).
import { existsSync, copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const env = join(root, ".env");
const example = join(root, ".env.example");

if (!existsSync(env) && existsSync(example)) {
  copyFileSync(example, env);
  console.log("Created .env from .env.example. Set AUTH_SECRET + CRON_SECRET before deploying.");
}
