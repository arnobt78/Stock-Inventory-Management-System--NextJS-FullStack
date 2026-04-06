/**
 * TanStack Query Persister
 * Client-side persistence for TanStack Query cache using localStorage
 * Persists query cache across page refreshes for better UX
 */

import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

/**
 * Get persister instance for TanStack Query
 * Uses localStorage for client-side persistence
 *
 * Benefits:
 * - Persists query cache across page refreshes
 * - Faster initial loads (no loading state for cached data)
 * - Better offline experience
 * - Works immediately without network calls
 *
 * @returns Persister instance or null if localStorage is unavailable
 */
export function getPersister() {
  // Client-side only - localStorage is not available on server
  if (typeof window === "undefined") {
    return null;
  }

  try {
    // Create localStorage persister
    // This persists TanStack Query cache to browser localStorage
    return createSyncStoragePersister({
      storage: window.localStorage,
      key: "stock-inventory-query-cache",
      throttleTime: 1000,
    });
  } catch (error) {
    // Graceful degradation: if localStorage is unavailable, return null
    // TanStack Query will continue working without persistence
    console.warn("Failed to create localStorage persister:", error);
    return null;
  }
}
