
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Product } from "@/app/types";
import { useAuth } from "../authContext";
import { useRouter } from "next/navigation";
import Skeleton from "@/components/Skeleton"; // Skeleton component for loading state
import PaginationSelection, { PaginationType } from "./PaginationSelection";
import { Button } from "@/components/ui/button";
import { GrFormPrevious, GrFormNext } from "react-icons/gr";
import { LuGitPullRequestDraft } from "react-icons/lu";
import { IoMdClose } from "react-icons/io";
import { BiFirstPage, BiLastPage } from "react-icons/bi";
import { FaCheck } from "react-icons/fa";

interface DataTableProps<TData, TValue> {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  userId: string;
  isLoading: boolean;
  searchTerm: string;
  pagination: PaginationType;
  setPagination: (
    updater: PaginationType | ((old: PaginationType) => PaginationType)
  ) => void;
  selectedCategory: string[];
  selectedStatuses: string[];
  selectedSuppliers: string[];
}

// Function to return color based on status
function returnColor(status: string) {
  switch (status) {
    case "Available":
      return "text-green-600 bg-green-100";
    case "Stock Out":
      return "text-red-600 bg-red-100";
    case "Stock Low":
      return "text-orange-600 bg-orange-100";
    default:
      return "";
  }
}

// Function to return icon based on status
function returnIcon(status: string) {
  switch (status) {
    case "Available":
      return <FaCheck />;
    case "Stock Out":
      return <IoMdClose />;
    case "Stock Low":
      return <LuGitPullRequestDraft />;
    default:
      return null;
  }
}

export const ProductTable = React.memo(function ProductTable({
  data,
  columns,
  userId,
  isLoading,
  searchTerm,
  pagination,
  setPagination,
  selectedCategory,
  selectedStatuses,
  selectedSuppliers,
}: DataTableProps<Product, unknown>) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login");
    }
  }, [isLoggedIn, router]);

  const filteredData = useMemo(() => {
    // Debug log - only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log("Search term:", searchTerm);
      console.log("Data length:", data.length);
    }

    const filtered = data.filter((product) => {
      // Search term filtering
      const searchMatch = !searchTerm ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase());

      const categoryMatch =
        selectedCategory.length === 0 ||
        selectedCategory.includes(product.categoryId ?? "");

      const supplierMatch =
        selectedSuppliers.length === 0 ||
        selectedSuppliers.includes(product.supplierId ?? "");

      const statusMatch =
        selectedStatuses.length === 0 ||
        selectedStatuses.includes(product.status ?? "");

      return searchMatch && categoryMatch && supplierMatch && statusMatch;
    });

    // Debug log - only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log("Filtered data length:", filtered.length);
    }

    return filtered;
  }, [data, searchTerm, selectedCategory, selectedSuppliers, selectedStatuses]);

  const table = useReactTable({
    data: filteredData || [],
    columns,
    state: {
      pagination,
      sorting,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="poppins">
      {/* Show Skeleton while loading */}
      {isLoading ? (
        <Skeleton rows={5} columns={columns.length} />
      ) : (
        <>
          <div className="rounded-md border shadow-sm">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableCell key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col items-center mt-4 space-y-2 lg:hidden">
            <PaginationSelection
              pagination={pagination}
              setPagination={setPagination}
            />
          </div>

          {/* Pagination Buttons */}
          <div className="flex justify-center items-center space-x-4 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <BiFirstPage />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <GrFormPrevious />
            </Button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Page {pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <GrFormNext />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <BiLastPage />
            </Button>
          </div>
        </>
      )}
    </div>
  );
});
