import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale } from "@/types/portfolio";
import { LabEntryNav } from "./LabEntryNav";
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
   * `tutorial`: shell interactivo (hero glow + TOC) para tutorial/guia.
   * `article` (default): header clásico con título y descripción.
   */
  variant?: "index" | "article" | "tutorial";
  /** Meta bajo el título (nivel, fecha, tags) — usado en tutorial/article. */
  meta?: ReactNode;
  /** Items de tabs de sección (solo `tutorial`). */
  tocItems?: LabTocItem[];
  tocAriaLabel?: string;
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
    return (
      <main className="lab-page lab-page--tutorial">
        <header className="lab-entry-hero">
          <div className="lab-entry-hero__glow" aria-hidden />
          {chrome}
          {kicker != null && <p className="lab-page__kicker">{kicker}</p>}
          <h1 className="lab-entry-hero__title">{title}</h1>
          {description != null && (
            <p className="lab-entry-hero__description">{description}</p>
          )}
          {meta != null && <div className="lab-entry-hero__meta">{meta}</div>}
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
