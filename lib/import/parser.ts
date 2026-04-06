/**
 * Import Parser Utilities
 * Functions for parsing CSV and Excel files for data import
 */

import ExcelJS from "exceljs";

/**
 * Supported file types for import
 */
export type ImportFileType = "csv" | "excel" | "xlsx";

/**
 * Parsed row data from import file
 */
export interface ParsedRow {
  /**
   * Row number (1-indexed, including header)
   */
  rowNumber: number;
  /**
   * Row data as key-value pairs
   */
  data: Record<string, string | number>;
  /**
   * Whether this is the header row
   */
  isHeader: boolean;
}

/**
 * Parse CSV file content
 *
 * @param fileContent - CSV file content as string
 * @returns Promise<ParsedRow[]> - Array of parsed rows
 */
export async function parseCSV(fileContent: string): Promise<ParsedRow[]> {
  const lines = fileContent
    .split("\n")
    .filter((line) => line.trim().length > 0);
  if (lines.length === 0) {
    throw new Error("CSV file is empty");
  }

  // Parse header row
  const firstLine = lines[0];
  if (!firstLine) {
    throw new Error("CSV file has no header row");
  }
  const headers = parseCSVLine(firstLine);
  const rows: ParsedRow[] = [
    {
      rowNumber: 1,
      data: Object.fromEntries(headers.map((h, i) => [h, String(i)])),
      isHeader: true,
    },
  ];

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const values = parseCSVLine(line);
    if (values.length !== headers.length) {
      throw new Error(
        `Row ${i + 1} has ${values.length} columns, expected ${headers.length}`
      );
    }
    const rowData: Record<string, string | number> = {};
    headers.forEach((h, idx) => {
      const value = values[idx];
      if (value !== undefined) {
        rowData[h] = value;
      }
    });
    rows.push({
      rowNumber: i + 1,
      data: rowData,
      isHeader: false,
    });
  }

  return rows;
}

/**
 * Parse a single CSV line, handling quoted values
 *
 * @param line - CSV line to parse
 * @returns string[] - Array of parsed values
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      // End of value
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  // Add last value
  values.push(current.trim());

  return values;
}

/**
 * Parse Excel file (XLSX)
 *
 * @param fileBuffer - Excel file buffer
 * @param sheetIndex - Sheet index to parse (default: 0)
 * @returns Promise<ParsedRow[]> - Array of parsed rows
 */
export async function parseExcel(
  fileBuffer: Buffer | ArrayBuffer,
  sheetIndex = 0
): Promise<ParsedRow[]> {
  // Convert ArrayBuffer to Buffer if needed
  // ExcelJS.load accepts Buffer or ArrayBuffer
  const workbook = new ExcelJS.Workbook();
  // Use type assertion to satisfy ExcelJS type requirements (Buffer | ArrayBuffer)
  await workbook.xlsx.load(fileBuffer as ArrayBuffer);

  if (workbook.worksheets.length === 0) {
    throw new Error("Excel file has no worksheets");
  }

  const worksheet = workbook.worksheets[sheetIndex];
  if (!worksheet) {
    throw new Error(`Worksheet at index ${sheetIndex} not found`);
  }

  const rows: ParsedRow[] = [];
  let headerRow: string[] | null = null;

  worksheet.eachRow((row, rowNumber) => {
    const values: (string | number)[] = [];
    row.eachCell({ includeEmpty: true }, (cell) => {
      // Get cell value, handling different types
      let value: string | number = "";
      if (cell.value !== null && cell.value !== undefined) {
        if (typeof cell.value === "object" && "text" in cell.value) {
          // Rich text
          value = (cell.value as { text: string }).text;
        } else if (typeof cell.value === "object" && "result" in cell.value) {
          // Formula result
          value = String((cell.value as { result: number | string }).result);
        } else {
          value = cell.value as string | number;
        }
      }
      values.push(value);
    });

    if (rowNumber === 1) {
      // Header row
      headerRow = values.map((v) => String(v));
      rows.push({
        rowNumber: 1,
        data: Object.fromEntries(headerRow.map((h, i) => [h, i])),
        isHeader: true,
      });
    } else if (headerRow) {
      // Data row
      const rowData: Record<string, string | number> = {};
      headerRow.forEach((header, index) => {
        rowData[header] = values[index] ?? "";
      });
      rows.push({
        rowNumber,
        data: rowData,
        isHeader: false,
      });
    }
  });

  if (rows.length === 0) {
    throw new Error("Excel file is empty");
  }

  return rows;
}

/**
 * Detect file type from file name
 *
 * @param fileName - File name
 * @returns ImportFileType - Detected file type
 */
export function detectFileType(fileName: string): ImportFileType {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (extension === "csv") {
    return "csv";
  }
  if (extension === "xlsx" || extension === "xls") {
    return "excel";
  }
  throw new Error(`Unsupported file type: ${extension}`);
}

/**
 * Parse file based on type
 *
 * @param file - File object
 * @returns Promise<ParsedRow[]> - Array of parsed rows
 */
export async function parseFile(file: File): Promise<ParsedRow[]> {
  const fileType = detectFileType(file.name);

  if (fileType === "csv") {
    const text = await file.text();
    return parseCSV(text);
  } else {
    const arrayBuffer = await file.arrayBuffer();
    return parseExcel(arrayBuffer);
  }
}
