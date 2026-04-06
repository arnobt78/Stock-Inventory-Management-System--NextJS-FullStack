/**
 * Audit Log Prisma helpers
 */

import { prisma } from "@/prisma/client";
import type { CreateAuditLogInput, AuditLogFilters } from "@/types";

const MAX_AUDIT_LOGS = 50;

/**
 * Create an audit log entry. Enforces FIFO: if total count > MAX_AUDIT_LOGS, deletes oldest.
 */
export async function createAuditLog(data: CreateAuditLogInput) {
  const created = await prisma.auditLog.create({
    data: {
      userId: data.userId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      details: data.details as object | undefined,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      createdAt: new Date(),
    },
  });

  const total = await prisma.auditLog.count();
  if (total > MAX_AUDIT_LOGS) {
    const toDelete = total - MAX_AUDIT_LOGS;
    const oldest = await prisma.auditLog.findMany({
      orderBy: { createdAt: "asc" },
      take: toDelete,
      select: { id: true },
    });
    if (oldest.length > 0) {
      await prisma.auditLog.deleteMany({
        where: { id: { in: oldest.map((o) => o.id) } },
      });
    }
  }

  return created;
}

/**
 * Get audit logs with filtering and pagination
 */
export async function getAuditLogs(
  filters: AuditLogFilters & { page?: number; limit?: number },
) {
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (filters.userId) {
    where.userId = filters.userId;
  }
  if (filters.action) {
    where.action = filters.action;
  }
  if (filters.entityType) {
    where.entityType = filters.entityType;
  }
  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) {
      (where.createdAt as Record<string, Date>).gte = new Date(
        filters.startDate,
      );
    }
    if (filters.endDate) {
      (where.createdAt as Record<string, Date>).lte = new Date(filters.endDate);
    }
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get audit logs for a specific user
 */
export async function getAuditLogsByUser(userId: string, limit = 20) {
  return prisma.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Get audit logs for a specific entity
 */
export async function getAuditLogsByEntity(
  entityType: string,
  entityId: string,
  limit = 20,
) {
  return prisma.auditLog.findMany({
    where: { entityType, entityId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export type ActivityLogPeriod = "today" | "7days" | "month";

/**
 * Get audit logs for activity history page with date filter.
 * When userId is provided, only returns logs for that user (self / product owner).
 */
export async function getAuditLogsForActivity(
  period: ActivityLogPeriod = "7days",
  userId?: string,
) {
  const now = new Date();
  let start: Date;
  switch (period) {
    case "today":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "7days":
      start = new Date(now);
      start.setDate(start.getDate() - 7);
      break;
    case "month":
      start = new Date(now);
      start.setMonth(start.getMonth() - 1);
      break;
    default:
      start = new Date(now);
      start.setDate(start.getDate() - 7);
  }

  const where: { createdAt: { gte: Date }; userId?: string } = {
    createdAt: { gte: start },
  };
  if (userId) {
    where.userId = userId;
  }

  return prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: MAX_AUDIT_LOGS,
  });
}

/**
 * Delete old audit logs (for cleanup/archival)
 */
export async function deleteOldAuditLogs(olderThanDays: number) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  return prisma.auditLog.deleteMany({
    where: {
      createdAt: { lt: cutoffDate },
    },
  });
}

/**
 * Helper to log actions from request context
 */
export async function logAction(
  userId: string,
  action: CreateAuditLogInput["action"],
  entityType: CreateAuditLogInput["entityType"],
  entityId?: string,
  details?: Record<string, unknown>,
  request?: Request,
) {
  const ipAddress =
    request?.headers.get("x-forwarded-for")?.split(",")[0] ||
    request?.headers.get("x-real-ip") ||
    undefined;
  const userAgent = request?.headers.get("user-agent") || undefined;

  return createAuditLog({
    userId,
    action,
    entityType,
    entityId,
    details,
    ipAddress,
    userAgent,
  });
}
