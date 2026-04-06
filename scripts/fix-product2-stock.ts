/**
 * Script to fix Product2 stock discrepancy
 * This script adds 5 units back to Product2 to correct the stock level
 * 
 * Usage: npx tsx scripts/fix-product2-stock.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Simple logger for script
const logger = {
  info: (message: string, ...args: unknown[]) => console.log(`ℹ️  ${message}`, ...args),
  warn: (message: string, ...args: unknown[]) => console.warn(`⚠️  ${message}`, ...args),
  error: (message: string, ...args: unknown[]) => console.error(`❌ ${message}`, ...args),
  success: (message: string, ...args: unknown[]) => console.log(`✅ ${message}`, ...args),
};

async function fixProduct2Stock() {
  try {
    const productSku = "SK56"; // Product2 SKU
    const adjustment = 5; // Missing units

    logger.info(`Fixing stock for Product2 (SKU: ${productSku})...`);

    // Find Product2
    const product = await prisma.product.findUnique({
      where: { sku: productSku },
      select: {
        id: true,
        name: true,
        sku: true,
        quantity: true,
      },
    });

    if (!product) {
      logger.error(`Product with SKU ${productSku} not found!`);
      process.exit(1);
    }

    const currentStock = Number(product.quantity);
    const newStock = currentStock + adjustment;

    logger.info(`Current stock: ${currentStock} units`);
    logger.info(`Adding ${adjustment} units to correct the discrepancy`);
    logger.info(`New stock will be: ${newStock} units`);

    // Update stock
    await prisma.product.update({
      where: { id: product.id },
      data: {
        quantity: {
          increment: adjustment,
        },
      },
    });

    // Verify update
    const updatedProduct = await prisma.product.findUnique({
      where: { id: product.id },
      select: {
        quantity: true,
      },
    });

    if (updatedProduct && Number(updatedProduct.quantity) === newStock) {
      logger.success(`\n✅ Stock fixed successfully!`);
      logger.info(`   Product: ${product.name} (SKU: ${product.sku})`);
      logger.info(`   Stock: ${currentStock} → ${newStock} units\n`);
    } else {
      logger.error("Failed to verify stock update!");
      process.exit(1);
    }

  } catch (error) {
    logger.error("Error fixing stock:", error);
    console.error("\n❌ Error fixing stock:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixProduct2Stock();
