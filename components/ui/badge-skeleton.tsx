/**
 * Badge Skeleton Component
 * Skeleton loading component that matches exact badge dimensions
 */

import React from "react";
import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";

/**
 * Props for BadgeSkeleton component
 */
interface BadgeSkeletonProps {
  /**
   * Width of the badge (default: "w-20")
   */
  width?: string;
  /**
   * Optional className
   */
  className?: string;
}

/**
 * BadgeSkeleton component
 * Displays a skeleton loader that matches badge dimensions
 */
export function BadgeSkeleton({
  width = "w-20",
  className,
}: BadgeSkeletonProps) {
  return (
    <Skeleton
      className={cn("h-6 rounded-full", width, className)}
    />
  );
}

