import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LabPageLayout } from "@/components/lab/LabPageLayout";
import { ServerInsertedScripts } from "@/components/seo/ServerInsertedScripts";
import { buildLabEntryMetadata, SITE_URL } from "@/config/site-seo";
import { getPortfolioDataByLocale, isLocale, LOCALES } from "@/i18n/locale";
import { getLabCopy } from "@/i18n/lab-copy";
import {
  formatLabMonthYear,
  getLabEffectiveDate,
  getLabResource,
  isLabUpdated,
  labMonthToDate,
  listLabResources,
} from "@/lib/lab";
import type { Locale } from "@/types/portfolio";

export const dynamicParams = false;

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

const TUTORIAL_TYPES = new Set(["tutorial", "guia"]);

const TOC_BY_LOCALE: Record<Locale, Array<{ id: string; label: string }>> = {
  es: [
    { id: "requisitos", label: "Requisitos" },
    { id: "tutorial", label: "Guía paso a paso" },
    { id: "casos-uso", label: "Casos de uso" },
  ],
  en: [
    { id: "requisitos", label: "Prerequisites" },
    { id: "tutorial", label: "Step-by-step" },
    { id: "casos-uso", label: "Use cases" },
  ],
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
  const { frontmatter, createdAt, updatedAt } = resource;
  const effective = getLabEffectiveDate({ createdAt, updatedAt });
  const dateLabel = isLabUpdated({ createdAt, updatedAt })
    ? copy.updatedLabel
    : copy.publishedLabel;
  const dateText = formatLabMonthYear(effective, locale);
  const isTutorialShell = TUTORIAL_TYPES.has(frontmatter.type);
  const settingsCopy = {
    settingsKicker: data.nav.uiText.settingsKicker,
    settingsTitle: data.nav.uiText.settingsTitle,
    themeTitle: data.nav.uiText.themeTitle,
    themeDescription: data.nav.uiText.themeDescription,
    languageTitle: data.nav.uiText.languageTitle,
    languageDescription: data.nav.uiText.languageDescription,
    languageSpanishLabel: data.nav.uiText.languageSpanishLabel,
    languageEnglishLabel: data.nav.uiText.languageEnglishLabel,
    switchToSpanishLabel: data.nav.uiText.switchToSpanishLabel,
    switchToEnglishLabel: data.nav.uiText.switchToEnglishLabel,
    switchToLightLabel: data.nav.uiText.switchToLightLabel,
    switchToDarkLabel: data.nav.uiText.switchToDarkLabel,
    closeLabel: copy.settingsCloseLabel,
  };

  const labJsonLd = {
    "@context": "https://schema.org",
    "@type": frontmatter.type === "tutorial" || frontmatter.type === "guia" ? "TechArticle" : "Article",
    headline: frontmatter.title,
    description: frontmatter.description,
    datePublished: labMonthToDate(createdAt).toISOString(),
    dateModified: labMonthToDate(updatedAt).toISOString(),
    inLanguage: locale,
    keywords: frontmatter.tags.join(", "),
    author: {
      "@type": "Person",
      name: "Mariano Luna",
    },
    url: `${SITE_URL}/${locale}/lab/${slug}`,
  };

  const meta = (
    <>
      <div className="lab-article__meta">
        <span className="lab-article__level">{copy.levelLabel[frontmatter.level]}</span>
        <time className="lab-article__date" dateTime={effective}>
          {dateLabel} {dateText}
        </time>
      </div>
      {frontmatter.tags.length > 0 && (
        <ul className="lab-article__tags">
          {frontmatter.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      )}
    </>
  );

  return (
    <>
      <LabPageLayout
        locale={locale}
        kicker={copy.typeLabel[frontmatter.type]}
        title={frontmatter.title}
        description={frontmatter.description}
        backToHomeLabel={data.legal.backToHome}
        backToLabLabel={copy.backToLabLabel}
        variant={isTutorialShell ? "tutorial" : "article"}
        meta={meta}
        tocItems={isTutorialShell ? TOC_BY_LOCALE[locale] : undefined}
        tocAriaLabel={copy.tocAriaLabel}
        settingsLabel={data.nav.uiText.settingsLabel}
        menuOpenLabel={copy.menuOpenLabel}
        menuCloseLabel={copy.menuCloseLabel}
        menuKicker={copy.menuKicker}
        menuTitle={copy.menuTitle}
        settingsCopy={settingsCopy}
      >
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
