import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale } from "@/types/portfolio";

type Props = {
  locale: Locale;
  kicker?: string;
  title: string;
  description?: string;
  backToHomeLabel: string;
  backToLabLabel: string;
  /** `false` en el propio índice del Lab, para no enlazar a sí mismo. */
  showBackToLab?: boolean;
  children: ReactNode;
};

/** Layout compartido del Lab (índice y entradas), en la misma línea visual que `LegalPageLayout`. */
export function LabPageLayout({
  locale,
  kicker,
  title,
  description,
  backToHomeLabel,
  backToLabLabel,
  showBackToLab = true,
  children,
}: Props) {
  return (
    <main className="lab-page">
      <header className="lab-page__header">
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
        {kicker != null && <p className="lab-page__kicker">{kicker}</p>}
        <h1>{title}</h1>
        {description != null && <p className="lab-page__description">{description}</p>}
      </header>
      <article className="lab-page__content">{children}</article>
    </main>
  );
}
