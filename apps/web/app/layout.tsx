import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import "./globals.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientProvider } from "./providers/query-provider";
import { EmotionRegistry } from "./providers/emotion-registry";
import { ThemeProvider } from "./providers/theme-provider";

const montserrat = Montserrat({
  variable: "--font-montserrat-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TalentLoop - Encontre seu emprego dos sonhos",
  description:
    "Plataforma inteligente de busca e aplicação automática de vagas com matching por IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${montserrat.variable} ${montserrat.variable} antialiased`}
      >
        <QueryClientProvider client={queryClientProvider}>
          <EmotionRegistry>
            <ThemeProvider>{children}</ThemeProvider>
          </EmotionRegistry>
          <ReactQueryDevtools />
        </QueryClientProvider>
      </body>
    </html>
  );
}
