import type * as THREE from "three";
import type { PortfolioData } from "@/types/portfolio";
import type { FloorUserData } from "@/utils/building-model";

export type ProjectItem = PortfolioData["projects"]["categories"][number]["items"][number];

/** Índice de planta (`level`) → id de proyecto en `data.json`. */
export const FLOOR_LEVEL_TO_PROJECT_ID: Readonly<Record<number, string>> = {
  2: "control-manager",
  4: "ribbon-revit",
  6: "lol-match",
  8: "stockearly",
  10: "visor-ifc",
  12: "data-extractor",
};

/** Colores de hover por proyecto (sin azul dominante). base / emissive / aristas */
export const PROJECT_HOTSPOT_COLORS: Readonly<
  Record<string, { base: number; emissive: number; line: number }>
> = {
  "control-manager": { base: 0x3a2208, emissive: 0xd97706, line: 0xfbbf24 },
  "ribbon-revit": { base: 0x052e16, emissive: 0x15803d, line: 0x4ade80 },
  "lol-match": { base: 0x3b0764, emissive: 0x9333ea, line: 0xe879f9 },
  stockearly: { base: 0x431407, emissive: 0xea580c, line: 0xfdba74 },
  "visor-ifc": { base: 0x042f2e, emissive: 0x0f766e, line: 0x5eead4 },
  "data-extractor": { base: 0x4c0519, emissive: 0xe11d48, line: 0xfda4af },
};

export type ProjectWithCategory = {
  project: ProjectItem;
  categoryLabel: string;
};

export function findProjectWithCategory(
  data: PortfolioData,
  projectId: string
): ProjectWithCategory | null {
  for (const cat of data.projects.categories) {
    const item = cat.items.find(p => p.id === projectId);
    if (item) {
      return { project: item, categoryLabel: cat.label };
    }
  }
  return null;
}

/** Asigna `projectId` en userData si el nivel tiene hotspot. */
export function tagMeshUserDataWithProject(mesh: THREE.Mesh, level: number): void {
  const pid = FLOOR_LEVEL_TO_PROJECT_ID[level];
  const ud = mesh.userData as FloorUserData;
  if (pid) {
    ud.projectId = pid;
  } else {
    delete ud.projectId;
  }
}
