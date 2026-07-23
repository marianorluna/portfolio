import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LabPageLayout } from "@/components/lab/LabPageLayout";
import { ServerInsertedScripts } from "@/components/seo/ServerInsertedScripts";
import { buildLabEntryMetadata, SITE_URL } from "@/config/site-seo";
import { getPortfolioDataByLocale, isLocale, LOCALES } from "@/i18n/locale";
import { getLabCopy } from "@/i18n/lab-copy";
import { getLabResource, listLabResources } from "@/lib/lab";
import type { Locale } from "@/types/portfolio";

export const dynamicParams = false;

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams(): Promise<Array<{ locale: Locale; slug: string }>> {
  const perLocale = await Promise.all(
    LOCALES.map(async (locale) => {
      const resources = await listLabResources(locale);
      return resources.map((resource) => ({ locale, slug: resource.slug }));
    })
  );
  return perLocale.flat();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const resource = await getLabResource(locale, slug);
  if (!resource) return {};
  return buildLabEntryMetadata(locale, slug, resource.frontmatter);
}

export default async function LabEntryPage({ params }: PageProps) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const resource = await getLabResource(locale, slug);
  if (!resource) notFound();

  const copy = getLabCopy(locale);
  const data = getPortfolioDataByLocale(locale);
  const { frontmatter } = resource;

  const labJsonLd = {
    "@context": "https://schema.org",
    "@type": frontmatter.type === "tutorial" || frontmatter.type === "guia" ? "TechArticle" : "Article",
    headline: frontmatter.title,
    description: frontmatter.description,
    datePublished: frontmatter.publishedAt,
    inLanguage: locale,
    keywords: frontmatter.tags.join(", "),
    author: {
      "@type": "Person",
      name: "Mariano Luna",
    },
    url: `${SITE_URL}/${locale}/lab/${slug}`,
  };

  return (
    <>
      <LabPageLayout
        locale={locale}
        kicker={copy.typeLabel[frontmatter.type]}
        title={frontmatter.title}
        description={frontmatter.description}
        backToHomeLabel={data.legal.backToHome}
        backToLabLabel={copy.backToLabLabel}
      >
        <div className="lab-article__meta">
          <span className="lab-article__level">{copy.levelLabel[frontmatter.level]}</span>
          <time className="lab-article__date" dateTime={frontmatter.publishedAt}>
            {copy.publishedLabel} {frontmatter.publishedAt}
          </time>
        </div>
        {frontmatter.tags.length > 0 && (
          <ul className="lab-article__tags">
            {frontmatter.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        )}
        <div className="lab-article">{resource.content}</div>
      </LabPageLayout>
      <ServerInsertedScripts
        scripts={[
          {
            id: `lab-jsonld-${locale}-${slug}`,
            type: "application/ld+json",
            html: JSON.stringify(labJsonLd),
          },
        ]}
      />
    </>
  );
}
