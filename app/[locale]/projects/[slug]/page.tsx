import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PortfolioSceneClient } from "@/components/PortfolioSceneClient";
import { ServerInsertedScripts } from "@/components/seo/ServerInsertedScripts";
import { buildProjectMetadata, SITE_URL } from "@/config/site-seo";
import { getPortfolioDataByLocale, isLocale, LOCALES } from "@/i18n/locale";
import { getLabCopy } from "@/i18n/lab-copy";
import { getLabIndexForNav } from "@/lib/lab";
import { findProjectWithCategory } from "@/utils/floor-project-hotspots";
import type { Locale } from "@/types/portfolio";

export const dynamicParams = false;

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams(): Array<{ locale: Locale; slug: string }> {
  const data = getPortfolioDataByLocale("en");
  const slugs = data.projects.categories.flatMap(cat => cat.items.map(item => item.id));
  return LOCALES.filter(l => l === "en").flatMap(locale =>
    slugs.map(slug => ({ locale, slug }))
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const data = getPortfolioDataByLocale(locale);
  const found = findProjectWithCategory(data, slug);
  if (!found) return {};
  return buildProjectMetadata(locale, slug, found.project);
}

export default async function ProjectPage({ params }: PageProps) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const data = getPortfolioDataByLocale(locale);
  const found = findProjectWithCategory(data, slug);
  if (!found) notFound();
  const labItems = await getLabIndexForNav(locale);

  const projectJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: found.project.name,
    description: found.project.summary,
    url: `${SITE_URL}/${locale}/projects/${slug}`,
    inLanguage: locale,
    author: {
      "@type": "Person",
      name: "Mariano Luna",
    },
    keywords: found.project.stack.join(", "),
  };

  return (
    <>
      <PortfolioSceneClient
        data={data}
        locale={locale}
        initialProjectId={slug}
        labItems={labItems}
        labCopy={getLabCopy(locale)}
      />
      <ServerInsertedScripts
        scripts={[
          {
            id: `project-jsonld-${locale}-${slug}`,
            type: "application/ld+json",
            html: JSON.stringify(projectJsonLd),
          },
        ]}
      />
    </>
  );
}
