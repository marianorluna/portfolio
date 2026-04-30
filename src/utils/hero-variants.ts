import * as THREE from "three";
import type { ViewPreset } from "@/utils/view-variants";
import { FLOOR_HEIGHT } from "@/utils/building-model";

export type HeroCameraMode = "perspective" | "orthographic";
export type HeroDeviceBucket = "desktop" | "tablet" | "mobile";
export type HeroAutoRotateSpeedByDevice = Readonly<Record<HeroDeviceBucket, number>>;

export interface HeroStartupVariant {
  readonly id: number;
  /** Modo de cámara a activar en el hero inicial. */
  readonly cameraMode: HeroCameraMode;
  /**
   * Vista reportada en los botones de UI y como contexto de clamp/polar-lock.
   * null = cámara libre, ningún botón activo (ej. contra-picado personalizado).
   */
  readonly view: ViewPreset | null;
  /** Nivel de velocidad de autorotación (1–10, igual escala que el slider de la UI). */
  readonly autoRotateSpeed: number;
  /** Velocidad inicial opcional por dispositivo (desktop/tablet/mobile). */
  readonly autoRotateSpeedByDevice?: HeroAutoRotateSpeedByDevice;
  /**
   * Sobreescribe `getViewTarget` para este preset.
   * Si no se define, se usa `getViewTarget(view ?? "iso", bX, opts)`.
   */
  readonly getCamera?: (
    bX: number,
    stackFloors: number
  ) => { position: THREE.Vector3; lookAt: THREE.Vector3 };
}

export const HERO_VARIANTS: readonly HeroStartupVariant[] = [
  // ── 0: Perspectiva ISO clásica (posición por defecto original) ────────────
  {
    id: 0,
    cameraMode: "perspective",
    view: "iso",
    autoRotateSpeed: 2,
  },
  // ── 1: Ortográfica alzado (frontal), rotando ──────────────────────────────
  {
    id: 1,
    cameraMode: "orthographic",
    view: "front",
    autoRotateSpeed: 5,
  },
  // ── 2: Ortográfica planta (top-down), rotando ─────────────────────────────
  {
    id: 2,
    cameraMode: "orthographic",
    view: "top",
    autoRotateSpeed: 3,
    autoRotateSpeedByDevice: {
      desktop: 1,
      tablet: 3,
      mobile: 4,
    },
    getCamera: (bX, stackFloors) => {
      void stackFloors;
      const lookAt = new THREE.Vector3(bX, 10, 0);
      return {
        position: new THREE.Vector3(bX, 50, 0.001), // más bajo que 80 = más cerca
        lookAt,
      };
    },
  },
  // ── 3: Perspectiva contra-picado (de abajo hacia arriba), rotando ─────────
  {
    id: 3,
    cameraMode: "perspective",
    view: null,
    autoRotateSpeed: 3,
    getCamera: (bX: number, stackFloors: number) => {
      const position = new THREE.Vector3(bX + 5, 4, 22);
      const lookAt   = new THREE.Vector3(bX, stackFloors * FLOOR_HEIGHT * 0.75, 0);
      return { position, lookAt };
    },
  },
] as const;

/**
 * Elige (o reutiliza) la variante del hero. Persiste en `localStorage` con TTL de 24 h:
 * mientras el registro exista y no haya vencido, se repite el mismo encuadre; al cumplirse
 * el plazo, la próxima carga toma otra al azar.
 */
export function pickHeroVariant(): HeroStartupVariant {
  const fixedVariant = HERO_VARIANTS.find((variant) => variant.id === 2);
  return fixedVariant ?? HERO_VARIANTS[0];
}
