"use client";

import dynamic from "next/dynamic";
import type { Locale, PortfolioData } from "@/types/portfolio";

const PortfolioScene = dynamic(
  () => import("./PortfolioScene").then(m => ({ default: m.PortfolioScene })),
  { ssr: false }
);

type Props = { data: PortfolioData; locale: Locale; initialProjectId?: string };

export function PortfolioSceneClient({ data, locale, initialProjectId }: Props) {
  return <PortfolioScene data={data} locale={locale} initialProjectId={initialProjectId} />;
}
