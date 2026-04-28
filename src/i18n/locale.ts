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
