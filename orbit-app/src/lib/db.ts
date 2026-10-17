import { PrismaClient } from "@prisma/client";

// Reuse the Prisma client across hot reloads in dev to avoid exhausting
// database connections.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Resolve the best database URL. Vercel Postgres / Neon inject BOTH a pooled
// (PgBouncer) URL and a direct one; Prisma is happiest on the DIRECT URL
// (avoids prepared-statement issues and works for schema pushes). Fall back to
// DATABASE_URL (e.g. local SQLite, or a plain Postgres string).
function resolveDbUrl(): string | undefined {
  return (
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL
  );
}

const url = resolveDbUrl();

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    ...(url ? { datasources: { db: { url } } } : {}),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
