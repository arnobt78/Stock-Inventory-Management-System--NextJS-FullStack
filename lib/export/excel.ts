/**
 * Excel Export Utilities
 * Centralized functions for exporting data to Excel format using ExcelJS
 */

import ExcelJS from "exceljs";

/**
 * Excel export configuration options
 */
export interface ExcelExportOptions {
  /**
   * Worksheet name
   */
  sheetName: string;
  /**
   * File name (without extension)
   */
  fileName: string;
  /**
   * Column definitions with headers and widths
   */
  columns: Array<{
    header: string;
    key: string;
    width: number;
  }>;
  /**
   * Data rows to export
   */
  data: Record<string, unknown>[];
  /**
   * Optional: Custom header row styling
   */
  headerStyle?: {
    font?: Partial<ExcelJS.Font>;
    fill?: Partial<ExcelJS.Fill>;
  };
}

/**
 * Default header row styling
 */
const defaultHeaderStyle: ExcelExportOptions["headerStyle"] = {
  font: { bold: true },
  fill: {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  },
};

/**
 * Export data to Excel file
 *
 * @param options - Export configuration options
 * @returns Promise<void> - Resolves when file is downloaded
 */
export async function exportToExcel(
  options: ExcelExportOptions
): Promise<void> {
  try {
    if (options.data.length === 0) {
      throw new Error("No data to export");
    }

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(options.sheetName);

    // Add column definitions
    worksheet.columns = options.columns;

    // Add data rows
    worksheet.addRows(options.data);

    // Style header row
    const headerStyle = options.headerStyle || defaultHeaderStyle;
    const headerRow = worksheet.getRow(1);
    if (headerStyle?.font) {
      headerRow.font = headerStyle.font;
    }
    if (headerStyle?.fill) {
      headerRow.fill = headerStyle.fill as ExcelJS.Fill;
    }

    // Generate Excel file buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Create blob and download
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${options.fileName}-${new Date().toISOString().split("T")[0]}.xlsx`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error(
      `Failed to export to Excel: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Export data to CSV format
 *
 * @param data - Data rows to export
 * @param columns - Column definitions (headers)
 * @param fileName - File name (without extension)
 * @returns void - Triggers CSV download
 */
export function exportToCSV(
  data: Record<string, unknown>[],
  columns: Array<{ header: string; key: string }>,
  fileName: string
): void {
  try {
    if (data.length === 0) {
      throw new Error("No data to export");
    }

    // Create CSV header row
    const headers = columns.map((col) => col.header).join(",");
    const csvRows: string[] = [headers];

    // Add data rows
    for (const row of data) {
      const values = columns.map((col) => {
        const value = row[col.key];
        // Handle values that contain commas, quotes, or newlines
        if (value === null || value === undefined) {
          return "";
        }
        const stringValue = String(value);
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (
          stringValue.includes(",") ||
          stringValue.includes('"') ||
          stringValue.includes("\n")
        ) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      });
      csvRows.push(values.join(","));
    }

    // Create CSV content
    const csvContent = csvRows.join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${fileName}-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error(
      `Failed to export to CSV: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
