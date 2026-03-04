/**
 * Update Demo User Script
 *
 * Updates the single demo account to the chosen identity: admin, retailer, client, or supplier.
 * Use on VPS or locally to switch the demo account without creating separate users.
 *
 * One-time migration: Run with --to admin (or no args) to migrate your existing
 * test@user.com in the DB to test@admin.com (full privileges). After that, the
 * main demo account is test@admin.com; use --to client, --to retailer, or --to supplier to switch.
 *
 * Usage:
 *   npx tsx scripts/update-demo-user.ts --to admin   (or no args; default = admin)
 *   npx tsx scripts/update-demo-user.ts --to retailer
 *   npx tsx scripts/update-demo-user.ts --to client
 *   npx tsx scripts/update-demo-user.ts --to supplier
 *
 * Options:
 *   --to admin    → email: test@admin.com, name: "Test Admin", role: "admin", password: 12345678 (default)
 *   --to retailer → email: test@retailer.com, name: "Test Retailer", role: "retailer", password: 12345678
 *   --to client   → email: test@client.com, name: "Client/Customer", role: "client", password: 12345678
 *   --to supplier → email: test@supplier.com, name: "Test Supplier", role: "supplier", password: 12345678 (links first Supplier to this user)
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_EMAILS = [
  "test@user.com",
  "test@admin.com",
  "test@retailer.com",
  "test@client.com",
  "test@supplier.com",
] as const;
const PASSWORD_PLAIN = "12345678";

const TARGETS = {
  admin: {
    email: "test@admin.com",
    name: "Test Admin",
    role: "admin",
  },
  retailer: {
    email: "test@retailer.com",
    name: "Test Retailer",
    role: "retailer",
  },
  client: {
    email: "test@client.com",
    name: "Client/Customer",
    role: "client",
  },
  supplier: {
    email: "test@supplier.com",
    name: "Test Supplier",
    role: "supplier",
  },
} as const;

type TargetKey = keyof typeof TARGETS;

function parseArgs(): TargetKey {
  const withEquals = process.argv.find((a) => a.startsWith("--to="));
  if (withEquals) {
    const value = withEquals.slice("--to=".length);
    if (
      value === "admin" ||
      value === "retailer" ||
      value === "client" ||
      value === "supplier"
    )
      return value;
  }
  const idx = process.argv.indexOf("--to");
  if (idx !== -1 && process.argv[idx + 1]) {
    const next = process.argv[idx + 1];
    if (
      next === "admin" ||
      next === "retailer" ||
      next === "client" ||
      next === "supplier"
    )
      return next;
  }
  const first = process.argv[2];
  if (
    first === "admin" ||
    first === "retailer" ||
    first === "client" ||
    first === "supplier"
  )
    return first;
  return "admin";
}

async function main() {
  const to = parseArgs();
  const target = TARGETS[to];

  console.log(`\n🔄 Update demo user → ${to}`);
  console.log(`   Email: ${target.email}`);
  console.log(`   Name: ${target.name}`);
  console.log(`   Role: ${target.role}`);
  console.log(`   Password: ${PASSWORD_PLAIN}\n`);

  const existing = await prisma.user.findFirst({
    where: { email: { in: [...DEMO_EMAILS] } },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!existing) {
    console.error(
      "❌ No demo user found. Create a user with email test@user.com first (e.g. via register), then run --to admin to migrate to test@admin.com.",
    );
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(PASSWORD_PLAIN, 10);

  await prisma.user.update({
    where: { id: existing.id },
    data: {
      email: target.email,
      name: target.name,
      role: target.role,
      password: hashedPassword,
      updatedAt: new Date(),
    },
  });

  if (to === "supplier") {
    const firstSupplier = await prisma.supplier.findFirst({
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true },
    });
    if (firstSupplier) {
      await prisma.supplier.update({
        where: { id: firstSupplier.id },
        data: {
          userId: existing.id,
          createdBy: existing.id,
          updatedBy: existing.id,
          updatedAt: new Date(),
        },
      });
      console.log(
        `   Linked supplier "${firstSupplier.name}" (${firstSupplier.id}) to this user.`,
      );
    } else {
      console.log(
        "   ⚠ No supplier in DB — create a supplier as admin, then run --to supplier again to link.",
      );
    }
  }

  console.log("✅ Demo user updated successfully.");
  console.log(
    `   Previous: ${existing.email} (${existing.name}, role: ${existing.role ?? "—"})`,
  );
  console.log(
    `   Current:  ${target.email} (${target.name}, role: ${target.role})\n`,
  );
}

main()
  .catch((e) => {
    console.error("❌ Error:", e.message || e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
