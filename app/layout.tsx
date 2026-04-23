import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portfolio · Arquitecto BIM × Fullstack Dev",
  description: "Portfolio interactivo 3D — BIM meets Code"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
