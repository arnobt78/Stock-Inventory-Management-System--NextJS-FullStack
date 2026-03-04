/**
 * Update Demo Supplier description and notes
 *
 * Sets Description and Notes on the supplier linked to test@supplier.com
 * so they display nicely in supplier list, detail page, and dialogs.
 * Run once after create-demo-accounts (or anytime to refresh the text).
 *
 * Usage (from project root):
 *   npx tsx scripts/update-demo-supplier-description.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_SUPPLIER_EMAIL = "test@supplier.com";

const DEMO_SUPPLIER_DESCRIPTION =
  "Global demo supplier linked to test@supplier.com. All admins can assign products to this supplier; the supplier account can view My Products and View Orders. This supplier cannot be edited, duplicated, or deleted from the UI.";

const DEMO_SUPPLIER_NOTES =
  "Use this supplier when creating products to see them under test@supplier.com's My Products. Orders that include these products will appear in that account's View Orders.";

async function main() {
  console.log("\n📝 Update Demo Supplier description and notes\n");

  const user = await prisma.user.findUnique({
    where: { email: DEMO_SUPPLIER_EMAIL },
    select: { id: true, name: true },
  });

  if (!user) {
    console.log(`   ⚠ User ${DEMO_SUPPLIER_EMAIL} not found. Run create-demo-accounts first.`);
    process.exit(1);
  }

  const supplier = await prisma.supplier.findFirst({
    where: { userId: user.id },
    select: { id: true, name: true, description: true, notes: true },
  });

  if (!supplier) {
    console.log(`   ⚠ No supplier linked to ${DEMO_SUPPLIER_EMAIL}. Run create-demo-accounts first.`);
    process.exit(1);
  }

  await prisma.supplier.update({
    where: { id: supplier.id },
    data: {
      description: DEMO_SUPPLIER_DESCRIPTION,
      notes: DEMO_SUPPLIER_NOTES,
      updatedAt: new Date(),
    },
  });

  console.log(`   ✅ Updated "${supplier.name}" (id: ${supplier.id})`);
  console.log(`      Description: ${DEMO_SUPPLIER_DESCRIPTION.slice(0, 60)}...`);
  console.log(`      Notes: ${DEMO_SUPPLIER_NOTES.slice(0, 60)}...`);
  console.log("");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e.message || e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
