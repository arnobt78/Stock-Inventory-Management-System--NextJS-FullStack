/**
 * One-time migration script to backfill stock reduction for existing confirmed/paid orders
 * This script reduces product stock for all orders that are confirmed/paid but haven't had their stock reduced yet
 * 
 * Usage: npx tsx scripts/backfill-order-stock.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Simple logger for script
const logger = {
  info: (message: string, ...args: unknown[]) => console.log(`ℹ️  ${message}`, ...args),
  warn: (message: string, ...args: unknown[]) => console.warn(`⚠️  ${message}`, ...args),
  error: (message: string, ...args: unknown[]) => console.error(`❌ ${message}`, ...args),
};

async function backfillOrderStock() {
  try {
    logger.info("Starting stock backfill for confirmed/paid orders...");

    // Find all orders that are confirmed/paid (status: confirmed, processing, shipped, delivered OR paymentStatus: paid)
    // Exclude cancelled orders
    const confirmedPaidOrders = await prisma.order.findMany({
      where: {
        status: {
          not: "cancelled",
        },
        OR: [
          {
            status: {
              in: ["confirmed", "processing", "shipped", "delivered"],
            },
          },
          {
            paymentStatus: "paid",
          },
        ],
      },
      include: {
        items: true,
      },
    });

    logger.info(`Found ${confirmedPaidOrders.length} confirmed/paid orders to process`);

    let totalStockReduced = 0;
    let ordersProcessed = 0;

    // Process each order
    for (const order of confirmedPaidOrders) {
      // Check if order is actually confirmed/paid
      const isConfirmedOrPaid =
        order.status === "confirmed" ||
        order.status === "processing" ||
        order.status === "shipped" ||
        order.status === "delivered" ||
        order.paymentStatus === "paid";

      // Skip cancelled orders
      if (order.status === "cancelled") {
        continue;
      }

      if (!isConfirmedOrPaid) {
        continue;
      }

      // Reduce stock for each item in the order
      for (const item of order.items) {
        try {
          // Get current product stock
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
            select: { id: true, name: true, sku: true, quantity: true },
          });

          if (!product) {
            logger.warn(`Product not found for item: ${item.id}, productId: ${item.productId}`);
            continue;
          }

          const currentStock = Number(product.quantity);
          const orderedQty = item.quantity;

          // Reduce stock
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              quantity: {
                decrement: orderedQty,
              },
            },
          });

          totalStockReduced += orderedQty;
          logger.info(
            `Order ${order.orderNumber}: Reduced ${orderedQty} units of ${product.name} (SKU: ${product.sku}). Stock: ${currentStock} → ${currentStock - orderedQty}`
          );
        } catch (error) {
          logger.error(
            `Error reducing stock for item ${item.id} in order ${order.orderNumber}:`,
            error
          );
        }
      }

      ordersProcessed++;
    }

    logger.info(
      `Stock backfill completed: ${ordersProcessed} orders processed, ${totalStockReduced} total units reduced`
    );

    console.log("\n✅ Stock backfill completed successfully!");
    console.log(`   - Orders processed: ${ordersProcessed}`);
    console.log(`   - Total units reduced: ${totalStockReduced}\n`);
  } catch (error) {
    logger.error("Error during stock backfill:", error);
    console.error("\n❌ Error during stock backfill:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
backfillOrderStock();
