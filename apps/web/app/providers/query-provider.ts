"use client";

import { QueryClient } from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data for 5 minutes - reduces API calls
        staleTime: 1000 * 60 * 5,
        // Keep unused data in cache for 30 minutes
        gcTime: 1000 * 60 * 30,
        // Only retry once on failure
        retry: 1,
        // Don't refetch on window focus in production
        refetchOnWindowFocus: process.env.NODE_ENV === "development",
        // Don't refetch on mount if data is fresh
        refetchOnMount: false,
        // Don't refetch on reconnect
        refetchOnReconnect: false,
      },
      mutations: {
        // Retry mutations once
        retry: 1,
      },
    },
  });
}

// Singleton pattern for client-side QueryClient
let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

// Export for backward compatibility
export const queryClientProvider = getQueryClient();
