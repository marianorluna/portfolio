import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Script from "next/script";
import { SCENE_BACKGROUND_CSS } from "@/config/scene-theme";
import { LOADING_BACKGROUND } from "@/config/ui-theme";
import "./globals.css";

const SITE_URL = "https://marianorluna.com";
const OG_IMAGE_PATH = "/images/screenshot-control-manager.png";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Mariano Luna",
    template: "Mariano Luna · %s",
  },
  description: "Portfolio Arquitecto - BIM & Fullstack Dev",
  alternates: {
    canonical: "/es",
    languages: {
      es: "/es",
      en: "/en",
    },
  },
  openGraph: {
    type: "website",
    url: "/es",
    title: "Mariano Luna",
    description: "Portfolio Arquitecto - BIM & Fullstack Dev",
    siteName: "Mariano Luna",
    locale: "es_ES",
    alternateLocale: ["en_US"],
    images: [
      {
        url: OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: "Portfolio 3D de Mariano Luna",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mariano Luna",
    description: "Portfolio Arquitecto - BIM & Fullstack Dev",
    images: [OG_IMAGE_PATH],
  },
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const rootStyle: CSSProperties & { "--bg-color": string; "--loading-bg": string } = {
    "--bg-color": SCENE_BACKGROUND_CSS,
    "--loading-bg": LOADING_BACKGROUND,
  };
  const themeBootstrapScript = `
    (function () {
      try {
        var saved = window.localStorage.getItem("portfolio-theme");
        var theme = saved === "light" || saved === "dark" ? saved : "dark";
        var doc = document.documentElement;
        doc.setAttribute("data-theme", theme);
        if (theme === "light") {
          doc.style.setProperty("--bg-color", "#e8eaed");
          doc.style.setProperty("--loading-bg", "#f1f2f4");
        } else {
          doc.style.setProperty("--bg-color", "#323232");
          doc.style.setProperty("--loading-bg", "#1f1f1f");
        }
      } catch (_err) {
        // Mantener fallback de tema oscuro definido en estilos inline del layout.
      }
    })();
  `;
  const hydrationSanitizerScript = `
    (function () {
      try {
        function stripBisAttrs(node) {
          if (!node || node.nodeType !== 1) return;
          node.removeAttribute("bis_skin_checked");
          node.removeAttribute("bis_register");
          node.removeAttribute("bis_use");
        }

        function cleanBisAttributes(root) {
          stripBisAttrs(root);
          var scope = root && root.querySelectorAll ? root : document;
          var nodes = scope.querySelectorAll("[bis_skin_checked], [bis_register], [bis_use]");
          for (var i = 0; i < nodes.length; i++) stripBisAttrs(nodes[i]);
        }

        cleanBisAttributes(document.documentElement);

        var observer = new MutationObserver(function (mutations) {
          for (var i = 0; i < mutations.length; i++) {
            var mutation = mutations[i];
            if (mutation.type === "attributes") {
              stripBisAttrs(mutation.target);
            }
            if (mutation.type === "childList") {
              for (var j = 0; j < mutation.addedNodes.length; j++) {
                cleanBisAttributes(mutation.addedNodes[j]);
              }
            }
          }
        });

        observer.observe(document.documentElement, {
          subtree: true,
          childList: true,
          attributes: true,
          attributeFilter: ["bis_skin_checked", "bis_register", "bis_use"]
        });

        setTimeout(function () {
          observer.disconnect();
        }, 5000);

        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", cleanBisAttributes, { once: true });
        } else {
          cleanBisAttributes(document.documentElement);
        }
      } catch (_err) {
        // Evitar romper hidratación por errores en scripts de saneamiento.
      }
    })();
  `;
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Mariano Luna",
    url: SITE_URL,
    jobTitle: "Arquitecto BIM & Fullstack Developer",
    knowsAbout: ["BIM", "Arquitectura", "Desarrollo Fullstack", "Three.js", "Next.js"],
  };
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Mariano Luna Portfolio",
    url: SITE_URL,
    inLanguage: ["es", "en"],
  };

  return (
    <html lang="es" suppressHydrationWarning style={rootStyle}>
      <head suppressHydrationWarning />
      <body suppressHydrationWarning>
        <Script id="hydration-sanitizer" strategy="beforeInteractive">
          {hydrationSanitizerScript}
        </Script>
        <Script id="theme-bootstrap" strategy="beforeInteractive">
          {themeBootstrapScript}
        </Script>
        <Script id="person-jsonld" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify(personJsonLd)}
        </Script>
        <Script id="website-jsonld" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify(websiteJsonLd)}
        </Script>
        {children}
      </body>
    </html>
  );
}
