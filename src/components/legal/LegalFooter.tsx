"use client";

import Link from "next/link";
import { getPortfolioDataByLocale } from "@/i18n/locale";
import type { Locale } from "@/types/portfolio";

type Props = {
  locale: Locale;
};

export function LegalFooter({ locale }: Props) {
  const legal = getPortfolioDataByLocale(locale).legal;
  return (
    <footer className="legal-footer" aria-label={legal.footerAriaLabel}>
      <Link href={`/${locale}/legal/aviso-legal`}>{legal.links.legalNotice}</Link>
      <Link href={`/${locale}/legal/privacidad`}>{legal.links.privacy}</Link>
      <Link href={`/${locale}/legal/cookies`}>{legal.links.cookies}</Link>
    </footer>
  );
}
