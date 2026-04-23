import * as THREE from "three";

export function setupScene(): THREE.Scene {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050505, 0.015);

  const gridHelper = new THREE.GridHelper(100, 50, 0x333333, 0x111111);
  gridHelper.position.y = -0.1;
  scene.add(gridHelper);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0x0070f3, 1.5);
  dirLight.position.set(20, 40, -20);
  scene.add(dirLight);

  const dirLight2 = new THREE.DirectionalLight(0x00e5ff, 1.0);
  dirLight2.position.set(-20, 20, 20);
  scene.add(dirLight2);

  return scene;
}
