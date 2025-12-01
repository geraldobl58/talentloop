import { Container } from "@mui/material";
import { Header } from "../components/header";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <main className="w-full h-full">
        <Header />
        <Container maxWidth="lg" sx={{ py: 6 }}>
          {children}
        </Container>
      </main>
    </div>
  );
}
