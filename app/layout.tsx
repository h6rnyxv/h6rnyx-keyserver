import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "H6rnyx KeyServer",
  description: "Sistema de gestión de API Keys",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-gray-950 text-white min-h-screen">{children}</body>
    </html>
  );
}
