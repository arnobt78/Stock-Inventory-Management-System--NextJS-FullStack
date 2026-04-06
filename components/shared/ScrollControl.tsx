"use client";

import { useEffect } from "react";

/**
 * ScrollControl Component
 * Prevents scroll bounce and controls scroll restoration
 */
export default function ScrollControl() {
  useEffect(() => {
    // Disable scroll restoration
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // Reset scroll position on mount
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    // Prevent scroll restoration on navigation
    const handleBeforeUnload = () => {
      window.scrollTo(0, 0);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return null;
}
