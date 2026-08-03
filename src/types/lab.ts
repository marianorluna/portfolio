import type { ReactNode } from "react";
import type { Locale } from "./portfolio";

/**
 * Tipos de recurso soportados por el Lab. El "blog" del sitio vive aquí como
 * `nota`, no como una sección aparte.
 */
export const LAB_RESOURCE_TYPES = [
  "tutorial",
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
  /**
   * Duración estimada en minutos con requisitos ya instalados.
   * Se muestra en card/hero con `LabUiCopy.durationReadyLabel`.
   */
  durationMinutes?: number;
  tags: string[];
  /** Ruta pública de la card del bento en celdas ~cuadradas (`{slug}-grid.webp`, ~1:1). */
  coverImage: string;
  /** Texto alternativo de la card; si falta, se usa el título. */
  coverAlt?: string;
  /**
   * Ruta pública del hero y cover ancha del bento (`{slug}-portada.webp`, ~16:9).
   * En el índice se usa cuando la celda supera ~4/3 de aspect ratio.
   */
  heroImage?: string;
  /** Texto alternativo del hero; si falta, se usa `coverAlt` o el título. */
  heroAlt?: string;
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
    /** Minutos de lectura estimados a partir del cuerpo MDX (mismo valor que en la entrada). */
    readingMinutes: number;
  };

/** Recurso completo con el MDX ya compilado a elementos React (RSC). */
export type LabResource = {
  frontmatter: LabFrontmatter;
  locale: Locale;
  id: string;
  createdAt: string;
  updatedAt: string;
  content: ReactNode;
  /** Minutos de lectura estimados a partir del cuerpo MDX. */
  readingMinutes: number;
};

/** Tab del shell tutorial/guía (id debe coincidir con `<Section id="...">` en MDX). */
export type LabTocItem = {
  id: string;
  label: string;
};

/** Copy localizado del chrome del Lab (flyout 3D, índice, entrada). Vive en `data-*.json` → `lab.ui`. */
export type LabUiCopy = {
  flyoutCtaLabel: string;
  flyoutEmptyMessage: string;
  indexKicker: string;
  indexTitle: string;
  indexDescription: string;
  /** Crédito de portadas generadas con IA (índice y hero de entrada). */
  aiCoverCredit: string;
  indexEmptyMessage: string;
  filterAllLabel: string;
  /** Label cuando createdAt === updatedAt (p. ej. "Publicado"). */
  publishedLabel: string;
  /** Label cuando updatedAt > createdAt (p. ej. "Actualizado"). */
  updatedLabel: string;
  /**
   * Plantilla de duración estimada; usa `{minutes}` (p. ej. "~{minutes} min").
   */
  durationReadyLabel: string;
  /**
   * Plantilla de tiempo de lectura (notas); usa `{minutes}`
   * (p. ej. "~{minutes} min de lectura").
   */
  readingTimeLabel: string;
  backToLabLabel: string;
  /** Aria-label del botón subir al inicio en el shell de notas. */
  scrollToTopLabel: string;
  /** Aria-label del TOC sticky del shell tutorial. */
  tocAriaLabel: string;
  /** Tabs del shell tutorial/guía (ids deben coincidir con `<Section id="...">` en MDX). */
  tutorialToc: LabTocItem[];
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
  /**
   * Pie de feedback en tutoriales: lead + enlace al formulario + “o” + correo.
   * El email se toma de `ui.contactSocial` (id `email`).
   */
  tutorialContactLead: string;
  tutorialContactFormLabel: string;
  tutorialContactOr: string;
  typeLabel: Record<LabResourceType, string>;
  levelLabel: Record<LabResourceLevel, string>;
};

/** Placeholder visual del bento (aún no publicado). */
export type LabPlaceholderCard = {
  id: string;
  type: LabResourceType;
  size: LabCardSize;
  title: string;
  description: string;
  tags: string[];
};
