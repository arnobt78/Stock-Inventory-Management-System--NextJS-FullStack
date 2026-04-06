/**
 * Create Demo Accounts (Client & Supplier)
 *
 * Creates two users in the DB for the login dropdown demo. Run this after you
 * have created your own admin account (e.g. via Register). Does not create
 * admin — new signups already get admin role.
 *
 * Creates:
 *   - test@client.com  / 12345678  / "Test Client"  / role: client
 *   - test@supplier.com / 12345678 / "Test Supplier" / role: supplier
 *
 * For the supplier portal to work, links the first existing Supplier to
 * test@supplier.com (or creates a "Demo Supplier" if none exist).
 *
 * Usage (from project root, same DB as app/VPS):
 *   npx tsx scripts/create-demo-accounts.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PASSWORD_PLAIN = "12345678";

const DEMO_USERS = [
  {
    email: "test@client.com",
    name: "Test Client",
    username: "testclient",
    role: "client",
    googleId: "demo-client", // unique placeholder so User_googleId_key is not violated
  },
  {
    email: "test@supplier.com",
    name: "Test Supplier",
    username: "testsupplier",
    role: "supplier",
    googleId: "demo-supplier",
  },
] as const;

async function main() {
  console.log("\n📦 Create demo accounts (client + supplier)\n");

  const hashedPassword = await bcrypt.hash(PASSWORD_PLAIN, 10);

  for (const u of DEMO_USERS) {
    const existing = await prisma.user.findUnique({
      where: { email: u.email },
      select: { id: true, name: true, role: true },
    });

    if (existing) {
      console.log(`   ⏭ ${u.email} already exists (${existing.name}, role: ${existing.role ?? "—"}). Skipping.`);
      continue;
    }

    await prisma.user.create({
      data: {
        email: u.email,
        name: u.name,
        username: u.username,
        password: hashedPassword,
        role: u.role,
        googleId: u.googleId,
        createdAt: new Date(),
      },
    });
    console.log(`   ✅ Created ${u.email} (${u.name}, role: ${u.role})`);
  }

  const supplierUser = await prisma.user.findUnique({
    where: { email: "test@supplier.com" },
    select: { id: true },
  });

  if (supplierUser) {
    const firstSupplier = await prisma.supplier.findFirst({
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true },
    });

    if (firstSupplier) {
      await prisma.supplier.update({
        where: { id: firstSupplier.id },
        data: {
          userId: supplierUser.id,
          createdBy: supplierUser.id,
          updatedBy: supplierUser.id,
          updatedAt: new Date(),
        },
      });
      console.log(`   ✅ Linked supplier "${firstSupplier.name}" to test@supplier.com`);
    } else {
      await prisma.supplier.create({
        data: {
          name: "Demo Supplier",
          userId: supplierUser.id,
          status: true,
          createdBy: supplierUser.id,
          updatedBy: supplierUser.id,
          updatedAt: new Date(),
        },
      });
      console.log(`   ✅ Created "Demo Supplier" and linked to test@supplier.com`);
    }
  }

  console.log("\n   Password for both demo accounts: " + PASSWORD_PLAIN);
  console.log("   Use the login dropdown to sign in as Admin (your account), Client, or Supplier.\n");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e.message || e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
