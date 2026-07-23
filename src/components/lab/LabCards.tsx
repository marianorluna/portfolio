import type { LucideIcon } from "lucide-react";
import {
  Boxes,
  Code2,
  Cuboid,
  Palette,
  Search,
  Terminal,
} from "lucide-react";
import type { ReactNode } from "react";
import { ReqCardView } from "./ReqCard";
import { ToolCardView } from "./ToolCard";

/** Iconos permitidos en MDX por nombre (string), sin pasar componentes. */
const LAB_ICONS = {
  python: Terminal,
  cuboid: Cuboid,
  search: Search,
  boxes: Boxes,
  palette: Palette,
  code: Code2,
} as const;

export type LabIconName = keyof typeof LAB_ICONS;

type ReqCardProps = {
  icon?: LabIconName;
  title: string;
  children: ReactNode;
};

/** Wrapper MDX de requisito: resuelve `icon` string → LucideIcon. */
export function ReqCard({ icon, title, children }: ReqCardProps) {
  const Icon: LucideIcon | undefined = icon != null ? LAB_ICONS[icon] : undefined;
  return (
    <ReqCardView icon={Icon} title={title}>
      {children}
    </ReqCardView>
  );
}

type ToolCardProps = {
  icon?: LabIconName;
  title: string;
  tools?: string[];
  children: ReactNode;
};

/** Wrapper MDX de caso de uso. */
export function ToolCard({ icon, title, tools, children }: ToolCardProps) {
  const Icon: LucideIcon | undefined = icon != null ? LAB_ICONS[icon] : undefined;
  return (
    <ToolCardView icon={Icon} title={title} tools={tools}>
      {children}
    </ToolCardView>
  );
}

type CardGridProps = {
  variant?: "req" | "tool";
  children: ReactNode;
};

/** Grid para agrupar ReqCard / ToolCard en el MDX. */
export function CardGrid({ variant = "req", children }: CardGridProps) {
  return (
    <div className={variant === "tool" ? "lab-tool-grid" : "lab-req-grid"}>
      {children}
    </div>
  );
}
