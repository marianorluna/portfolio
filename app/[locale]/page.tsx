import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PortfolioSceneClient } from "@/components/PortfolioSceneClient";
import { getPortfolioDataByLocale, isLocale, LOCALES } from "@/i18n/locale";
import type { Locale } from "@/types/portfolio";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams(): Array<{ locale: Locale }> {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const data = getPortfolioDataByLocale(locale);
  return {
    title: data.meta.title,
    description: data.nav.brand.tagline,
  };
}

export default async function LocalizedHomePage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const data = getPortfolioDataByLocale(locale);
  return <PortfolioSceneClient data={data} locale={locale} />;
}
