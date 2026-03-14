import { prisma } from "@/prisma/client";
import { type StockMovement, StockMovementType } from "@prisma/client";

export class StockMovementService {
  /**
   * Record a new stock movement.
   */
  static async createMovement(data: {
    productId: string;
    movementType: StockMovementType;
    quantity: number;
    sourceWarehouseId?: string;
    destinationWarehouseId?: string;
    referenceType: string;
    referenceId?: string;
    notes?: string;
    userId: string;
  }): Promise<StockMovement> {
    // Basic validation
    if (data.movementType === StockMovementType.RECEIPT && data.quantity <= 0) {
      throw new Error("Receipt quantity must be positive.");
    }
    if (data.movementType === StockMovementType.DELIVERY && data.quantity >= 0) {
      throw new Error("Delivery quantity must be negative.");
    }
    if (data.movementType === StockMovementType.TRANSFER) {
      if (data.quantity <= 0) throw new Error("Transfer quantity must be positive.");
      if (!data.sourceWarehouseId || !data.destinationWarehouseId) {
        throw new Error("Transfers require both source and destination warehouses.");
      }
    }

    return await prisma.stockMovement.create({
      data: {
        productId: data.productId,
        movementType: data.movementType,
        quantity: data.quantity,
        sourceWarehouseId: data.sourceWarehouseId,
        destinationWarehouseId: data.destinationWarehouseId,
        referenceType: data.referenceType,
        referenceId: data.referenceId,
        notes: data.notes,
        userId: data.userId,
      },
      include: {
        product: { select: { name: true, sku: true } },
        sourceWarehouse: { select: { name: true } },
        destinationWarehouse: { select: { name: true } },
      },
    });
  }

  /**
   * Get all stock movements with filters.
   */
  static async getAllMovements(filters: {
    productId?: string;
    warehouseId?: string;
    movementType?: StockMovementType;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = {};

    if (filters.productId) {
      where.productId = filters.productId;
    }

    if (filters.warehouseId) {
      where.OR = [
        { sourceWarehouseId: filters.warehouseId },
        { destinationWarehouseId: filters.warehouseId },
      ];
    }

    if (filters.movementType) {
      where.movementType = filters.movementType;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    return await prisma.stockMovement.findMany({
      where,
      include: {
        product: { select: { name: true, sku: true } },
        sourceWarehouse: { select: { name: true } },
        destinationWarehouse: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
