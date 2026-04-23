import type { PortfolioData } from "@/types/portfolio";
import rawData from "@/data/data.json";
import { PortfolioSceneClient } from "@/components/PortfolioSceneClient";

const data = rawData as PortfolioData;

export default function Home() {
  return <PortfolioSceneClient data={data} />;
}
