"use client";

import React, { type ReactNode } from "react";
import { ResponsiveContainer } from "recharts";

/**
 * Wraps recharts in a container with responsive height for mobile-friendly charts.
 * Use instead of raw ResponsiveContainer so charts scale down on small screens.
 * minWidth/minHeight ensure Recharts never sees -1 dimensions (avoids console warnings).
 */
export function ResponsiveChartContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        className ?? "w-full min-w-0 h-[220px] sm:h-[260px] md:h-[300px]"
      }
      style={{ minWidth: 1, minHeight: 200 }}
      aria-hidden="true"
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        minHeight={200}
        initialDimension={{ width: 400, height: 220 }}
      >
        {children}
      </ResponsiveContainer>
    </div>
  );
}
