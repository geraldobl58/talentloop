export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <main className="w-full h-full">{children}</main>
    </div>
  );
}
