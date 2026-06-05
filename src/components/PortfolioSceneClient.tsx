"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import type { Locale, PortfolioData } from "@/types/portfolio";

const importPortfolioScene = () =>
  import("./PortfolioScene").then((m) => ({ default: m.PortfolioScene }));

const PortfolioScene = dynamic(importPortfolioScene, {
  ssr: false,
  loading: () => null,
});

type Props = { data: PortfolioData; locale: Locale; initialProjectId?: string };

export function PortfolioSceneClient({ data, locale, initialProjectId }: Props) {
  useEffect(() => {
    void importPortfolioScene();
  }, []);

  return <PortfolioScene data={data} locale={locale} initialProjectId={initialProjectId} />;
}
