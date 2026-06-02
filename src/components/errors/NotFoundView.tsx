import Link from "next/link";
import { getOtherLocale, getPortfolioDataByLocale } from "@/i18n/locale";
import type { Locale } from "@/types/portfolio";

type Props = {
  locale: Locale;
};

export function NotFoundView({ locale }: Props) {
  const copy = getPortfolioDataByLocale(locale).notFound;
  const otherLocale = getOtherLocale(locale);

  return (
    <main className="nf-page">
      <div className="nf-page__grid-bg" aria-hidden="true" />
      <div className="nf-page__glow" aria-hidden="true" />

      <div className="nf-page__inner">
        <nav className="nf-page__breadcrumb">
          <Link href={`/${locale}`} className="nf-page__back-link">
            <span className="nf-page__back-arrow">←</span>
            {copy.backToHome}
          </Link>
        </nav>

        <div className="nf-page__hero">
          <p className="nf-page__code" aria-hidden="true">
            {copy.title}
          </p>
          <div className="nf-page__divider" aria-hidden="true" />
          <h1 className="nf-page__heading">{copy.heading}</h1>
        </div>

        <p className="nf-page__description">{copy.description}</p>

        <div className="nf-page__actions">
          <Link href={`/${locale}`} className="nf-page__cta nf-page__cta--primary">
            {copy.backToHome}
          </Link>
          <Link href={`/${otherLocale}`} className="nf-page__cta nf-page__cta--secondary">
            {copy.otherLocaleLabel}
          </Link>
        </div>

        <p className="nf-page__url-hint" aria-label="URL actual">
          <span className="nf-page__url-prefix">URL</span>
          <span className="nf-page__url-path">{locale}/{copy.title.toLowerCase()}</span>
        </p>
      </div>
    </main>
  );
}
