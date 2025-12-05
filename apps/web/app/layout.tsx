import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";

import "./globals.css";
import { Providers } from "./providers";

const montserrat = Montserrat({
  variable: "--font-montserrat-sans",
  subsets: ["latin"],
  display: "swap", // Improve font loading performance
  preload: true,
  fallback: ["system-ui", "arial"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7c3aed",
};

export const metadata: Metadata = {
  title: "TalentLoop - Encontre seu emprego dos sonhos",
  description:
    "Plataforma inteligente de busca e aplicação automática de vagas com matching por IA",
  keywords: ["emprego", "vagas", "carreira", "recrutamento", "IA", "matching"],
  robots: "index, follow",
  openGraph: {
    title: "TalentLoop - Encontre seu emprego dos sonhos",
    description:
      "Plataforma inteligente de busca e aplicação automática de vagas com matching por IA",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* DNS Prefetch for API */}
        <link rel="dns-prefetch" href="//api.talentloop.com" />
        <link
          rel="preconnect"
          href="//api.talentloop.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${montserrat.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
