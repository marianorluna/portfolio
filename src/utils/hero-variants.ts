import * as THREE from "three";
import { getViewTarget, type ViewPreset } from "@/utils/view-variants";
import { FLOOR_HEIGHT } from "@/utils/building-model";

export type HeroCameraMode = "perspective" | "orthographic";

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
    autoRotateSpeed: 4,
  },
  // ── 1: Ortográfica alzado (frontal), rotando ──────────────────────────────
  {
    id: 1,
    cameraMode: "orthographic",
    view: "front",
    autoRotateSpeed: 6,
  },
  // ── 2: Ortográfica planta (top-down), rotando ─────────────────────────────
  {
    id: 2,
    cameraMode: "orthographic",
    view: "top",
    autoRotateSpeed: 2,
    getCamera: (bX, _stackFloors) => {
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
    autoRotateSpeed: 4,
    getCamera: (bX: number, stackFloors: number) => {
      const midY = (stackFloors * FLOOR_HEIGHT) / 2;
      const position = new THREE.Vector3(bX + 5, 4, 22);
      const lookAt   = new THREE.Vector3(bX, stackFloors * FLOOR_HEIGHT * 0.75, 0);
      return { position, lookAt };
    },
  },
] as const;

const STORAGE_KEY = "portfolio-hero-variant";
/** 24 h; pasado este tiempo se elige otra variante al azar. */
const HERO_VARIANT_TTL_MS = 24 * 60 * 60 * 1000;

type HeroVariantStored = {
  idx: number;
  at: number;
};

function isValidIdx(idx: number): boolean {
  return Number.isInteger(idx) && idx >= 0 && idx < HERO_VARIANTS.length;
}

function readStoredPayload(): HeroVariantStored | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw == null) return null;
    const p = JSON.parse(raw) as unknown;
    if (p == null || typeof p !== "object") return null;
    const o = p as Record<string, unknown>;
    const idx = o.idx;
    const at = o.at;
    if (typeof idx !== "number" || typeof at !== "number") return null;
    if (!isValidIdx(idx)) return null;
    if (!Number.isFinite(at) || at < 0) return null;
    return { idx, at };
  } catch {
    return null;
  }
}

/**
 * Migra un valor plano "0"…"3" (sessionStorage de la implementación previa) a
 * localStorage con TTL, para no forzar a todos a una nueva lotería inmediatamente.
 */
function migrateFromLegacySessionStorageIfNeeded(): void {
  if (typeof window === "undefined") return;
  try {
    if (window.localStorage.getItem(STORAGE_KEY) != null) return;
    const legacy = window.sessionStorage.getItem(STORAGE_KEY);
    if (legacy == null) return;
    const idx = parseInt(legacy, 10);
    if (!isValidIdx(idx)) return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ idx, at: Date.now() } satisfies HeroVariantStored)
    );
  } catch {
    /* private mode / storage full */
  }
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

function persistNewVariantIdx(idx: number): void {
  if (typeof window === "undefined") return;
  try {
    const payload: HeroVariantStored = { idx, at: Date.now() };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Elige (o reutiliza) la variante del hero. Persiste en `localStorage` con TTL de 24 h:
 * mientras el registro exista y no haya vencido, se repite el mismo encuadre; al cumplirse
 * el plazo, la próxima carga toma otra al azar.
 */
export function pickHeroVariant(): HeroStartupVariant {
  if (typeof window === "undefined") return HERO_VARIANTS[0];

  migrateFromLegacySessionStorageIfNeeded();

  const payload = readStoredPayload();
  if (payload != null) {
    const age = Date.now() - payload.at;
    if (age >= 0 && age < HERO_VARIANT_TTL_MS) {
      return HERO_VARIANTS[payload.idx];
    }
  }

  const idx = Math.floor(Math.random() * HERO_VARIANTS.length);
  persistNewVariantIdx(idx);
  return HERO_VARIANTS[idx];
}
