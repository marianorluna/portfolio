import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LoadingScreenShell } from "@/components/LoadingScreenShell";
import { PortfolioSceneClient } from "@/components/PortfolioSceneClient";
import { ServerInsertedScripts } from "@/components/seo/ServerInsertedScripts";
import { buildHomeMetadata, OG_IMAGE_PATH, SITE_URL } from "@/config/site-seo";
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
  return buildHomeMetadata(locale, data.meta.title, data.meta.description);
}

export default async function LocalizedHomePage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const data = getPortfolioDataByLocale(locale);
  const portfolioJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: data.meta.title,
    description: data.meta.description,
    url: `${SITE_URL}/${locale}`,
    image: `${SITE_URL}${OG_IMAGE_PATH}`,
    inLanguage: locale,
    isPartOf: {
      "@type": "WebSite",
      name: "Mariano Luna Portfolio",
      url: SITE_URL,
    },
    author: {
      "@type": "Person",
      name: "Mariano Luna",
    },
  };
  return (
    <>
      <LoadingScreenShell
        brandMain={data.ui.loading.brandMain}
        brandAccent={data.ui.loading.brandAccent}
      />
      <PortfolioSceneClient data={data} locale={locale} />
      <ServerInsertedScripts
        scripts={[
          {
            id: `portfolio-jsonld-${locale}`,
            type: "application/ld+json",
            html: JSON.stringify(portfolioJsonLd),
          },
        ]}
      />
    </>
  );
}
