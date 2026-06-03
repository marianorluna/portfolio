import type { Locale, PortfolioData } from "@/types/portfolio";
import dataEsRaw from "@/data/data-es.json";
import dataEnRaw from "@/data/data-en.json";

export const DEFAULT_LOCALE: Locale = "es";
export const LOCALES: readonly Locale[] = ["es", "en"];

const dataByLocale: Record<Locale, PortfolioData> = {
  es: dataEsRaw as PortfolioData,
  en: dataEnRaw as PortfolioData,
};

export function isLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function getPortfolioDataByLocale(locale: Locale): PortfolioData {
  return dataByLocale[locale];
}

export const SITE_LOCALE_HEADER = "x-site-locale";

/** Segmento de URL localizado para la sección de proyectos. */
export const PROJECT_SEGMENT: Record<Locale, string> = {
  es: "proyectos",
  en: "projects",
};

/** Primer segmento de pathname; locale válido o default. */
export function resolveLocaleFromPathname(pathname: string): Locale {
  const segment = pathname.split("/").filter(Boolean)[0];
  return segment != null && isLocale(segment) ? segment : DEFAULT_LOCALE;
}

export function getOtherLocale(locale: Locale): Locale {
  return locale === "es" ? "en" : "es";
}
