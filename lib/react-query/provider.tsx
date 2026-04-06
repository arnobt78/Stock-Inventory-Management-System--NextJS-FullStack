/**
 * TanStack Query Provider
 * Wraps the app with QueryClientProvider for server state management
 * Includes persistence for better UX (cache survives page refreshes)
 */

"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";
import { createQueryClient } from "./config";
import { getPersister } from "./persister";

/**
 * Props for QueryProvider component
 */
interface QueryProviderProps {
  children: ReactNode;
}

/**
 * QueryProvider component
 * Provides QueryClient to the entire application with persistence
 * Uses useState to ensure single instance per component tree
 * Persists query cache to localStorage for better UX
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // Create QueryClient once and reuse it
  // This ensures we don't lose cache on re-renders
  const [queryClient] = useState(() => createQueryClient());
  
  // Get persister for localStorage persistence
  const persister = getPersister();

  // Use PersistQueryClientProvider if persister is available
  // Falls back to regular QueryClientProvider if not available
  if (persister) {
    return (
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          maxAge: 1000 * 60 * 60 * 24, // 24 hours
          buster: "v2.0.1",
          dehydrateOptions: {
            shouldDehydrateQuery: (query) => {
              return query.state.status === "success";
            },
          },
        }}
      >
        {children}
        {/* Show devtools only in development */}
        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </PersistQueryClientProvider>
    );
  }

  // Fallback to regular QueryClientProvider if persistence is unavailable
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show devtools only in development */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

