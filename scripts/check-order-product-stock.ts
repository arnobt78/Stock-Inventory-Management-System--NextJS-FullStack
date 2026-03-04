/**
 * Diagnostic script to check order and product stock consistency
 * Shows all orders, products, and calculates expected vs actual stock levels
 * 
 * Usage: npx tsx scripts/check-order-product-stock.ts
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

async function checkOrderProductStock() {
  try {
    console.log("\n🔍 Checking Order and Product Stock Consistency...\n");
    console.log("=" .repeat(80));

    // Get all products
    logger.info("📦 PRODUCTS:");
    console.log("-".repeat(80));
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        quantity: true,
        price: true,
        status: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    for (const product of products) {
      console.log(`\n  Product: ${product.name} (SKU: ${product.sku})`);
      console.log(`    - ID: ${product.id}`);
      console.log(`    - Current Stock: ${Number(product.quantity)} units`);
      console.log(`    - Price: $${Number(product.price).toFixed(2)}`);
      console.log(`    - Status: ${product.status}`);
    }

    // Get all orders with their items
    logger.info("\n📋 ORDERS:");
    console.log("-".repeat(80));
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                quantity: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (orders.length === 0) {
      logger.warn("No orders found in database");
    } else {
      for (const order of orders) {
        const isConfirmedOrPaid =
          order.status === "confirmed" ||
          order.status === "processing" ||
          order.status === "shipped" ||
          order.status === "delivered" ||
          order.paymentStatus === "paid";

        const statusIcon = order.status === "cancelled" ? "❌" : isConfirmedOrPaid ? "✅" : "⏳";
        
        console.log(`\n  ${statusIcon} Order: ${order.orderNumber}`);
        console.log(`    - ID: ${order.id}`);
        console.log(`    - Status: ${order.status}`);
        console.log(`    - Payment Status: ${order.paymentStatus}`);
        console.log(`    - Created: ${order.createdAt.toISOString()}`);
        console.log(`    - Updated: ${order.updatedAt?.toISOString() || "N/A"}`);
        console.log(`    - Cancelled: ${order.cancelledAt?.toISOString() || "No"}`);
        console.log(`    - Total: $${order.total.toFixed(2)}`);
        console.log(`    - Items (${order.items.length}):`);

        for (const item of order.items) {
          const productName = item.product?.name || "Unknown Product";
          const productSku = item.product?.sku || "N/A";
          const productStock = item.product ? Number(item.product.quantity) : "N/A";
          
          console.log(`      • ${item.quantity}x ${productName} (SKU: ${productSku})`);
          console.log(`        - Item ID: ${item.id}`);
          console.log(`        - Product ID: ${item.productId}`);
          console.log(`        - Unit Price: $${item.price.toFixed(2)}`);
          console.log(`        - Subtotal: $${item.subtotal.toFixed(2)}`);
          console.log(`        - Product Current Stock: ${productStock}`);
        }
      }
    }

    // Calculate stock discrepancies
    logger.info("\n📊 STOCK ANALYSIS:");
    console.log("-".repeat(80));

    // Build a map of product ID -> expected stock reduction from confirmed/paid orders
    const stockReductionMap = new Map<string, number>();
    const allOrdersMap = new Map<string, number>();

    for (const order of orders) {
      const isConfirmedOrPaid =
        order.status === "confirmed" ||
        order.status === "processing" ||
        order.status === "shipped" ||
        order.status === "delivered" ||
        order.paymentStatus === "paid";

      const isCancelled = order.status === "cancelled";

      for (const item of order.items) {
        const productId = item.productId;
        const qty = item.quantity;

        // Track all orders (for reference)
        allOrdersMap.set(
          productId,
          (allOrdersMap.get(productId) || 0) + qty
        );

        // Only count confirmed/paid orders for stock reduction (unless cancelled)
        if (isConfirmedOrPaid && !isCancelled) {
          stockReductionMap.set(
            productId,
            (stockReductionMap.get(productId) || 0) + qty
          );
        }

        // If order is cancelled but was previously confirmed/paid, stock should be restored
        // (This is already handled by the system, but we track it for reference)
        if (isCancelled && isConfirmedOrPaid) {
          stockReductionMap.set(
            productId,
            (stockReductionMap.get(productId) || 0) - qty
          );
        }
      }
    }

    // Calculate expected vs actual stock for each product
    console.log("\n  Stock Calculation Summary:\n");

    for (const product of products) {
      const productId = product.id;
      const currentStock = Number(product.quantity);
      const expectedReduction = stockReductionMap.get(productId) || 0;
      const totalOrderedInAllOrders = allOrdersMap.get(productId) || 0;

      // Find all order items for this product
      const productOrderItems = orders.flatMap(order => 
        order.items
          .filter(item => item.productId === productId)
          .map(item => ({
            orderNumber: order.orderNumber,
            orderStatus: order.status,
            paymentStatus: order.paymentStatus,
            quantity: item.quantity,
            isConfirmedOrPaid: 
              order.status === "confirmed" ||
              order.status === "processing" ||
              order.status === "shipped" ||
              order.status === "delivered" ||
              order.paymentStatus === "paid",
            isCancelled: order.status === "cancelled",
          }))
      );

      console.log(`  Product: ${product.name} (SKU: ${product.sku})`);
      console.log(`    - Current Stock: ${currentStock} units`);
      console.log(`    - Expected Reduction from Confirmed/Paid Orders: ${expectedReduction} units`);
      console.log(`    - Total Ordered (All Orders): ${totalOrderedInAllOrders} units`);
      console.log(`    - Order Items:`);

      if (productOrderItems.length === 0) {
        console.log(`      • No orders found for this product`);
      } else {
        for (const item of productOrderItems) {
          const statusIcon = item.isCancelled 
            ? "❌" 
            : item.isConfirmedOrPaid 
              ? "✅" 
              : "⏳";
          console.log(
            `      ${statusIcon} ${item.orderNumber}: ${item.quantity} units (Status: ${item.orderStatus}, Payment: ${item.paymentStatus})`
          );
        }
      }

      console.log("");
    }

    // Summary
    logger.info("📈 SUMMARY:");
    console.log("-".repeat(80));
    console.log(`  Total Products: ${products.length}`);
    console.log(`  Total Orders: ${orders.length}`);
    console.log(`  Confirmed/Paid Orders: ${orders.filter(o => {
      return (o.status === "confirmed" || o.status === "processing" || o.status === "shipped" || o.status === "delivered" || o.paymentStatus === "paid") && o.status !== "cancelled";
    }).length}`);
    console.log(`  Pending Orders: ${orders.filter(o => o.status === "pending" && o.paymentStatus === "unpaid").length}`);
    console.log(`  Cancelled Orders: ${orders.filter(o => o.status === "cancelled").length}`);

    logger.success("\n✅ Analysis complete!\n");

  } catch (error) {
    logger.error("Error during analysis:", error);
    console.error("\n❌ Error during analysis:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the analysis
checkOrderProductStock();
