/**
 * Table Skeleton Component
 * Central table loading skeleton: neutral muted pulse, consistent column count.
 * Used by all TanStack table pages (products, orders, invoices, etc.).
 */

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";

/** Max skeleton columns so tables don't show an overly wide skeleton */
const MAX_SKELETON_COLUMNS = 6;

/**
 * Props for TableSkeleton component
 */
interface TableSkeletonProps {
  /**
   * Number of rows to display (default: 8)
   */
  rows?: number;
  /**
   * Number of columns (capped at MAX_SKELETON_COLUMNS for consistency)
   */
  columns: number;
  /**
   * Optional className for the table container
   */
  className?: string;
}

/**
 * TableSkeleton component
 * Same look on every page: muted pulse, sensible column count, rounded border.
 */
export function TableSkeleton({
  rows = 8,
  columns,
  className = "",
}: TableSkeletonProps) {
  const colCount = Math.min(columns, MAX_SKELETON_COLUMNS);
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card/50 shadow-sm",
        className,
      )}
    >
      <Table>
        <TableHeader>
          <TableRow className="border-border bg-muted/30">
            {Array.from({ length: colCount }).map((_, index) => (
              <TableHead key={index} className="h-10 px-4">
                <Skeleton className="h-4 w-20" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex} className="border-border">
              {Array.from({ length: colCount }).map((_, colIndex) => (
                <TableCell key={colIndex} className="p-4">
                  <Skeleton className="h-4 w-full min-w-[60px]" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

