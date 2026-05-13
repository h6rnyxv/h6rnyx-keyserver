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
      <body style={{background: "#000000", minHeight: "100vh", color: "#fff"}}>{children}</body>
    </html>
  );
}
