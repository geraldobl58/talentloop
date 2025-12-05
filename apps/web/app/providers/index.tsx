"use client";

import { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { queryClientProvider } from "./query-provider";
import { EmotionRegistry } from "./emotion-registry";
import { ThemeProvider } from "./theme-provider";
import { AuthProvider } from "./auth-provider";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Providers Wrapper
 *
 * Combina todos os providers da aplicação em um único componente cliente.
 * Ordem de providers (de fora para dentro):
 * 1. QueryClientProvider - React Query para gerenciamento de estado do servidor
 * 2. EmotionRegistry - CSS-in-JS para MUI
 * 3. ThemeProvider - Tema MUI
 * 4. AuthProvider - Autenticação com auto-refresh de token
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClientProvider}>
      <EmotionRegistry>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </EmotionRegistry>
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-left"
        />
      )}
    </QueryClientProvider>
  );
}
