import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LabPageLayout } from "@/components/lab/LabPageLayout";
import { buildLabIndexMetadata } from "@/config/site-seo";
import { getPortfolioDataByLocale, isLocale, LOCALES } from "@/i18n/locale";
import { getLabCopy } from "@/i18n/lab-copy";
import { listLabResources } from "@/lib/lab";
import { LAB_RESOURCE_TYPES, type LabResourceType } from "@/types/lab";
import type { Locale } from "@/types/portfolio";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string }>;
};

export function generateStaticParams(): Array<{ locale: Locale }> {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = getLabCopy(locale);
  return buildLabIndexMetadata(locale, copy.indexTitle, copy.indexDescription);
}

function isLabResourceType(value: string): value is LabResourceType {
  return (LAB_RESOURCE_TYPES as readonly string[]).includes(value);
}

export default async function LabIndexPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { type: rawType } = await searchParams;

  const copy = getLabCopy(locale);
  const data = getPortfolioDataByLocale(locale);
  const resources = await listLabResources(locale);

  const activeType = rawType != null && isLabResourceType(rawType) ? rawType : null;
  const visibleResources = activeType != null
    ? resources.filter((resource) => resource.type === activeType)
    : resources;

  return (
    <LabPageLayout
      locale={locale}
      kicker={copy.indexKicker}
      title={copy.indexTitle}
      description={copy.indexDescription}
      backToHomeLabel={data.legal.backToHome}
      backToLabLabel={copy.backToLabLabel}
      showBackToLab={false}
    >
      {resources.length > 0 && (
        <nav className="lab-index__filters" aria-label={copy.filterAllLabel}>
          <Link
            href={`/${locale}/lab`}
            className={`lab-index__filter${activeType == null ? " is-active" : ""}`}
          >
            {copy.filterAllLabel}
          </Link>
          {LAB_RESOURCE_TYPES.map((type) => (
            <Link
              key={type}
              href={`/${locale}/lab?type=${type}`}
              className={`lab-index__filter${activeType === type ? " is-active" : ""}`}
            >
              {copy.typeLabel[type]}
            </Link>
          ))}
        </nav>
      )}
      {visibleResources.length === 0 ? (
        <p className="lab-empty">{copy.indexEmptyMessage}</p>
      ) : (
        <ul className="lab-index__list">
          {visibleResources.map((resource) => (
            <li key={resource.slug} className="lab-index__item">
              <Link href={`/${locale}/lab/${resource.slug}`} className="lab-index__card">
                <span className="lab-index__badge">{copy.typeLabel[resource.type]}</span>
                <h2 className="lab-index__title">{resource.title}</h2>
                <p className="lab-index__description">{resource.description}</p>
                {resource.tags.length > 0 && (
                  <ul className="lab-index__tags">
                    {resource.tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </LabPageLayout>
  );
}
