import * as THREE from "three";
import type { Hotspot } from "@/types/portfolio";
import { buildBuilding } from "@/utils/building-model";

function createHotspotObjects(
  scene: THREE.Scene,
  meshes: THREE.Object3D[],
  hotspots: Hotspot[]
): void {
  hotspots.forEach(h => {
    const geo = new THREE.SphereGeometry(0.12, 8, 8);
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(h.color) });
    const sphere = new THREE.Mesh(geo, mat);
    sphere.position.set(h.worldPos.x, h.worldPos.y, h.worldPos.z);
    sphere.userData = { hotspot: h.id, isHotspot: true };
    scene.add(sphere);
    meshes.push(sphere);

    const ringGeo = new THREE.RingGeometry(0.18, 0.22, 16);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(h.color),
      opacity: 0.4,
      transparent: true,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(h.worldPos.x, h.worldPos.y, h.worldPos.z);
    ring.userData = { ring: true, color: h.color };
    scene.add(ring);
  });
}

export function buildSceneObjects(
  scene: THREE.Scene,
  meshes: THREE.Object3D[],
  hotspots: Hotspot[]
): void {
  const gridHelper = new THREE.GridHelper(20, 20, 0x1a3a6e, 0x0d1f3d);
  gridHelper.position.y = -4;
  scene.add(gridHelper);

  const groundGeo = new THREE.PlaneGeometry(20, 20);
  const groundMat = new THREE.MeshBasicMaterial({ color: 0x030810, opacity: 0.6, transparent: true });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  // Keep ground slightly below grid to prevent coplanar z-fighting flicker.
  ground.position.y = -4.02;
  scene.add(ground);

  buildBuilding(scene, meshes);
  createHotspotObjects(scene, meshes, hotspots);
}
