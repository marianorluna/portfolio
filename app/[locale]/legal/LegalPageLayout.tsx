import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale } from "@/types/portfolio";

type Props = {
  locale: Locale;
  title: string;
  backLabel: string;
  children: ReactNode;
};

export function LegalPageLayout({ locale, title, backLabel, children }: Props) {
  return (
    <main className="legal-page">
      <header className="legal-page__header">
        <Link href={`/${locale}`} className="legal-page__back">
          {backLabel}
        </Link>
        <h1>{title}</h1>
      </header>
      <article className="legal-page__content">{children}</article>
    </main>
  );
}
