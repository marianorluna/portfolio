import { Inter, JetBrains_Mono } from "next/font/google";
import { ImageInteractionGuard } from "@/components/ImageInteractionGuard";
import { VercelTelemetry } from "@/components/legal/VercelTelemetry";
import { ServerInsertedScripts } from "@/components/seo/ServerInsertedScripts";
import {
  HYDRATION_SANITIZER_SCRIPT,
  THEME_BOOTSTRAP_SCRIPT,
} from "@/config/client-bootstrap-scripts";
import { buildRootMetadata, personJsonLd, websiteJsonLd } from "@/config/site-seo";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "800"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata = buildRootMetadata(
  "Portfolio interactivo 3D de Mariano Luna. Arquitecto BIM y desarrollador fullstack especializado en el ecosistema AECO, automatización y herramientas web."
);

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
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
        <ImageInteractionGuard />
        <VercelTelemetry />
      </body>
    </html>
  );
}
