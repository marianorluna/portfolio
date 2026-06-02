import type { Metadata } from "next";
import type { Locale } from "@/types/portfolio";

export const SITE_URL = "https://marianorluna.com";
export const SITE_NAME = "Mariano Luna";
export const OG_IMAGE_PATH = "/images/og-social-preview.png";
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

const LOCALE_TO_OG: Record<Locale, string> = {
  es: "es_ES",
  en: "en_US",
};

export function ogImageAlt(locale: Locale): string {
  return locale === "es"
    ? "Portfolio 3D de Mariano Luna — Arquitecto BIM & Fullstack Dev"
    : "Mariano Luna 3D portfolio — BIM Architect & Fullstack Dev";
}

export function buildOgImages(locale: Locale = "es"): NonNullable<Metadata["openGraph"]>["images"] {
  return [
    {
      url: OG_IMAGE_PATH,
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
      alt: ogImageAlt(locale),
      type: "image/png",
    },
  ];
}

export function buildLanguageAlternates(): Metadata["alternates"] {
  return {
    canonical: "/es",
    languages: {
      es: "/es",
      en: "/en",
    },
  };
}

export function buildLocaleAlternates(pagePath: string): Metadata["alternates"] {
  return {
    canonical: pagePath,
    languages: {
      es: "/es",
      en: "/en",
    },
  };
}

type SocialMetadataInput = {
  title: string;
  description: string;
  locale?: Locale;
  url?: string;
};

export function buildSocialMetadata({
  title,
  description,
  locale = "es",
  url = `${SITE_URL}/es`,
}: SocialMetadataInput): Pick<Metadata, "openGraph" | "twitter"> {
  const ogLocale = LOCALE_TO_OG[locale];
  const alternateLocale = locale === "es" ? ["en_US"] : ["es_ES"];

  return {
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: SITE_NAME,
      locale: ogLocale,
      alternateLocale,
      images: buildOgImages(locale),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE_PATH],
    },
  };
}

export function buildRootMetadata(description: string): Metadata {
  const title = SITE_NAME;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `${SITE_NAME} · %s`,
    },
    description,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    robots: {
      index: true,
      follow: true,
    },
    alternates: buildLanguageAlternates(),
    ...buildSocialMetadata({ title, description }),
  };
}

export function buildHomeMetadata(
  locale: Locale,
  title: string,
  description: string
): Metadata {
  const pagePath = `/${locale}`;

  return {
    title: {
      absolute: title,
    },
    description,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    alternates: buildLocaleAlternates(pagePath),
    ...buildSocialMetadata({
      title,
      description,
      locale,
      url: `${SITE_URL}${pagePath}`,
    }),
  };
}

export function buildLegalPageMetadata(
  locale: Locale,
  pathSuffix: string,
  title: string,
  description: string
): Metadata {
  const pagePath = `/${locale}${pathSuffix}`;

  return {
    title,
    description,
    alternates: {
      canonical: pagePath,
      languages: {
        es: `/es${pathSuffix}`,
        en: `/en${pathSuffix}`,
      },
    },
    ...buildSocialMetadata({
      title: `${SITE_NAME} · ${title}`,
      description,
      locale,
      url: `${SITE_URL}${pagePath}`,
    }),
  };
}

export function buildNotFoundMetadata(
  locale: Locale,
  title: string,
  description: string
): Metadata {
  const homePath = `/${locale}`;

  return {
    title,
    description,
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      languages: {
        es: "/es",
        en: "/en",
      },
    },
    ...buildSocialMetadata({
      title: `${SITE_NAME} · ${title}`,
      description,
      locale,
      url: `${SITE_URL}${homePath}`,
    }),
  };
}

/** Metadata estática bilingüe para not-found global (sin locale en ruta). */
export const globalNotFoundMetadata: Metadata = {
  title: "404 · Página no encontrada / Page not found",
  description:
    "La página no existe o ha sido movida. The page does not exist or has been moved.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    languages: {
      es: "/es",
      en: "/en",
    },
  },
};

export const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE_NAME,
  url: SITE_URL,
  image: `${SITE_URL}${OG_IMAGE_PATH}`,
  jobTitle: "Arquitecto BIM & Fullstack Developer",
  knowsAbout: ["BIM", "Arquitectura", "Desarrollo Fullstack", "Three.js", "Next.js"],
} as const;

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: `${SITE_NAME} Portfolio`,
  url: SITE_URL,
  inLanguage: ["es", "en"],
  image: `${SITE_URL}${OG_IMAGE_PATH}`,
} as const;
