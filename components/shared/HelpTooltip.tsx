"use client";

import React from "react";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface HelpTooltipProps {
  /** Help text shown on hover */
  content: React.ReactNode;
  /** Tooltip position */
  side?: "top" | "right" | "bottom" | "left";
  /** Optional class for the trigger icon wrapper */
  className?: string;
  /** Accessible label for the icon */
  ariaLabel?: string;
}

/**
 * Reusable help icon with tooltip for form labels and settings.
 * Hover to see help text; uses shadcn Tooltip for consistent UX.
 */
export function HelpTooltip({
  content,
  side = "top",
  className,
  ariaLabel = "Help",
}: HelpTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          role="img"
          aria-label={ariaLabel}
          className={cn(
            "inline-flex cursor-help align-middle text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded",
            className,
          )}
        >
          <HelpCircle className="h-4 w-4" />
        </span>
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs">
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
