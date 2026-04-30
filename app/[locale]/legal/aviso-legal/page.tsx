import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPortfolioDataByLocale, isLocale } from "@/i18n/locale";
import { LegalPageLayout } from "../LegalPageLayout";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const data = getPortfolioDataByLocale(locale);
  return {
    title: data.legal.pages.legalNotice.metadataTitle,
  };
}

export default async function LegalNoticePage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const data = getPortfolioDataByLocale(locale);
  const page = data.legal.pages.legalNotice;

  return (
    <LegalPageLayout locale={locale} title={page.title} backLabel={data.legal.backToHome}>
      {page.sections.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          {section.paragraphs?.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {section.bullets && (
            <ul>
              {section.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </LegalPageLayout>
  );
}
