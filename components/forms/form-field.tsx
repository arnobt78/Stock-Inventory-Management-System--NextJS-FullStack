/**
 * Reusable Form Field Component
 * Generic form field wrapper with label, input, and error display
 * Works with React Hook Form's useFormContext
 */

import React from "react";
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MdError } from "react-icons/md";
import { cn } from "@/lib/utils";

/**
 * Props for FormField component
 */
export interface FormFieldProps {
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
   * Input type (default: "text")
   */
  type?: string;
  /**
   * Custom error message (overrides schema error)
   */
  errorMessage?: string;
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
   * Whether to show the label (default: true)
   */
  showLabel?: boolean;
  /**
   * Custom input component (for special inputs like NumericFormat)
   */
  customInput?: React.ReactNode;
  /**
   * Additional input props
   */
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

/**
 * FormField Component
 * Reusable form field with consistent styling and error handling
 */
export function FormField({
  name,
  label,
  placeholder,
  type = "text",
  errorMessage,
  className = "",
  inputClassName = "",
  labelClassName = "text-slate-600",
  showLabel = true,
  customInput,
  inputProps = {},
}: FormFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const fieldError = errors[name];
  const displayError = errorMessage || fieldError?.message;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {showLabel && (
        <Label htmlFor={name} className={labelClassName}>
          {label}
        </Label>
      )}
      <div className="flex gap-2 items-center">
        {customInput ? (
          customInput
        ) : (
          <Input
            {...register(name)}
            type={type}
            id={name}
            className={cn("h-11 shadow-none", inputClassName)}
            placeholder={placeholder}
            {...inputProps}
          />
        )}
      </div>
      {displayError && (
        <div className="text-red-500 flex gap-1 items-center text-[13px]">
          <MdError />
          <p>{String(displayError)}</p>
        </div>
      )}
    </div>
  );
}

