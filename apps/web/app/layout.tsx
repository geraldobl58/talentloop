import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { EmotionRegistry, ThemeProvider } from "@/components/providers";
import "./globals.css";

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
        <EmotionRegistry>
          <ThemeProvider>{children}</ThemeProvider>
        </EmotionRegistry>
      </body>
    </html>
  );
}
