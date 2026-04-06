/**
 * Import History Detail API Route Handler
 * GET /api/import-history/:id — fetch single import history record
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { logger } from "@/lib/logger";
import { getImportHistoryById } from "@/prisma/import-history";
import { withRateLimit, defaultRateLimits } from "@/lib/api/rate-limit";
import type { ImportHistoryForPage, ImportHistoryErrorItem } from "@/types";
import type { Prisma } from "@prisma/client";

type ImportHistoryRecord = Prisma.ImportHistoryGetPayload<
  Record<string, never>
>;

function transformRecord(r: ImportHistoryRecord): ImportHistoryForPage {
  const raw = r.errors as unknown;
  const errors: ImportHistoryErrorItem[] | null = Array.isArray(raw)
    ? raw
    : null;
  return {
    id: r.id,
    userId: r.userId,
    importType: r.importType as ImportHistoryForPage["importType"],
    fileName: r.fileName,
    fileSize: r.fileSize,
    totalRows: r.totalRows,
    successRows: r.successRows,
    failedRows: r.failedRows,
    errors,
    status: r.status as ImportHistoryForPage["status"],
    createdAt: r.createdAt.toISOString(),
    completedAt: r.completedAt?.toISOString() ?? null,
  };
}

/**
 * GET /api/import-history/:id
 * Fetch a single import history record by ID (scoped to user).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const rateLimitResponse = await withRateLimit(
      request,
      defaultRateLimits.standard,
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.id;

    const record = await getImportHistoryById(id, userId);
    if (!record) {
      return NextResponse.json(
        { error: "Import history record not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(transformRecord(record));
  } catch (error) {
    logger.error("Error fetching import history detail:", error);
    return NextResponse.json(
      { error: "Failed to fetch import history record" },
      { status: 500 },
    );
  }
}
