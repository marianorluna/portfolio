"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import type { Locale, PortfolioData } from "@/types/portfolio";
import type { LabResourceSummary, LabUiCopy } from "@/types/lab";

const importPortfolioScene = () =>
  import("./PortfolioScene").then((m) => ({ default: m.PortfolioScene }));

const PortfolioScene = dynamic(importPortfolioScene, {
  ssr: false,
  loading: () => null,
});

type Props = {
  data: PortfolioData;
  locale: Locale;
  initialProjectId?: string;
  /** Panel del rail abierto al montar (p. ej. deep-link `/contacto`). */
  initialActivePanel?: string;
  labItems: LabResourceSummary[];
  labCopy: LabUiCopy;
};

export function PortfolioSceneClient({
  data,
  locale,
  initialProjectId,
  initialActivePanel,
  labItems,
  labCopy,
}: Props) {
  useEffect(() => {
    void importPortfolioScene();
  }, []);

  return (
    <PortfolioScene
      data={data}
      locale={locale}
      initialProjectId={initialProjectId}
      initialActivePanel={initialActivePanel}
      labItems={labItems}
      labCopy={labCopy}
    />
  );
}
