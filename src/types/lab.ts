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

/** Tamaño de celda en el bento del índice. */
export const LAB_CARD_SIZES = ["sm", "md", "lg", "wide"] as const;
export type LabCardSize = (typeof LAB_CARD_SIZES)[number];

/** Frontmatter validado de un archivo `.mdx` bajo `content/lab/{locale}`. */
export type LabFrontmatter = {
  title: string;
  description: string;
  type: LabResourceType;
  /** Debe coincidir con el nombre de archivo (sin extensión). */
  slug: string;
  level: LabResourceLevel;
  tags: string[];
  /** Ruta pública de la portada (p. ej. `/lab/covers/mi-entrada.webp`). */
  coverImage: string;
  /** Texto alternativo de la portada; si falta, se usa el título. */
  coverAlt?: string;
  /** Span en el bento del índice; por defecto `md`. */
  size?: LabCardSize;
  /** Si es `true`, el recurso no se lista ni se publica. */
  draft?: boolean;
};

/**
 * Entrada del registro central `content/lab/index.json`.
 * Fechas en `YYYY-MM`; `id` opaco (ULID/UUID o string numérico), no derivado del slug.
 */
export type LabIndexEntry = {
  id: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
};

/** Metadata ligera de un recurso, sin el contenido MDX compilado. */
export type LabResourceSummary = LabFrontmatter &
  LabIndexEntry & {
    locale: Locale;
  };

/** Recurso completo con el MDX ya compilado a elementos React (RSC). */
export type LabResource = {
  frontmatter: LabFrontmatter;
  locale: Locale;
  id: string;
  createdAt: string;
  updatedAt: string;
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
  /** Label cuando createdAt === updatedAt (p. ej. "Publicado"). */
  publishedLabel: string;
  /** Label cuando updatedAt > createdAt (p. ej. "Actualizado"). */
  updatedLabel: string;
  backToLabLabel: string;
  /** Aria-label del TOC sticky del shell tutorial. */
  tocAriaLabel: string;
  /** CTA tras revelar la card en touch (móvil/tablet). */
  openCtaLabel: string;
  comingSoonLabel: string;
  nextPageLabel: string;
  prevPageLabel: string;
  /** Abrir el controlador de páginas (móvil/tablet). */
  pagesNavOpenLabel: string;
  /** Cerrar el controlador de páginas (móvil/tablet). */
  pagesNavCloseLabel: string;
  /** Sin resultados para el filtro activo. */
  filterEmptyMessage: string;
  settingsCloseLabel: string;
  /** Abrir el menú hamburguesa (móvil/tablet) en una entrada. */
  menuOpenLabel: string;
  /** Cerrar el menú hamburguesa (móvil/tablet) en una entrada. */
  menuCloseLabel: string;
  /** Kicker del panel a pantalla completa. */
  menuKicker: string;
  /** Título del panel a pantalla completa. */
  menuTitle: string;
  typeLabel: Record<LabResourceType, string>;
  levelLabel: Record<LabResourceLevel, string>;
};

/** Tonos de fondo para placeholders (bajo el velo gris). */
export const LAB_PLACEHOLDER_TONES = [
  "teal",
  "slate",
  "violet",
  "amber",
  "rose",
  "olive",
  "sky",
  "coral",
  "indigo",
  "mint",
] as const;
export type LabPlaceholderTone = (typeof LAB_PLACEHOLDER_TONES)[number];

/** Placeholder visual del bento (aún no publicado). */
export type LabPlaceholderCard = {
  id: string;
  type: LabResourceType;
  size: LabCardSize;
  title: string;
  description: string;
  tags: string[];
  tone: LabPlaceholderTone;
};
