import { prisma } from "@/prisma/client";
import { type Stock, StockMovementType } from "@prisma/client";
import { StockMovementService } from "@/modules/stock-movement/api/stock-movement.service";

/**
 * Service to handle all stock operations.
 */
export class StockService {
  /**
   * Get all stock records across all warehouses.
   */
  static async getAllStocks(): Promise<Stock[]> {
    return await prisma.stock.findMany({
      include: {
        product: { select: { name: true, sku: true } },
        warehouse: { select: { name: true, location: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  /**
   * Get stock records for a specific product across all warehouses.
   */
  static async getStockByProduct(productId: string): Promise<Stock[]> {
    return await prisma.stock.findMany({
      where: { productId },
      include: {
        warehouse: { select: { name: true, location: true } },
      },
    });
  }

  /**
   * Get all stock records in a specific warehouse.
   */
  static async getStockByWarehouse(warehouseId: string): Promise<Stock[]> {
    return await prisma.stock.findMany({
      where: { warehouseId },
      include: {
        product: { select: { name: true, sku: true } },
      },
    });
  }

  /**
   * Create a new stock record. Validates that it doesn't already exist.
   * Also logs a RECEIPT movement.
   */
  static async createStock(data: {
    productId: string;
    warehouseId: string;
    quantity: number;
    userId: string;
  }): Promise<Stock> {
    const existing = await prisma.stock.findUnique({
      where: {
        productId_warehouseId: {
          productId: data.productId,
          warehouseId: data.warehouseId,
        },
      },
    });

    if (existing) {
      throw new Error("Stock record already exists for this product in this warehouse.");
    }

    if (data.quantity < 0) {
      throw new Error("Initial stock quantity cannot be negative.");
    }

    const stock = await prisma.stock.create({
      data: {
        productId: data.productId,
        warehouseId: data.warehouseId,
        quantity: data.quantity,
        userId: data.userId,
      },
      include: {
        product: { select: { name: true, sku: true } },
        warehouse: { select: { name: true } },
      },
    });

    // Automatically log a movement if initial quantity > 0
    if (data.quantity > 0) {
      await StockMovementService.createMovement({
        productId: data.productId,
        movementType: StockMovementType.RECEIPT,
        quantity: data.quantity,
        destinationWarehouseId: data.warehouseId,
        referenceType: "Initial Stock",
        userId: data.userId,
      });
    }

    return stock;
  }

  /**
   * Update an existing stock record by ID.
   * Also logs a movement based on the quantity change.
   */
  static async updateStock(
    id: string,
    data: { quantity?: number; reservedQuantity?: number; userId: string; referenceType?: string; referenceId?: string },
  ): Promise<Stock> {
    const stock = await prisma.stock.findUnique({ 
        where: { id },
        include: { product: true }
    });
    
    if (!stock) {
      throw new Error("Stock record not found.");
    }

    // Business Logic: Real quantity cannot go below 0.
    const updatedQuantity = data.quantity ?? stock.quantity;
    if (updatedQuantity < 0) {
      throw new Error("Stock quantity cannot be less than zero.");
    }

    const diff = updatedQuantity - stock.quantity;

    const updatedStock = await prisma.stock.update({
      where: { id },
      data: {
        quantity: updatedQuantity,
        reservedQuantity: data.reservedQuantity ?? stock.reservedQuantity,
        updatedAt: new Date(),
      },
    });

    // Log movement if quantity changed
    if (diff !== 0) {
      await StockMovementService.createMovement({
        productId: stock.productId,
        movementType: diff > 0 ? StockMovementType.RECEIPT : StockMovementType.ADJUSTMENT,
        quantity: diff,
        destinationWarehouseId: diff > 0 ? stock.warehouseId : undefined,
        sourceWarehouseId: diff < 0 ? stock.warehouseId : undefined,
        referenceType: data.referenceType || "Stock Update",
        referenceId: data.referenceId,
        userId: data.userId,
      });
    }

    return updatedStock;
  }
}
