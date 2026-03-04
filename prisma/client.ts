import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client Singleton
 * Prevents connection exhaustion by reusing the same instance
 * Connection pooling is configured in the connection string
 * Example: DATABASE_URL="mongodb://...?maxPoolSize=10"
 */

// PrismaClient is attached to the `global` object in development
// to prevent exhausting database connections during hot reloads
declare global {
  var prisma: PrismaClient | undefined;
}

// Only initialize Prisma on server-side
const isServer = typeof window === "undefined";

export const prisma = isServer
  ? (globalThis as { prisma?: PrismaClient }).prisma ||
    new PrismaClient({
      log:
        process.env.NODE_ENV === "development"
          ? ["error", "warn"] // Removed "query" to reduce log noise
          : ["error"],
    })
  : ({} as PrismaClient); // Dummy client for client-side (should never be used)

if (isServer && process.env.NODE_ENV !== "production") {
  (globalThis as { prisma?: PrismaClient }).prisma = prisma;
}

// Test database connection (server-side only)
if (isServer) {
  prisma
    .$connect()
    .then(() => console.log("✓ Connected to the database"))
    .catch((error) => console.error("✗ Database connection error:", error));
}

export default prisma;
