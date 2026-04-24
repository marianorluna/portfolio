import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { SCENE_BACKGROUND_CSS } from "@/config/scene-theme";
import { LOADING_BACKGROUND } from "@/config/ui-theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portfolio · Arquitecto BIM × Fullstack Dev",
  description: "Portfolio interactivo 3D — BIM meets Code"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const rootStyle: CSSProperties & { "--bg-color": string; "--loading-bg": string } = {
    "--bg-color": SCENE_BACKGROUND_CSS,
    "--loading-bg": LOADING_BACKGROUND,
  };

  return (
    <html lang="es" suppressHydrationWarning style={rootStyle}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
