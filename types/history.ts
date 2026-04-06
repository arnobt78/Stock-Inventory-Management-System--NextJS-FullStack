/**
 * Import History (Admin History) types
 * Used for admin History list and detail pages; matches API and Prisma shape.
 */

export type ImportHistoryStatus = "processing" | "completed" | "failed";
export type ImportHistoryType =
  | "products"
  | "orders"
  | "suppliers"
  | "categories";

export type ImportHistoryErrorItem = {
  rowNumber: number;
  field?: string;
  message: string;
};

/** Single import history record as returned by API (dates as ISO strings) */
export type ImportHistoryForPage = {
  id: string;
  userId: string;
  importType: ImportHistoryType;
  fileName: string;
  fileSize: number;
  totalRows: number;
  successRows: number;
  failedRows: number;
  errors: ImportHistoryErrorItem[] | null;
  status: ImportHistoryStatus;
  createdAt: string;
  completedAt: string | null;
};
