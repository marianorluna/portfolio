import * as THREE from "three";
import { SCENE_BACKGROUND } from "@/config/scene-theme";
import { createInfiniteGrid, type InfiniteGridUpdateOptions } from "@/utils/infinite-grid";

const FOG_DENSITY = 0.012;

export function setupScene(): {
  scene: THREE.Scene;
  updateInfiniteGrid: (
    camera: THREE.Camera,
    opts?: Partial<InfiniteGridUpdateOptions>
  ) => void;
  disposeInfiniteGrid: () => void;
} {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(SCENE_BACKGROUND);
  scene.fog = new THREE.FogExp2(SCENE_BACKGROUND, FOG_DENSITY);

  const { mesh: gridMesh, horizon: horizonLine, update: updateInfiniteGrid, dispose: disposeInfiniteGrid } =
    createInfiniteGrid({ cellSize: 2.0, fogDensity: FOG_DENSITY });
  scene.add(gridMesh);
  scene.add(horizonLine);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.42);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0x0070f3, 1.5);
  dirLight.position.set(20, 40, -20);
  scene.add(dirLight);

  const dirLight2 = new THREE.DirectionalLight(0x00e5ff, 1.0);
  dirLight2.position.set(-20, 20, 20);
  scene.add(dirLight2);

  return { scene, updateInfiniteGrid, disposeInfiniteGrid };
}
