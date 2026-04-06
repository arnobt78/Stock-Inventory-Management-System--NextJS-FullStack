/**
 * Delete All Suppliers Script
 * 
 * This script deletes all suppliers from the database.
 * 
 * Usage:
 *   npx tsx scripts/delete-all-suppliers.ts
 *   or
 *   npm run script:delete-all-suppliers
 * 
 * WARNING: This will permanently delete all suppliers. Use with caution!
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Main function to delete all suppliers
 */
async function deleteAllSuppliers() {
  try {
    // Safety confirmation
    console.log("⚠️  WARNING: This will delete ALL suppliers!");
    console.log("⚠️  This action cannot be undone!\n");

    console.log("🚀 Starting deletion of all suppliers...\n");

    // Count suppliers before deletion
    const countBefore = await prisma.supplier.count();
    console.log(`📊 Found ${countBefore} supplier(s) in database\n`);

    if (countBefore === 0) {
      console.log("ℹ️  No suppliers to delete.");
      return;
    }

    // Delete all suppliers
    console.log("🚚 Deleting all suppliers...");
    const deletedSuppliers = await prisma.supplier.deleteMany({});
    console.log(`   ✓ Deleted ${deletedSuppliers.count} supplier(s)\n`);

    console.log("✅ Successfully deleted all suppliers!");
    console.log(`   Total deleted: ${deletedSuppliers.count}`);
  } catch (error) {
    console.error("❌ Error deleting suppliers:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
deleteAllSuppliers();

