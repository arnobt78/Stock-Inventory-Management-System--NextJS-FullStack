"use client";

import React, { type ReactNode } from "react";
import { cn } from "@/lib/utils";

const DEFAULT_CLASSES = "";

export interface PageContentWrapperProps {
  children: ReactNode;
  /** Optional extra classes; merged with default responsive padding (when noPadding is false) */
  className?: string;
  /** When true, no inner padding is applied (e.g. when layout already provides outer padding) */
  noPadding?: boolean;
}

/**
 * Wrapper for main page content under Navbar.
 * Applies consistent responsive padding (sm+: py-6)
 * so content does not touch viewport edges on mobile and has consistent spacing on sm/desktop.
 * Set noPadding to omit this inner padding.
 */
export function PageContentWrapper({
  children,
  className,
  noPadding = false,
}: PageContentWrapperProps) {
  return (
    <div className={cn(!noPadding && DEFAULT_CLASSES, className)}>
      {children}
    </div>
  );
}
