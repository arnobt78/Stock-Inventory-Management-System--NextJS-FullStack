"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface CopyCodeButtonProps {
  /** Text to copy to clipboard */
  text: string;
  /** Optional label for screen readers */
  ariaLabel?: string;
  /** Optional class for the button */
  className?: string;
}

/**
 * Button that copies the given text to clipboard and shows a toast.
 * Uses shadcn Button and toast for consistent UX.
 */
export function CopyCodeButton({
  text,
  ariaLabel = "Copy to clipboard",
  className,
}: CopyCodeButtonProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Code copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className={className}
      aria-label={ariaLabel}
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      <span className="sr-only">{copied ? "Copied" : "Copy"}</span>
    </Button>
  );
}
