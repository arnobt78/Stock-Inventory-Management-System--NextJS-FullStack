/**
 * Import Validator Utilities
 * Functions for validating imported data against schemas
 */

import { z } from "zod";
import type { ParsedRow } from "./parser";

/**
 * Validation error for a single row
 */
export interface ValidationError {
  /**
   * Row number (1-indexed)
   */
  rowNumber: number;
  /**
   * Field that failed validation
   */
  field?: string;
  /**
   * Error message
   */
  message: string;
  /**
   * Raw row data
   */
  rowData: Record<string, unknown>;
}

/**
 * Validation result
 */
export interface ValidationResult {
  /**
   * Whether validation passed
   */
  valid: boolean;
  /**
   * Valid rows (after transformation)
   */
  validRows: unknown[];
  /**
   * Validation errors
   */
  errors: ValidationError[];
}

/**
 * Column mapping configuration
 * Maps import file columns to schema fields
 */
export interface ColumnMapping {
  /**
   * Import file column name
   */
  importColumn: string;
  /**
   * Schema field name
   */
  schemaField: string;
  /**
   * Optional transformation function
   */
  transform?: (value: string | number) => unknown;
}

/**
 * Validate and transform rows against a Zod schema
 *
 * @param rows - Parsed rows from import file
 * @param schema - Zod schema to validate against
 * @param columnMapping - Column mapping configuration
 * @returns ValidationResult - Validation result with valid rows and errors
 */
export function validateRows<T>(
  rows: ParsedRow[],
  schema: z.ZodSchema<T>,
  columnMapping: ColumnMapping[]
): ValidationResult {
  const validRows: T[] = [];
  const errors: ValidationError[] = [];

  // Filter out header row
  const dataRows = rows.filter((row) => !row.isHeader);

  for (const row of dataRows) {
    try {
      // Map columns according to mapping configuration
      const mappedData: Record<string, unknown> = {};
      for (const mapping of columnMapping) {
        const importValue = row.data[mapping.importColumn];
        if (importValue === undefined || importValue === null) {
          // Skip if column not found (optional fields)
          continue;
        }
        // Apply transformation if provided
        const transformedValue = mapping.transform
          ? mapping.transform(importValue)
          : importValue;
        mappedData[mapping.schemaField] = transformedValue;
      }

      // Validate against schema
      const validatedData = schema.parse(mappedData);
      validRows.push(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Zod validation error
        for (const issue of error.issues) {
          errors.push({
            rowNumber: row.rowNumber,
            field: issue.path.join("."),
            message: issue.message,
            rowData: row.data,
          });
        }
      } else {
        // Other error
        errors.push({
          rowNumber: row.rowNumber,
          message: error instanceof Error ? error.message : "Unknown error",
          rowData: row.data,
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    validRows,
    errors,
  };
}

/**
 * Common transformation functions for import data
 */
export const transformFunctions = {
  /**
   * Convert string to number
   */
  toNumber: (value: string | number): number => {
    if (typeof value === "number") return value;
    const num = Number(value);
    if (isNaN(num)) throw new Error(`Cannot convert "${value}" to number`);
    return num;
  },

  /**
   * Convert string to integer
   */
  toInteger: (value: string | number): number => {
    if (typeof value === "number") return Math.floor(value);
    const num = parseInt(String(value), 10);
    if (isNaN(num)) throw new Error(`Cannot convert "${value}" to integer`);
    return num;
  },

  /**
   * Convert string to boolean
   */
  toBoolean: (value: string | number | boolean): boolean => {
    if (typeof value === "boolean") return value;
    const str = String(value).toLowerCase().trim();
    return str === "true" || str === "1" || str === "yes" || str === "y";
  },

  /**
   * Trim string and convert empty to null
   */
  trimOrNull: (value: string | number): string | null => {
    const str = String(value).trim();
    return str === "" ? null : str;
  },
};
