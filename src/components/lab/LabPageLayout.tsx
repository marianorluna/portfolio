import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale } from "@/types/portfolio";
import { LabEntryNav } from "./LabEntryNav";
import { LabReadingChrome } from "./LabReadingChrome";
import { LabSectionTabs, type LabTocItem } from "./LabSectionTabs";
import type { LabSettingsCopy } from "./LabSettingsModal";

type Props = {
  locale: Locale;
  kicker?: string;
  title: string;
  description?: string;
  backToHomeLabel: string;
  backToLabLabel: string;
  /** `false` en el propio índice del Lab, para no enlazar a sí mismo. */
  showBackToLab?: boolean;
  /**
   * `index`: viewport completo sin chrome; el hero vive en el bento.
   * `tutorial`: shell interactivo (hero glow + TOC) para tutoriales.
   * `note`: shell de lectura (tipografía, featured image, progress).
   * `article` (default): header clásico con título y descripción.
   */
  variant?: "index" | "article" | "tutorial" | "note";
  /** Meta bajo el título (nivel, fecha, tags) — usado en tutorial/article/note. */
  meta?: ReactNode;
  /** Items de tabs de sección (solo `tutorial`). */
  tocItems?: LabTocItem[];
  tocAriaLabel?: string;
  /** Imagen de portada (hero tutorial o featured de nota). */
  heroImage?: string;
  /** Alt de la imagen destacada (notas). */
  heroAlt?: string;
  /** Crédito bajo la portada (p. ej. generada con IA). */
  heroCredit?: string;
  /** Aria-label del botón subir (solo `note`). */
  scrollToTopLabel?: string;
  /** Chrome móvil/tablet: menú + modal de ajustes. */
  settingsLabel?: string;
  menuOpenLabel?: string;
  menuCloseLabel?: string;
  menuKicker?: string;
  menuTitle?: string;
  settingsCopy?: LabSettingsCopy;
  children: ReactNode;
};

function EntryChrome({
  locale,
  backToHomeLabel,
  backToLabLabel,
  showBackToLab,
  settingsLabel,
  menuOpenLabel,
  menuCloseLabel,
  menuKicker,
  menuTitle,
  settingsCopy,
}: {
  locale: Locale;
  backToHomeLabel: string;
  backToLabLabel: string;
  showBackToLab: boolean;
  settingsLabel?: string;
  menuOpenLabel?: string;
  menuCloseLabel?: string;
  menuKicker?: string;
  menuTitle?: string;
  settingsCopy?: LabSettingsCopy;
}) {
  if (
    settingsLabel != null &&
    menuOpenLabel != null &&
    menuCloseLabel != null &&
    menuKicker != null &&
    menuTitle != null &&
    settingsCopy != null
  ) {
    return (
      <LabEntryNav
        locale={locale}
        backToHomeLabel={backToHomeLabel}
        backToLabLabel={backToLabLabel}
        showBackToLab={showBackToLab}
        settingsLabel={settingsLabel}
        menuOpenLabel={menuOpenLabel}
        menuCloseLabel={menuCloseLabel}
        menuKicker={menuKicker}
        menuTitle={menuTitle}
        settingsCopy={settingsCopy}
      />
    );
  }

  return (
    <nav className="lab-page__breadcrumbs" aria-label={backToHomeLabel}>
      <Link href={`/${locale}`} className="lab-page__back">
        {backToHomeLabel}
      </Link>
      {showBackToLab && (
        <>
          <span className="lab-page__breadcrumb-sep" aria-hidden>
            /
          </span>
          <Link href={`/${locale}/lab`} className="lab-page__back">
            {backToLabLabel}
          </Link>
        </>
      )}
    </nav>
  );
}

/** Layout compartido del Lab (índice y entradas), en la misma línea visual que `LegalPageLayout`. */
export function LabPageLayout({
  locale,
  kicker,
  title,
  description,
  backToHomeLabel,
  backToLabLabel,
  showBackToLab = true,
  variant = "article",
  meta,
  tocItems,
  tocAriaLabel = "Secciones",
  heroImage,
  heroAlt,
  heroCredit,
  scrollToTopLabel,
  settingsLabel,
  menuOpenLabel,
  menuCloseLabel,
  menuKicker,
  menuTitle,
  settingsCopy,
  children,
}: Props) {
  if (variant === "index") {
    return <main className="lab-page lab-page--index">{children}</main>;
  }

  const chrome = (
    <EntryChrome
      locale={locale}
      backToHomeLabel={backToHomeLabel}
      backToLabLabel={backToLabLabel}
      showBackToLab={showBackToLab}
      settingsLabel={settingsLabel}
      menuOpenLabel={menuOpenLabel}
      menuCloseLabel={menuCloseLabel}
      menuKicker={menuKicker}
      menuTitle={menuTitle}
      settingsCopy={settingsCopy}
    />
  );

  if (variant === "tutorial") {
    const hasCover = heroImage != null && heroImage.length > 0;
    return (
      <main className="lab-page lab-page--tutorial">
        <header
          className={["lab-entry-hero", hasCover ? "lab-entry-hero--has-cover" : ""]
            .filter(Boolean)
            .join(" ")}
        >
          {hasCover ? (
            <div className="lab-entry-hero__cover">
              <div className="lab-entry-hero__media" aria-hidden>
                <Image
                  src={heroImage}
                  alt=""
                  fill
                  priority
                  sizes="100vw"
                  className="lab-entry-hero__image"
                />
                <div className="lab-entry-hero__shade" />
              </div>
              {chrome}
            </div>
          ) : (
            <>
              <div className="lab-entry-hero__glow" aria-hidden />
              {chrome}
            </>
          )}
          <div className="lab-entry-hero__copy">
            {hasCover && heroCredit != null && heroCredit.length > 0 && (
              <p className="lab-entry-hero__credit">{heroCredit}</p>
            )}
            {kicker != null && <p className="lab-page__kicker">{kicker}</p>}
            <h1 className="lab-entry-hero__title">{title}</h1>
            {description != null && (
              <p className="lab-entry-hero__description">{description}</p>
            )}
            {meta != null && <div className="lab-entry-hero__meta">{meta}</div>}
          </div>
        </header>
        <article className="lab-page__content lab-page__content--tutorial">
          {tocItems != null && tocItems.length > 0 ? (
            <LabSectionTabs items={tocItems} ariaLabel={tocAriaLabel}>
              {children}
            </LabSectionTabs>
          ) : (
            children
          )}
        </article>
      </main>
    );
  }

  if (variant === "note") {
    const hasFeatured = heroImage != null && heroImage.length > 0;
    const featuredAlt = heroAlt != null && heroAlt.length > 0 ? heroAlt : title;

    return (
      <main className="lab-page lab-page--note">
        {scrollToTopLabel != null && scrollToTopLabel.length > 0 && (
          <LabReadingChrome scrollToTopLabel={scrollToTopLabel} />
        )}
        <header className="lab-page__header lab-page__header--note">
          {chrome}
          <div className="lab-note-header__copy">
            {kicker != null && <p className="lab-page__kicker">{kicker}</p>}
            <h1 className="lab-note-header__title">{title}</h1>
            {description != null && (
              <p className="lab-page__description lab-note-header__description">
                {description}
              </p>
            )}
            {meta != null && <div className="lab-note-header__meta">{meta}</div>}
          </div>
          {hasFeatured && (
            <figure className="lab-note-featured">
              <div className="lab-note-featured__media">
                <Image
                  src={heroImage}
                  alt={featuredAlt}
                  fill
                  priority
                  sizes="(max-width: 720px) 100vw, 680px"
                  className="lab-note-featured__image"
                />
              </div>
              {heroCredit != null && heroCredit.length > 0 && (
                <figcaption className="lab-note-featured__credit">{heroCredit}</figcaption>
              )}
            </figure>
          )}
        </header>
        <article className="lab-page__content lab-page__content--note">{children}</article>
      </main>
    );
  }

  return (
    <main className="lab-page">
      <header className="lab-page__header">
        {chrome}
        {kicker != null && <p className="lab-page__kicker">{kicker}</p>}
        <h1>{title}</h1>
        {description != null && <p className="lab-page__description">{description}</p>}
        {meta != null && <div className="lab-entry-hero__meta">{meta}</div>}
      </header>
      <article className="lab-page__content">{children}</article>
    </main>
  );
}
