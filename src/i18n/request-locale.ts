import { headers } from "next/headers";
import { DEFAULT_LOCALE, isLocale, SITE_LOCALE_HEADER } from "@/i18n/locale";
import type { Locale } from "@/types/portfolio";

export async function getRequestLocale(): Promise<Locale> {
  const headerStore = await headers();
  const value = headerStore.get(SITE_LOCALE_HEADER);
  if (value != null && isLocale(value)) {
    return value;
  }
  return DEFAULT_LOCALE;
}
