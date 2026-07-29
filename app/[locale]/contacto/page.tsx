import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LoadingScreenShell } from "@/components/LoadingScreenShell";
import { PortfolioSceneClient } from "@/components/PortfolioSceneClient";
import { ServerInsertedScripts } from "@/components/seo/ServerInsertedScripts";
import { OG_IMAGE_PATH, SITE_NAME, SITE_URL, buildSocialMetadata } from "@/config/site-seo";
import { getLabCopy, getPortfolioDataByLocale, isLocale, LOCALES } from "@/i18n/locale";
import { getLabIndexForNav } from "@/lib/lab";
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
  const contactLink = data.nav.links.find((link) => link.id === "contacto");
  const title = contactLink?.label ?? (locale === "es" ? "Contacto" : "Contact");
  const description =
    contactLink?.description ?? data.meta.description;
  const pagePath = `/${locale}/contacto`;

  return {
    title,
    description,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    alternates: {
      canonical: pagePath,
      languages: {
        es: "/es/contacto",
        en: "/en/contacto",
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

export default async function ContactoPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const data = getPortfolioDataByLocale(locale);
  const labItems = await getLabIndexForNav(locale);
  const contactLink = data.nav.links.find((link) => link.id === "contacto");
  const title = contactLink?.label ?? (locale === "es" ? "Contacto" : "Contact");
  const description =
    contactLink?.description ?? data.meta.description;

  const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: title,
    description,
    url: `${SITE_URL}/${locale}/contacto`,
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
      <PortfolioSceneClient
        data={data}
        locale={locale}
        initialActivePanel="contacto"
        labItems={labItems}
        labCopy={getLabCopy(locale)}
      />
      <ServerInsertedScripts
        scripts={[
          {
            id: `contact-jsonld-${locale}`,
            type: "application/ld+json",
            html: JSON.stringify(contactJsonLd),
          },
        ]}
      />
    </>
  );
}
