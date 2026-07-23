import type { ReactNode } from "react";
import type { Locale } from "./portfolio";

/**
 * Tipos de recurso soportados por el Lab. El "blog" del sitio vive aquí como
 * `nota`, no como una sección aparte.
 */
export const LAB_RESOURCE_TYPES = [
  "tutorial",
  "guia",
  "checklist",
  "infografia",
  "dashboard",
  "nota",
] as const;
export type LabResourceType = (typeof LAB_RESOURCE_TYPES)[number];

export const LAB_RESOURCE_LEVELS = ["intro", "intermedio"] as const;
export type LabResourceLevel = (typeof LAB_RESOURCE_LEVELS)[number];

/** Frontmatter validado de un archivo `.mdx` bajo `content/lab/{locale}`. */
export type LabFrontmatter = {
  title: string;
  description: string;
  type: LabResourceType;
  /** Debe coincidir con el nombre de archivo (sin extensión). */
  slug: string;
  level: LabResourceLevel;
  tags: string[];
  /** Fecha ISO `YYYY-MM-DD`. */
  publishedAt: string;
  /** Si es `true`, el recurso no se lista ni se publica. */
  draft?: boolean;
};

/** Metadata ligera de un recurso, sin el contenido MDX compilado. */
export type LabResourceSummary = LabFrontmatter & { locale: Locale };

/** Recurso completo con el MDX ya compilado a elementos React (RSC). */
export type LabResource = {
  frontmatter: LabFrontmatter;
  locale: Locale;
  content: ReactNode;
};

/** Copy localizado del chrome del Lab (rail, índice, entrada). No vive en `data-*.json`. */
export type LabUiCopy = {
  navKicker: string;
  flyoutCtaLabel: string;
  flyoutEmptyMessage: string;
  indexKicker: string;
  indexTitle: string;
  indexDescription: string;
  indexEmptyMessage: string;
  filterAllLabel: string;
  publishedLabel: string;
  backToLabLabel: string;
  typeLabel: Record<LabResourceType, string>;
  levelLabel: Record<LabResourceLevel, string>;
};
