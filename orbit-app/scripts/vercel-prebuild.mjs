// Prepares Prisma for the target environment at build time.
//
// - Local build/dev: provider stays "sqlite" (zero-config).
// - Vercel (VERCEL=1) or PRISMA_PROVIDER=postgresql: switches the datasource
//   provider to "postgresql" and, when DATABASE_URL is present, pushes the
//   schema so the tables exist. The committed schema.prisma stays "sqlite";
//   this rewrite only affects the ephemeral build checkout.
//
// This means deploying to Vercel needs NO manual schema edits — just set the
// env vars (DATABASE_URL, AUTH_SECRET, ...).

import fs from "node:fs";
import { execSync } from "node:child_process";

const onVercel = !!process.env.VERCEL;
const provider =
  process.env.PRISMA_PROVIDER || (onVercel ? "postgresql" : "sqlite");

const schemaPath = new URL("../prisma/schema.prisma", import.meta.url);
let schema = fs.readFileSync(schemaPath, "utf8");
schema = schema.replace(/provider = "(sqlite|postgresql)"/, `provider = "${provider}"`);
fs.writeFileSync(schemaPath, schema);
console.log(`[prebuild] Prisma provider = ${provider}`);

// Use the DIRECT (non-pooled) URL for schema push when available.
const pushUrl =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL;

if (provider === "postgresql" && pushUrl) {
  try {
    console.log("[prebuild] Pushing schema to Postgres...");
    execSync("npx prisma db push --skip-generate", {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: pushUrl },
    });
  } catch (e) {
    // Don't fail the build if push has an issue; app will surface it at runtime.
    console.error("[prebuild] prisma db push failed (continuing):", e?.message || e);
  }
} else if (provider === "postgresql") {
  console.warn("[prebuild] No database URL set — skipping db push.");
}
