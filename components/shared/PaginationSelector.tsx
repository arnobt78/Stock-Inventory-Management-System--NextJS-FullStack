"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Dispatch, SetStateAction, useState, useLayoutEffect } from "react";
import { ChevronDown } from "lucide-react";

// Define PaginationType locally
export interface PaginationType {
  pageIndex: number;
  pageSize: number;
}

export default function PaginationSelection({
  pagination,
  setPagination,
}: {
  pagination: PaginationType;
  setPagination: Dispatch<SetStateAction<PaginationType>>;
}) {
  const [mounted, setMounted] = useState(false);
  useLayoutEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      <div className="text-gray-700 dark:text-white/80 text-sm">Rows per page</div>
      {!mounted ? (
        <div
          className="border border-white/20 dark:border-white/20 bg-white/10 dark:bg-white/5 backdrop-blur-sm text-gray-700 dark:text-white/80 rounded-[28px] px-2 w-full sm:w-14 h-10 flex items-center justify-between gap-1"
          aria-hidden
        >
          <span>{pagination.pageSize}</span>
          <ChevronDown className="h-4 w-4 opacity-70" />
        </div>
      ) : (
        <Select
          value={pagination.pageSize.toString()}
          onValueChange={(value) =>
            setPagination((prev) => ({
              ...prev,
              pageSize: Number(value),
            }))
          }
        >
          <SelectTrigger className="border border-white/20 dark:border-white/20 bg-white/10 dark:bg-white/5 backdrop-blur-sm text-gray-700 dark:text-white/80 placeholder:text-white/40 focus:border-sky-400 focus:ring-sky-500/50 shadow-[0_10px_30px_rgba(2,132,199,0.15)] rounded-[28px] px-2 w-full sm:w-14 h-10">
            <SelectValue placeholder={pagination.pageSize.toString()} />
          </SelectTrigger>
          <SelectContent
            position="popper"
            sideOffset={5}
            className="rounded-[28px] border border-white/10 dark:border-white/10 bg-white/80 dark:bg-popover/50 backdrop-blur-sm"
          >
            {[4, 6, 8, 10, 15, 20, 30].map((size) => (
              <SelectItem
                key={size}
                value={size.toString()}
                className="text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white focus:bg-sky-100 dark:focus:bg-white/10 focus:text-gray-900 dark:focus:text-white"
              >
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
