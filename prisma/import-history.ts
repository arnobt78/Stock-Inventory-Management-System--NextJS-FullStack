/**
 * Import History Prisma Utilities
 * Helper functions for import history database operations
 */

import { prisma } from "@/prisma/client";
import { logger } from "@/lib/logger";
import type { Prisma } from "@prisma/client";

/**
 * Import history creation input
 */
export interface CreateImportHistoryInput {
  userId: string;
  importType: "products" | "orders" | "suppliers" | "categories";
  fileName: string;
  fileSize: number;
  totalRows: number;
  successRows: number;
  failedRows: number;
  errors?: Array<{
    rowNumber: number;
    field?: string;
    message: string;
  }>;
  status?: "processing" | "completed" | "failed";
}

/**
 * Create a new import history record
 *
 * @param data - Import history data
 * @returns Promise<ImportHistory> - Created import history record
 */
export async function createImportHistory(
  data: CreateImportHistoryInput
): Promise<Prisma.ImportHistoryGetPayload<Record<string, never>>> {
  return prisma.importHistory.create({
    data: {
      userId: data.userId,
      importType: data.importType,
      fileName: data.fileName,
      fileSize: data.fileSize,
      totalRows: data.totalRows,
      successRows: data.successRows,
      failedRows: data.failedRows,
      errors: data.errors
        ? (JSON.parse(JSON.stringify(data.errors)) as Prisma.InputJsonValue)
        : null,
      status: data.status || "processing",
    },
  });
}

/**
 * Update import history record
 *
 * @param id - Import history ID
 * @param data - Update data
 * @returns Promise<ImportHistory> - Updated import history record
 */
export async function updateImportHistory(
  id: string,
  data: {
    successRows?: number;
    failedRows?: number;
    errors?: Array<{
      rowNumber: number;
      field?: string;
      message: string;
    }>;
    status?: "processing" | "completed" | "failed";
  }
): Promise<Prisma.ImportHistoryGetPayload<Record<string, never>>> {
  return prisma.importHistory.update({
    where: { id },
    data: {
      successRows: data.successRows,
      failedRows: data.failedRows,
      errors: data.errors
        ? (JSON.parse(JSON.stringify(data.errors)) as Prisma.InputJsonValue)
        : undefined,
      status: data.status,
      completedAt:
        data.status === "completed" || data.status === "failed"
          ? new Date()
          : undefined,
    },
  });
}

/**
 * Get import history for a user
 *
 * @param userId - User ID
 * @param importType - Optional filter by import type
 * @param limit - Maximum number of records to return
 * @returns Promise<ImportHistory[]> - Array of import history records
 */
export async function getImportHistoryByUser(
  userId: string,
  importType?: "products" | "orders" | "suppliers" | "categories",
  limit = 50
): Promise<Prisma.ImportHistoryGetPayload<Record<string, never>>[]> {
  const where: Prisma.ImportHistoryWhereInput = {
    userId,
    ...(importType && { importType }),
  };

  return prisma.importHistory.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });
}

/**
 * Get a single import history record by ID
 *
 * @param id - Import history ID
 * @param userId - User ID (for authorization)
 * @returns Promise<ImportHistory | null> - Import history record or null
 */
export async function getImportHistoryById(
  id: string,
  userId: string
): Promise<Prisma.ImportHistoryGetPayload<Record<string, never>> | null> {
  return prisma.importHistory.findFirst({
    where: {
      id,
      userId,
    },
  });
}
