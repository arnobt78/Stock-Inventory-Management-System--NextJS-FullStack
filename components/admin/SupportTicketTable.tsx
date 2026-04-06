/**
 * Support Ticket Table Component
 * Displays support tickets with sorting, pagination, and filtering
 */

"use client";

import React, { useMemo, useState, useLayoutEffect } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { PaginationType } from "@/components/shared/PaginationSelector";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GrFormPrevious, GrFormNext } from "react-icons/gr";
import { BiFirstPage, BiLastPage } from "react-icons/bi";
import { ChevronDown } from "lucide-react";
import type { SupportTicket } from "@/types";

interface SupportTicketTableProps {
  data: SupportTicket[];
  columns: ColumnDef<SupportTicket>[];
  isLoading: boolean;
  searchTerm: string;
  pagination: PaginationType;
  setPagination: (
    updater: PaginationType | ((old: PaginationType) => PaginationType),
  ) => void;
  selectedStatuses: string[];
  selectedPriorities: string[];
}

export const SupportTicketTable = React.memo(function SupportTicketTable({
  data,
  columns,
  isLoading,
  searchTerm,
  pagination,
  setPagination,
  selectedStatuses,
  selectedPriorities,
}: SupportTicketTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const filteredData = useMemo(() => {
    return data.filter((t) => {
      const searchMatch =
        !searchTerm ||
        t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch =
        selectedStatuses.length === 0 || selectedStatuses.includes(t.status);
      const priorityMatch =
        selectedPriorities.length === 0 ||
        selectedPriorities.includes(t.priority);
      return searchMatch && statusMatch && priorityMatch;
    });
  }, [data, searchTerm, selectedStatuses, selectedPriorities]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { pagination, sorting },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const [pageSizeSelectMounted, setPageSizeSelectMounted] = useState(false);
  useLayoutEffect(() => setPageSizeSelectMounted(true), []);

  return (
    <div className="poppins mt-0">
      {isLoading ? (
        <TableSkeleton rows={pagination.pageSize} columns={columns.length} />
      ) : (
        <>
          <div className="rounded-[28px] border border-violet-400/20 dark:border-white/10 shadow-[0_30px_80px_rgba(139,92,246,0.25)] dark:shadow-[0_30px_80px_rgba(139,92,246,0.15)] bg-gradient-to-br from-white/20 via-white/15 to-white/10 dark:from-white/5 dark:via-white/5 dark:to-white/5 backdrop-blur-sm overflow-hidden">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="bg-white/40 dark:bg-white/10"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row, index) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={
                        index % 2 === 0
                          ? "bg-white/30 dark:bg-white/5"
                          : "bg-white/20 dark:bg-white/10"
                      }
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center text-gray-900 dark:text-white"
                    >
                      No support tickets found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mt-4">
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                Rows per page
              </div>
              {!pageSizeSelectMounted ? (
                <div
                  className="h-10 rounded-[28px] border border-violet-400/30 dark:border-violet-400/30 bg-gradient-to-r from-violet-500/25 via-violet-500/15 to-violet-500/10 text-gray-700 dark:text-white px-2 w-16 sm:w-20 flex items-center justify-between font-medium"
                  aria-hidden
                >
                  <span>{pagination.pageSize}</span>
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </div>
              ) : (
                <Select
                  value={pagination.pageSize.toString()}
                  onValueChange={(v) =>
                    setPagination((prev) => ({
                      ...prev,
                      pageSize: Number(v),
                    }))
                  }
                >
                  <SelectTrigger className="h-10 rounded-[28px] border border-violet-400/30 dark:border-violet-400/30 bg-gradient-to-r from-violet-500/25 via-violet-500/15 to-violet-500/10 dark:from-violet-500/25 dark:via-violet-500/15 dark:to-violet-500/10 text-gray-700 dark:text-white shadow-[0_10px_30px_rgba(139,92,246,0.2)] font-medium px-2 w-16 sm:w-20">
                    <SelectValue placeholder={pagination.pageSize.toString()} />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    sideOffset={5}
                    className="rounded-[28px] border border-violet-400/20 dark:border-white/10 bg-white/80 dark:bg-popover/50 backdrop-blur-sm"
                  >
                    {[4, 6, 8, 10, 15, 20, 30].map((size) => (
                      <SelectItem
                        key={size}
                        value={size.toString()}
                        className="text-gray-700 dark:text-white/80 focus:bg-violet-100 dark:focus:bg-white/10 focus:text-gray-900 dark:focus:text-white"
                      >
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="flex items-center justify-center sm:justify-end gap-2 sm:gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="h-10 rounded-[28px] border border-violet-400/30 dark:border-violet-400/30 bg-gradient-to-r from-violet-500/25 via-violet-500/15 to-violet-500/10 text-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <BiFirstPage />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-10 rounded-[28px] border border-violet-400/30 dark:border-violet-400/30 bg-gradient-to-r from-violet-500/25 via-violet-500/15 to-violet-500/10 text-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <GrFormPrevious />
              </Button>
              <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                Page {pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-10 rounded-[28px] border border-violet-400/30 dark:border-violet-400/30 bg-gradient-to-r from-violet-500/25 via-violet-500/15 to-violet-500/10 text-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <GrFormNext />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="h-10 rounded-[28px] border border-violet-400/30 dark:border-violet-400/30 bg-gradient-to-r from-violet-500/25 via-violet-500/15 to-violet-500/10 text-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <BiLastPage />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
});
