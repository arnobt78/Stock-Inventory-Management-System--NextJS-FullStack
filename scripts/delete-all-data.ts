/**
 * Delete All Data
 *
 * Removes all documents from the database (fresh start). Run from project root
 * with the same DATABASE_URL as your app (local or VPS).
 *
 * Usage:
 *   npx tsx scripts/delete-all-data.ts
 *
 * After running: register manually to create your admin account, then run
 *   npx tsx scripts/create-demo-accounts.ts
 * to create test@client.com and test@supplier.com.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("\n🗑 Deleting all data...\n");

  // Delete in dependency order (children before parents)
  const orderItem = await prisma.orderItem.deleteMany({});
  console.log(`   OrderItem: ${orderItem.count}`);

  const invoice = await prisma.invoice.deleteMany({});
  console.log(`   Invoice: ${invoice.count}`);

  const notification = await prisma.notification.deleteMany({});
  console.log(`   Notification: ${notification.count}`);

  const order = await prisma.order.deleteMany({});
  console.log(`   Order: ${order.count}`);

  const product = await prisma.product.deleteMany({});
  console.log(`   Product: ${product.count}`);

  const stockAllocation = await prisma.stockAllocation.deleteMany({});
  console.log(`   StockAllocation: ${stockAllocation.count}`);

  const stockTransfer = await prisma.stockTransfer.deleteMany({});
  console.log(`   StockTransfer: ${stockTransfer.count}`);

  const importHistory = await prisma.importHistory.deleteMany({});
  console.log(`   ImportHistory: ${importHistory.count}`);

  const supportTicket = await prisma.supportTicket.deleteMany({});
  console.log(`   SupportTicket: ${supportTicket.count}`);

  const productReview = await prisma.productReview.deleteMany({});
  console.log(`   ProductReview: ${productReview.count}`);

  const auditLog = await prisma.auditLog.deleteMany({});
  console.log(`   AuditLog: ${auditLog.count}`);

  const category = await prisma.category.deleteMany({});
  console.log(`   Category: ${category.count}`);

  const supplier = await prisma.supplier.deleteMany({});
  console.log(`   Supplier: ${supplier.count}`);

  const warehouse = await prisma.warehouse.deleteMany({});
  console.log(`   Warehouse: ${warehouse.count}`);

  const session = await prisma.session.deleteMany({});
  console.log(`   Session: ${session.count}`);

  const permission = await prisma.permission.deleteMany({});
  console.log(`   Permission: ${permission.count}`);

  const stockAlert = await prisma.stockAlert.deleteMany({});
  console.log(`   StockAlert: ${stockAlert.count}`);

  const userAction = await prisma.userAction.deleteMany({});
  console.log(`   UserAction: ${userAction.count}`);

  const verificationToken = await prisma.verificationToken.deleteMany({});
  console.log(`   VerificationToken: ${verificationToken.count}`);

  const department = await prisma.department.deleteMany({});
  console.log(`   Department: ${department.count}`);

  const systemConfig = await prisma.systemConfig.deleteMany({});
  console.log(`   SystemConfig: ${systemConfig.count}`);

  const user = await prisma.user.deleteMany({});
  console.log(`   User: ${user.count}`);

  console.log("\n✅ All data deleted. You can now register to create your admin account.\n");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e.message || e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
