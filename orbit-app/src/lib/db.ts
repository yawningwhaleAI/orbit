import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

// Reuse the client across hot reloads / serverless invocations.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Resolve the best database URL.
// - Vercel Postgres / Neon inject a direct (unpooled) URL we prefer.
// - Prisma Postgres injects a `prisma+postgres://` (Accelerate) URL.
// - Local dev uses the SQLite `DATABASE_URL`.
function resolveDbUrl(): string | undefined {
  return (
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL
  );
}

function createClient(): PrismaClient {
  const url = resolveDbUrl();
  const base = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    ...(url ? { datasources: { db: { url } } } : {}),
  });
  // Prisma Postgres (Accelerate) URLs need the Accelerate client extension.
  if (url && /^prisma(\+postgres)?:\/\//.test(url)) {
    return base.$extends(withAccelerate()) as unknown as PrismaClient;
  }
  return base;
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
