import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { CookieBanner } from "@/components/legal/CookieBanner";
import { PortfolioSceneLoadGateProvider } from "@/components/portfolio-scene-load/PortfolioSceneLoadGate";
import { isLocale } from "@/i18n/locale";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <PortfolioSceneLoadGateProvider locale={locale}>
      {children}
      <CookieBanner locale={locale} />
    </PortfolioSceneLoadGateProvider>
  );
}
