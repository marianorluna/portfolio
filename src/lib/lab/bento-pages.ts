/** Cards totales por slide (incluye hero en la primera). */
export const LAB_BENTO_PAGE_SIZE = 12;
/** Contenido (sin hero) que cabe en la primera slide (desktop/tablet). */
export const LAB_BENTO_FIRST_CONTENT = LAB_BENTO_PAGE_SIZE - 1;

export type LabBentoBreakpoint = "desktop" | "tablet" | "mobile";

type LabBentoCapacity = {
  /** Contenido (sin hero) en la primera slide. */
  firstContent: number;
  /** Cards por slide en páginas siguientes. */
  moreSize: number;
};

/**
 * Capacidad por breakpoint.
 * Desktop 5×3: 12 cards.
 * Tablet/móvil 2×4: hero + 6 en home; slides siguientes de 8.
 */
export const LAB_BENTO_CAPACITY: Record<LabBentoBreakpoint, LabBentoCapacity> = {
  desktop: { firstContent: LAB_BENTO_FIRST_CONTENT, moreSize: LAB_BENTO_PAGE_SIZE },
  tablet: { firstContent: 6, moreSize: 8 },
  mobile: { firstContent: 6, moreSize: 8 },
};

/** Tablet hasta iPad Pro (1024); móvil hasta 560. */
export const LAB_BENTO_TABLET_MAX = 1024;
export const LAB_BENTO_MOBILE_MAX = 560;

export function resolveLabBentoBreakpoint(width: number): LabBentoBreakpoint {
  if (width <= LAB_BENTO_MOBILE_MAX) return "mobile";
  if (width <= LAB_BENTO_TABLET_MAX) return "tablet";
  return "desktop";
}

export function getLabBentoPageCount(
  contentCount: number,
  breakpoint: LabBentoBreakpoint = "desktop"
): number {
  const { firstContent, moreSize } = LAB_BENTO_CAPACITY[breakpoint];
  if (contentCount <= firstContent) return 1;
  return 1 + Math.ceil((contentCount - firstContent) / moreSize);
}

export function getLabBentoPageItems<T>(
  content: T[],
  pageIndex: number,
  breakpoint: LabBentoBreakpoint = "desktop"
): T[] {
  const { firstContent, moreSize } = LAB_BENTO_CAPACITY[breakpoint];
  if (pageIndex <= 0) {
    return content.slice(0, firstContent);
  }
  const start = firstContent + (pageIndex - 1) * moreSize;
  return content.slice(start, start + moreSize);
}
