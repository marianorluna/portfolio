import type { CSSProperties } from "react";
import { ServerInsertedScripts } from "@/components/seo/ServerInsertedScripts";
import {
  HYDRATION_SANITIZER_SCRIPT,
  THEME_BOOTSTRAP_SCRIPT,
} from "@/config/client-bootstrap-scripts";
import { SCENE_BACKGROUND_CSS } from "@/config/scene-theme";
import { buildRootMetadata, personJsonLd, websiteJsonLd } from "@/config/site-seo";
import { LOADING_BACKGROUND } from "@/config/ui-theme";
import "./globals.css";

export const metadata = buildRootMetadata(
  "Portfolio interactivo 3D de Mariano Luna. Arquitecto BIM y desarrollador fullstack especializado en el ecosistema AECO, automatización y herramientas web."
);

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const rootStyle: CSSProperties & { "--bg-color": string; "--loading-bg": string } = {
    "--bg-color": SCENE_BACKGROUND_CSS,
    "--loading-bg": LOADING_BACKGROUND,
  };

  return (
    <html lang="es" suppressHydrationWarning style={rootStyle}>
      <body suppressHydrationWarning>
        <ServerInsertedScripts
          scripts={[
            { id: "theme-bootstrap", html: THEME_BOOTSTRAP_SCRIPT },
            { id: "hydration-sanitizer", html: HYDRATION_SANITIZER_SCRIPT },
            {
              id: "person-jsonld",
              type: "application/ld+json",
              html: JSON.stringify(personJsonLd),
            },
            {
              id: "website-jsonld",
              type: "application/ld+json",
              html: JSON.stringify(websiteJsonLd),
            },
          ]}
        />
        {children}
      </body>
    </html>
  );
}
