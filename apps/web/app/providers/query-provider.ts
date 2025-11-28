"use client";

import { QueryClient } from "@tanstack/react-query";

export const queryClientProvider = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 10, // 10 minutos
      retry: 1,
    },
  },
});
