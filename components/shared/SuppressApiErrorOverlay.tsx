"use client";

import { useEffect } from "react";
import { ApiError } from "@/lib/api/errors";

/**
 * Prevents the Next.js dev error overlay from showing for expected API errors
 * (e.g. 403 Supplier not found or unauthorized when editing the global demo supplier).
 * Errors are still logged and toasts are shown by mutation onError; we only suppress
 * the full-screen overlay so the UI stays usable.
 */
export function SuppressApiErrorOverlay() {
  useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      const reason = event?.reason;
      if (reason instanceof ApiError || reason?.name === "ApiError") {
        event.preventDefault();
      }
    };
    window.addEventListener("unhandledrejection", handler);
    return () => window.removeEventListener("unhandledrejection", handler);
  }, []);
  return null;
}
