import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Script from "next/script";
import { PortfolioSceneClient } from "@/components/PortfolioSceneClient";
import { getPortfolioDataByLocale, isLocale, LOCALES } from "@/i18n/locale";
import type { Locale } from "@/types/portfolio";

const SITE_URL = "https://marianorluna.com";
const OG_IMAGE_PATH = "/images/screenshot-control-manager.png";

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
  const pagePath = `/${locale}`;
  const canonicalUrl = `${SITE_URL}${pagePath}`;
  return {
    title: {
      absolute: data.meta.title,
    },
    description: data.nav.brand.tagline,
    alternates: {
      canonical: pagePath,
      languages: {
        es: "/es",
        en: "/en",
      },
    },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      title: data.meta.title,
      description: data.nav.brand.tagline,
      locale: locale === "es" ? "es_ES" : "en_US",
      alternateLocale: locale === "es" ? ["en_US"] : ["es_ES"],
      images: [
        {
          url: OG_IMAGE_PATH,
          width: 1200,
          height: 630,
          alt: locale === "es" ? "Portfolio 3D de Mariano Luna" : "Mariano Luna 3D portfolio",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: data.meta.title,
      description: data.nav.brand.tagline,
      images: [OG_IMAGE_PATH],
    },
  };
}

export default async function LocalizedHomePage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const data = getPortfolioDataByLocale(locale);
  const portfolioJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: data.meta.title,
    description: data.nav.brand.tagline,
    url: `${SITE_URL}/${locale}`,
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
      <PortfolioSceneClient data={data} locale={locale} />
      <Script
        id={`portfolio-jsonld-${locale}`}
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify(portfolioJsonLd)}
      </Script>
    </>
  );
}
