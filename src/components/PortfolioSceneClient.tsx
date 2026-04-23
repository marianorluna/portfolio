"use client";

import dynamic from "next/dynamic";
import type { PortfolioData } from "@/types/portfolio";

const PortfolioScene = dynamic(
  () => import("./PortfolioScene").then(m => ({ default: m.PortfolioScene })),
  { ssr: false }
);

type Props = { data: PortfolioData };

export function PortfolioSceneClient({ data }: Props) {
  return <PortfolioScene data={data} />;
}
