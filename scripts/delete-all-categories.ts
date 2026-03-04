/**
 * Delete All Categories Script
 * 
 * This script deletes all categories from the database.
 * 
 * Usage:
 *   npx tsx scripts/delete-all-categories.ts
 *   or
 *   npm run script:delete-all-categories
 * 
 * WARNING: This will permanently delete all categories. Use with caution!
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Main function to delete all categories
 */
async function deleteAllCategories() {
  try {
    // Safety confirmation
    console.log("⚠️  WARNING: This will delete ALL categories!");
    console.log("⚠️  This action cannot be undone!\n");

    console.log("🚀 Starting deletion of all categories...\n");

    // Count categories before deletion
    const countBefore = await prisma.category.count();
    console.log(`📊 Found ${countBefore} category(ies) in database\n`);

    if (countBefore === 0) {
      console.log("ℹ️  No categories to delete.");
      return;
    }

    // Delete all categories
    console.log("📁 Deleting all categories...");
    const deletedCategories = await prisma.category.deleteMany({});
    console.log(`   ✓ Deleted ${deletedCategories.count} category(ies)\n`);

    console.log("✅ Successfully deleted all categories!");
    console.log(`   Total deleted: ${deletedCategories.count}`);
  } catch (error) {
    console.error("❌ Error deleting categories:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
deleteAllCategories();

