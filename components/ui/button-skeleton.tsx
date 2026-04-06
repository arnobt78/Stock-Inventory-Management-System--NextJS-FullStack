/**
 * Button Skeleton Component
 * Skeleton loading component that matches exact button dimensions
 */

import React from "react";
import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";

/**
 * Props for ButtonSkeleton component
 */
interface ButtonSkeletonProps {
  /**
   * Size variant (default: "default")
   */
  size?: "sm" | "default" | "lg" | "icon";
  /**
   * Optional className
   */
  className?: string;
}

/**
 * ButtonSkeleton component
 * Displays a skeleton loader that matches button dimensions
 */
export function ButtonSkeleton({
  size = "default",
  className,
}: ButtonSkeletonProps) {
  const sizeClasses = {
    sm: "h-8 w-20",
    default: "h-9 w-24",
    lg: "h-10 w-32",
    icon: "h-9 w-9",
  };

  return (
    <Skeleton
      className={cn("rounded-md", sizeClasses[size], className)}
    />
  );
}

