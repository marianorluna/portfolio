import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LabBentoSlideshow } from "@/components/lab/LabBentoSlideshow";
import { LabFilterEmptyCard } from "@/components/lab/LabFilterEmptyCard";
import { LabHeroCard } from "@/components/lab/LabHeroCard";
import { LabPageLayout } from "@/components/lab/LabPageLayout";
import { LabPlaceholderCard } from "@/components/lab/LabPlaceholderCard";
import { LabResourceCard } from "@/components/lab/LabResourceCard";
import { buildLabIndexMetadata } from "@/config/site-seo";
import { getPortfolioDataByLocale, isLocale, LOCALES } from "@/i18n/locale";
import { getLabCopy } from "@/i18n/lab-copy";
import {
  formatLabMonthYear,
  getLabEffectiveDate,
  getLabPlaceholders,
  isLabUpdated,
  listLabResources,
} from "@/lib/lab";
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
  const placeholders = getLabPlaceholders(locale);

  const activeType = rawType != null && isLabResourceType(rawType) ? rawType : null;
  const visibleResources = activeType != null
    ? resources.filter((resource) => resource.type === activeType)
    : resources;
  const visiblePlaceholders = activeType != null
    ? placeholders.filter((item) => item.type === activeType)
    : placeholders;

  const filters = [
    {
      type: null as LabResourceType | null,
      href: `/${locale}/lab`,
      label: copy.filterAllLabel,
      active: activeType == null,
    },
    ...LAB_RESOURCE_TYPES.map((type) => ({
      type,
      href: `/${locale}/lab?type=${type}`,
      label: copy.typeLabel[type],
      active: activeType === type,
    })),
  ];

  const showEmpty =
    visibleResources.length === 0 && visiblePlaceholders.length === 0;

  const contentCards = showEmpty
    ? [
        <LabFilterEmptyCard
          key="filter-empty"
          message={copy.filterEmptyMessage}
        />,
      ]
    : [
        ...visibleResources.map((resource, index) => {
          const effective = getLabEffectiveDate(resource);
          return (
            <LabResourceCard
              key={resource.id}
              href={`/${locale}/lab/${resource.slug}`}
              title={resource.title}
              description={resource.description}
              type={resource.type}
              typeLabel={copy.typeLabel[resource.type]}
              tags={resource.tags}
              coverImage={resource.coverImage}
              coverAlt={resource.coverAlt ?? resource.title}
              size={resource.size ?? "md"}
              openCtaLabel={copy.openCtaLabel}
              dateLabel={isLabUpdated(resource) ? copy.updatedLabel : copy.publishedLabel}
              dateText={formatLabMonthYear(effective, locale)}
              dateTime={effective}
              enterDelayMs={80 + index * 40}
            />
          );
        }),
        ...visiblePlaceholders.map((item, index) => (
          <LabPlaceholderCard
            key={item.id}
            title={item.title}
            type={item.type}
            typeLabel={copy.typeLabel[item.type]}
            tags={item.tags}
            size={item.size}
            tone={item.tone}
            comingSoonLabel={copy.comingSoonLabel}
            enterDelayMs={100 + (visibleResources.length + index) * 40}
          />
        )),
      ];

  return (
    <LabPageLayout
      locale={locale}
      kicker={copy.indexKicker}
      title={copy.indexTitle}
      description={copy.indexDescription}
      backToHomeLabel={data.legal.backToHome}
      backToLabLabel={copy.backToLabLabel}
      showBackToLab={false}
      variant="index"
    >
      <LabBentoSlideshow
        hero={
          <LabHeroCard
            locale={locale}
            title={copy.indexTitle}
            description={copy.indexDescription}
            filters={filters}
            filtersAriaLabel={copy.filterAllLabel}
            backHref={`/${locale}`}
            backLabel={data.legal.backToHome}
            settingsLabel={data.nav.uiText.settingsLabel}
            settingsCopy={{
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
            }}
          />
        }
        items={contentCards}
        nextPageLabel={copy.nextPageLabel}
        prevPageLabel={copy.prevPageLabel}
        pagesNavOpenLabel={copy.pagesNavOpenLabel}
        pagesNavCloseLabel={copy.pagesNavCloseLabel}
      />
    </LabPageLayout>
  );
}
