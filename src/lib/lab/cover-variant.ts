/**
 * Umbral a partir del cual la celda del bento se considera ancha
 * (p. ej. span 2 columnas o fill compacto a ancho completo).
 * Por debajo → cover cuadrada (`*-grid`); por encima → portada (`*-portada`).
 */
export const LAB_BENTO_WIDE_ASPECT_RATIO = 4 / 3;

export type LabBentoCoverVariant = "square" | "wide";

/** Strategy: elige variante de cover según aspect ratio real de la celda. */
export function resolveLabBentoCoverVariant(
  aspectRatio: number,
  hasWideCover: boolean,
  threshold: number = LAB_BENTO_WIDE_ASPECT_RATIO
): LabBentoCoverVariant {
  if (hasWideCover && aspectRatio >= threshold) return "wide";
  return "square";
}

/** Src efectivo para la card del bento. */
export function resolveLabBentoCoverSrc(options: {
  coverImage: string;
  wideCoverImage?: string;
  aspectRatio: number;
}): string {
  const { coverImage, wideCoverImage, aspectRatio } = options;
  const variant = resolveLabBentoCoverVariant(
    aspectRatio,
    wideCoverImage != null && wideCoverImage.length > 0
  );
  return variant === "wide" && wideCoverImage != null
    ? wideCoverImage
    : coverImage;
}
