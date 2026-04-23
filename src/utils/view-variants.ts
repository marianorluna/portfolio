import * as THREE from "three";
import { FLOOR_HEIGHT } from "@/utils/building-model";

export type ViewPreset = "iso" | "top" | "front";

export interface CameraTarget {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
}

export type ViewTargetOptions = {
  /** Piso visibles al calcular el centro de encuadre (solo afecta ISO). */
  stackFloors?: number;
};

/** Misma luz/ángulo isométrico que (offset+30, 30, 50) - (x, 10, 0), colapsado hacia el objetivo. */
const ISO_OFFSET_FROM_FAR = new THREE.Vector3(30, 20, 50);
const ISO_OFFSET_SCALE = 0.75;

/**
 * Mira hacia el centro vertical de la pila: el tercio central de la malla
 * rellena el encuadre; base y remate se pierden.
 */
function isoTargetLookAtY(stackFloors: number): number {
  return (stackFloors * FLOOR_HEIGHT) / 2;
}

export function getViewTarget(
  preset: ViewPreset,
  offsetX: number,
  options?: ViewTargetOptions
): CameraTarget {
  const stackFloors = options?.stackFloors ?? 15;
  const lookYDefault = 10;
  const lookAt = new THREE.Vector3(offsetX, lookYDefault, 0);
  switch (preset) {
    case "iso": {
      const ly = isoTargetLookAtY(stackFloors);
      const isoLook = new THREE.Vector3(offsetX, ly, 0);
      const position = ISO_OFFSET_FROM_FAR.clone()
        .multiplyScalar(ISO_OFFSET_SCALE)
        .add(isoLook);
      return { position, lookAt: isoLook };
    }
    case "top":
      return { position: new THREE.Vector3(offsetX, 80, 0.001), lookAt };
    case "front":
      return { position: new THREE.Vector3(offsetX, 10, 60), lookAt };
  }
}
