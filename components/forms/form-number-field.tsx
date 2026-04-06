/**
 * Reusable Form Number Field Component
 * Number input field with formatting support (using react-number-format)
 * Works with React Hook Form's useFormContext
 */

import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MdError } from "react-icons/md";
import { NumericFormat } from "react-number-format";
import { cn } from "@/lib/utils";

/**
 * Props for FormNumberField component
 */
export interface FormNumberFieldProps {
  /**
   * Field name (must match form schema)
   */
  name: string;
  /**
   * Label text
   */
  label: string;
  /**
   * Input placeholder text
   */
  placeholder?: string;
  /**
   * Optional className for the container
   */
  className?: string;
  /**
   * Optional className for the input
   */
  inputClassName?: string;
  /**
   * Optional className for the label
   */
  labelClassName?: string;
  /**
   * Whether to show thousand separator (default: true)
   */
  thousandSeparator?: boolean;
  /**
   * Decimal scale (number of decimal places, default: 2)
   */
  decimalScale?: number;
  /**
   * Whether to allow negative values (default: false)
   */
  allowNegative?: boolean;
  /**
   * Custom error message (overrides schema error)
   */
  errorMessage?: string;
}

/**
 * FormNumberField Component
 * Reusable number input field with formatting and validation
 */
export function FormNumberField({
  name,
  label,
  placeholder,
  className = "",
  inputClassName = "h-11",
  labelClassName = "text-slate-600",
  thousandSeparator = true,
  decimalScale = 2,
  allowNegative = false,
  errorMessage,
}: FormNumberFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const fieldError = errors[name];
  const displayError = errorMessage || fieldError?.message;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={name} className={labelClassName}>
        {label}
      </Label>
      <Controller
        name={name}
        control={control}
        defaultValue=""
        render={({ field: { onChange, value, ...field } }) => (
          <NumericFormat
            {...field}
            value={value}
            customInput={Input}
            thousandSeparator={thousandSeparator}
            placeholder={placeholder}
            className={inputClassName}
            decimalScale={decimalScale}
            allowNegative={allowNegative}
            onValueChange={(values) => {
              const { floatValue, value: stringValue } = values;
              // If the input is empty (value is empty string), pass empty string
              // Otherwise pass the float value
              onChange(stringValue === "" ? "" : floatValue ?? 0);
            }}
          />
        )}
      />
      {displayError && (
        <div className="text-red-500 flex gap-1 items-center text-[13px]">
          <MdError />
          <p>{String(displayError)}</p>
        </div>
      )}
    </div>
  );
}

