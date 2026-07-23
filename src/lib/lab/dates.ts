import type { Locale } from "@/types/portfolio";

const YEAR_MONTH_PATTERN = /^(\d{4})-(\d{2})$/;

/** Fecha efectiva a mostrar/ordenar: la más reciente entre created y updated. */
export function getLabEffectiveDate(entry: {
  createdAt: string;
  updatedAt: string;
}): string {
  return entry.updatedAt >= entry.createdAt ? entry.updatedAt : entry.createdAt;
}

/** `true` si la entrada se ha actualizado después de publicarse. */
export function isLabUpdated(entry: {
  createdAt: string;
  updatedAt: string;
}): boolean {
  return entry.updatedAt > entry.createdAt;
}

/**
 * Formatea `YYYY-MM` como mes + año localizado (p. ej. `jul 2026` / `Jul 2026`).
 * Sin día ni hora.
 */
export function formatLabMonthYear(yyyyMm: string, locale: Locale): string {
  const match = YEAR_MONTH_PATTERN.exec(yyyyMm);
  if (match == null) return yyyyMm;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return yyyyMm;
  const date = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
}

/** Convierte `YYYY-MM` a `Date` (día 1 UTC) para sitemap / JSON-LD. */
export function labMonthToDate(yyyyMm: string): Date {
  const match = YEAR_MONTH_PATTERN.exec(yyyyMm);
  if (match == null) return new Date(NaN);
  const year = Number(match[1]);
  const month = Number(match[2]);
  return new Date(Date.UTC(year, month - 1, 1));
}
