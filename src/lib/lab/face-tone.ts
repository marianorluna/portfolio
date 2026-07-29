import type { LabResourceType } from "@/types/lab";

/** Tonos de la cara trasera del flip (tokens del tema claro/oscuro). */
export const LAB_FACE_TONES = ["ink", "cyan", "blue", "slate", "frost"] as const;
export type LabFaceTone = (typeof LAB_FACE_TONES)[number];

const TYPE_FACE_TONE: Record<LabResourceType, LabFaceTone> = {
  tutorial: "cyan",
  checklist: "slate",
  infografia: "frost",
  dashboard: "ink",
  nota: "blue",
};

/** Asigna un fondo sólido de tema según el tipo de recurso. */
export function labFaceToneForType(type: LabResourceType): LabFaceTone {
  return TYPE_FACE_TONE[type];
}
