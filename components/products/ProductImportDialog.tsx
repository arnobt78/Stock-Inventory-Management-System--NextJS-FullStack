/**
 * Product Import Dialog Component
 * Dialog for importing products from CSV/Excel files
 */

"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateAllRelatedQueries } from "@/lib/react-query";

interface ProductImportDialogProps {
  /**
   * Whether the dialog is open
   */
  open?: boolean;
  /**
   * Callback when dialog open state changes
   */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Product Import Dialog
 * Allows users to upload CSV/Excel files to import products
 */
export function ProductImportDialog({
  open: controlledOpen,
  onOpenChange,
}: ProductImportDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    totalRows: number;
    successRows: number;
    failedRows: number;
    errors?: Array<{ rowNumber: number; field?: string; message: string }>;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Use controlled or internal state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  /**
   * Handle file selection
   */
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(fileExtension || "")) {
      toast({
        title: "Invalid File Type",
        description: "Please select a CSV or Excel file (.csv, .xlsx, .xls)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "File size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      // Create form data
      const formData = new FormData();
      formData.append("file", file);

      // Call import API
      const response = await fetch("/api/products/import", {
        method: "POST",
        body: formData,
        credentials: "include", // Include cookies for authentication
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Import failed");
      }

      setImportResult({
        success: true,
        totalRows: data.totalRows,
        successRows: data.successRows,
        failedRows: data.failedRows,
        errors: data.errors,
      });

      invalidateAllRelatedQueries(queryClient);

      toast({
        title: "Import Successful!",
        description: `Successfully imported ${data.successRows} of ${data.totalRows} products.`,
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Close dialog after a short delay if all rows succeeded
      if (data.failedRows === 0) {
        setTimeout(() => {
          setIsOpen(false);
        }, 2000);
      }
    } catch (error) {
      setImportResult({
        success: false,
        totalRows: 0,
        successRows: 0,
        failedRows: 0,
        errors: [
          {
            rowNumber: 0,
            message: error instanceof Error ? error.message : "Unknown error",
          },
        ],
      });

      toast({
        title: "Import Failed",
        description:
          error instanceof Error ? error.message : "Failed to import products",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  /**
   * Handle dialog open/close state changes
   * Allows opening, but prevents closing while importing
   */
  const handleOpenChange = (open: boolean) => {
    if (open) {
      // Allow opening the dialog
      setIsOpen(true);
    } else if (!isImporting) {
      // Only allow closing if not currently importing
      setIsOpen(false);
      setImportResult(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="h-10 rounded-[28px] border border-amber-400/30 dark:border-amber-400/30 bg-gradient-to-r from-amber-500/30 via-amber-500/15 to-amber-500/5 dark:from-amber-500/30 dark:via-amber-500/15 dark:to-amber-500/5 text-gray-700 dark:text-white shadow-[0_10px_30px_rgba(245,158,11,0.2)] backdrop-blur-sm transition duration-200 hover:border-amber-300/60 hover:from-amber-500/35 hover:via-amber-500/25 hover:to-amber-500/15 dark:hover:border-amber-300/60 dark:hover:from-amber-500/35 dark:hover:via-amber-500/25 dark:hover:to-amber-500/15"
        >
          <Upload className="h-4 w-4" />
          Import Products
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Products</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file to import products. The file should
            include columns: Product Name, SKU, Price, Quantity, Status,
            Category, Supplier.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Input */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-violet-400/30 dark:border-violet-400/30 rounded-lg cursor-pointer bg-violet-500/10 dark:bg-violet-500/5 hover:bg-violet-500/20 dark:hover:bg-violet-500/10 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {isImporting ? (
                  <Loader2 className="w-8 h-8 mb-2 text-violet-500 animate-spin" />
                ) : (
                  <Upload className="w-8 h-8 mb-2 text-violet-500" />
                )}
                <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">
                    {isImporting ? "Importing..." : "Click to upload"}
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  CSV or Excel (MAX. 10MB)
                </p>
              </div>
              <input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                disabled={isImporting}
              />
            </label>
          </div>

          {/* Import Result */}
          {importResult && (
            <div
              className={`p-4 rounded-lg border ${
                importResult.success && importResult.failedRows === 0
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                  : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="font-semibold">Import Summary</span>
                </div>
                <div className="text-sm space-y-1">
                  <p>
                    Total Rows: <strong>{importResult.totalRows}</strong>
                  </p>
                  <p className="text-green-600 dark:text-green-400">
                    Successful: <strong>{importResult.successRows}</strong>
                  </p>
                  {importResult.failedRows > 0 && (
                    <p className="text-red-600 dark:text-red-400">
                      Failed: <strong>{importResult.failedRows}</strong>
                    </p>
                  )}
                </div>
                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="mt-2 max-h-32 overflow-y-auto">
                    <p className="text-xs font-semibold mb-1">Errors:</p>
                    <ul className="text-xs space-y-1 list-disc list-inside">
                      {importResult.errors.slice(0, 5).map((error, index) => (
                        <li
                          key={index}
                          className="text-red-600 dark:text-red-400"
                        >
                          Row {error.rowNumber}: {error.message}
                        </li>
                      ))}
                      {importResult.errors.length > 5 && (
                        <li className="text-gray-500">
                          ... and {importResult.errors.length - 5} more errors
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isImporting}
          >
            {importResult ? "Close" : "Cancel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
