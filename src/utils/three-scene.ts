import * as THREE from "three";
import { SCENE_BACKGROUND } from "@/config/scene-theme";
import { createInfiniteGrid, type InfiniteGridUpdateOptions } from "@/utils/infinite-grid";

const FOG_DENSITY = 0.012;

export type SceneLights = {
  ambient:  THREE.AmbientLight;
  dir1:     THREE.DirectionalLight;
  dir2:     THREE.DirectionalLight;
  dir3:     THREE.DirectionalLight;
  fillA:    THREE.DirectionalLight;
  fillB:    THREE.DirectionalLight;
};

export function setupScene(): {
  scene:              THREE.Scene;
  lights:             SceneLights;
  updateInfiniteGrid: (camera: THREE.Camera, opts?: Partial<InfiniteGridUpdateOptions>) => void;
  setGridColors:      (major: number, minor: number, fog: number) => void;
  disposeInfiniteGrid: () => void;
} {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(SCENE_BACKGROUND);
  scene.fog = new THREE.FogExp2(SCENE_BACKGROUND, FOG_DENSITY);

  const {
    mesh: gridMesh,
    horizon: horizonLine,
    update: updateInfiniteGrid,
    setColors: setGridColors,
    dispose: disposeInfiniteGrid,
  } = createInfiniteGrid({ cellSize: 2.0, fogDensity: FOG_DENSITY });
  scene.add(gridMesh);
  scene.add(horizonLine);

  const ambient  = new THREE.AmbientLight(0xffffff, 0.42);
  scene.add(ambient);

  const dir1 = new THREE.DirectionalLight(0x0070f3, 1.5);
  dir1.position.set(20, 40, -20);
  scene.add(dir1);

  const dir2 = new THREE.DirectionalLight(0x00e5ff, 1.0);
  dir2.position.set(-20, 20, 20);
  scene.add(dir2);

  const dir3 = new THREE.DirectionalLight(0x00e5ff, 1.1);
  dir3.position.set(20, 20, -20);
  scene.add(dir3);

  const fillA = new THREE.DirectionalLight(0xaedbff, 0.25);
  fillA.position.set(-45, 32, -50);
  scene.add(fillA);

  const fillB = new THREE.DirectionalLight(0xaedbff, 0.20);
  fillB.position.set(45, 30, 50);
  scene.add(fillB);

  return {
    scene,
    lights: { ambient, dir1, dir2, dir3, fillA, fillB },
    updateInfiniteGrid,
    setGridColors,
    disposeInfiniteGrid,
  };
}
