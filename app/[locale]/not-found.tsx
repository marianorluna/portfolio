import type { Metadata } from "next";
import { NotFoundView } from "@/components/errors/NotFoundView";
import { buildNotFoundMetadata } from "@/config/site-seo";
import { getPortfolioDataByLocale } from "@/i18n/locale";
import { getRequestLocale } from "@/i18n/request-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = getPortfolioDataByLocale(locale).notFound;
  return buildNotFoundMetadata(locale, copy.metadataTitle, copy.metadataDescription);
}

export default async function LocaleNotFound() {
  const locale = await getRequestLocale();
  return <NotFoundView locale={locale} />;
}
