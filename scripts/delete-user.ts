/**
 * Delete User Script
 * 
 * This script deletes a specific user from the database by email.
 * 
 * Usage:
 *   npx tsx scripts/delete-user.ts <email>
 *   or
 *   npm run script:delete-user <email>
 * 
 * Example:
 *   npm run script:delete-user arnobt78@gmail.com
 * 
 * WARNING: This will permanently delete the user and all their associated data. Use with caution!
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Main function to delete a user by email
 */
async function deleteUser(email?: string) {
  try {
    // Get email from command line arguments
    const userEmail = email || process.argv[2];

    if (!userEmail) {
      console.error("❌ Error: Email is required!");
      console.log("\nUsage:");
      console.log("  npx tsx scripts/delete-user.ts <email>");
      console.log("  or");
      console.log("  npm run script:delete-user <email>");
      console.log("\nExample:");
      console.log("  npm run script:delete-user arnobt78@gmail.com");
      process.exit(1);
    }

    console.log(`🔍 Searching for user with email: ${userEmail}...\n`);

    // Find the user first
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        googleId: true,
        createdAt: true,
      },
    });

    if (!user) {
      console.log(`❌ User with email "${userEmail}" not found.`);
      process.exit(0);
    }

    // Display user information
    console.log("📋 User Information:");
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Name: ${user.name}`);
    console.log(`   - Username: ${user.username || "N/A"}`);
    console.log(`   - Google ID: ${user.googleId || "N/A"}`);
    console.log(`   - Created At: ${user.createdAt}`);
    console.log();

    // Check for associated data
    const productCount = await prisma.product.count({
      where: { userId: user.id },
    });
    const supplierCount = await prisma.supplier.count({
      where: { userId: user.id },
    });
    const categoryCount = await prisma.category.count({
      where: { userId: user.id },
    });

    console.log("📊 Associated Data:");
    console.log(`   - Products: ${productCount}`);
    console.log(`   - Suppliers: ${supplierCount}`);
    console.log(`   - Categories: ${categoryCount}`);
    console.log();

    if (productCount > 0 || supplierCount > 0 || categoryCount > 0) {
      console.log(
        "⚠️  WARNING: This user has associated data that will NOT be deleted automatically."
      );
      console.log(
        "⚠️  You may need to delete products, suppliers, and categories separately."
      );
      console.log();
    }

    // Safety confirmation
    console.log(`⚠️  WARNING: This will permanently delete user "${userEmail}"!`);
    console.log("⚠️  This action cannot be undone!\n");

    // Delete the user
    console.log(`🚀 Deleting user "${userEmail}"...\n`);

    const deletedUser = await prisma.user.delete({
      where: { email: userEmail },
    });

    console.log("✅ Successfully deleted user!");
    console.log(`   - Email: ${deletedUser.email}`);
    console.log(`   - Name: ${deletedUser.name}`);
    console.log(
      "\n💡 Note: You can now create a new account with this email via Google OAuth."
    );
  } catch (error: any) {
    if (error.code === "P2003") {
      console.error(
        "❌ Error: Cannot delete user because they have associated data."
      );
      console.error(
        "   Please delete all products, suppliers, and categories for this user first."
      );
    } else {
      console.error("❌ Error deleting user:", error.message || error);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
deleteUser();
