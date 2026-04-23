import * as THREE from "three";

export type ViewPreset = "iso" | "top" | "front";

export interface CameraTarget {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
}

export function getViewTarget(preset: ViewPreset, offsetX: number): CameraTarget {
  const lookAt = new THREE.Vector3(offsetX, 10, 0);
  switch (preset) {
    case "iso":
      return { position: new THREE.Vector3(offsetX + 30, 30, 50), lookAt };
    case "top":
      return { position: new THREE.Vector3(offsetX, 80, 0.001), lookAt };
    case "front":
      return { position: new THREE.Vector3(offsetX, 10, 60), lookAt };
  }
}
