"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { LAB_ICONS, type LabIconName } from "./DemoKit";
import { ReqCardView } from "./ReqCard";
import { ToolCardView } from "./ToolCard";

export type { LabIconName } from "./DemoKit";

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

type IntroCardProps = {
  icon?: LabIconName;
  title: string;
  children: ReactNode;
};

/** Card a ancho completo para la intro de una sección (fuera del grid). */
export function IntroCard({ icon = "book", title, children }: IntroCardProps) {
  const Icon: LucideIcon | undefined = LAB_ICONS[icon];
  return (
    <ReqCardView icon={Icon} title={title} collapsible={false}>
      {children}
    </ReqCardView>
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
