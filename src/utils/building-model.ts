import * as THREE from "three";

const HOTSPOT_MAP: Record<string, string> = {
  "main-tower": "bim-structure",
  structure: "bim-structure",
  podium: "bim-structure",
  "wing-left": "dashboard-app",
  roof: "about",
  facade: "facade"
};

function getHotspot(id: string): string | null {
  return HOTSPOT_MAP[id] ?? null;
}

function withBuildingTag(
  obj: THREE.Object3D,
  renderRole: "wire" | "wire-decor" | "solid" | "glass"
): void {
  obj.userData = { ...obj.userData, building: true, renderRole };
}

function addBox(
  scene: THREE.Scene,
  meshes: THREE.Object3D[],
  x: number,
  y: number,
  z: number,
  w: number,
  h: number,
  d: number,
  color: number,
  id: string,
  type: string
): void {
  const geo = new THREE.BoxGeometry(w, h, d);
  const edges = new THREE.EdgesGeometry(geo);
  const mat = new THREE.LineBasicMaterial({ color, linewidth: 1 });
  const wireframe = new THREE.LineSegments(edges, mat);
  wireframe.position.set(x, y, z);
  wireframe.userData = { id, type, hotspot: getHotspot(id) };
  withBuildingTag(wireframe, "wire");
  scene.add(wireframe);
  meshes.push(wireframe);

  const solidGeo = new THREE.BoxGeometry(w, h, d);
  const solidMat = new THREE.MeshBasicMaterial({ visible: false, side: THREE.FrontSide });
  const solid = new THREE.Mesh(solidGeo, solidMat);
  solid.position.set(x, y, z);
  solid.userData = { id, type, hotspot: getHotspot(id) };
  withBuildingTag(solid, "solid");
  scene.add(solid);
  meshes.push(solid);
}

function addEdgesOnly(
  scene: THREE.Scene,
  x: number,
  y: number,
  z: number,
  w: number,
  h: number,
  d: number,
  color: number
): void {
  const geo = new THREE.BoxGeometry(w, h, d);
  const edges = new THREE.EdgesGeometry(geo);
  const mat = new THREE.LineBasicMaterial({ color, opacity: 0.3, transparent: true });
  const wf = new THREE.LineSegments(edges, mat);
  wf.position.set(x, y, z);
  withBuildingTag(wf, "wire-decor");
  scene.add(wf);
}

function addGlass(
  scene: THREE.Scene,
  meshes: THREE.Object3D[],
  x: number,
  y: number,
  z: number,
  w: number,
  h: number,
  d: number,
  color: number,
  hotspot: string
): void {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshBasicMaterial({
    color,
    opacity: 0.07,
    transparent: true,
    side: THREE.DoubleSide
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.userData = { hotspot };
  withBuildingTag(mesh, "glass");
  scene.add(mesh);
  meshes.push(mesh);

  const edgesGeo = new THREE.EdgesGeometry(geo);
  const edgeMat = new THREE.LineBasicMaterial({ color, opacity: 0.6, transparent: true });
  const wf = new THREE.LineSegments(edgesGeo, edgeMat);
  wf.position.set(x, y, z);
  withBuildingTag(wf, "wire");
  scene.add(wf);
}

function addThinLine(
  scene: THREE.Scene,
  x1: number,
  y1: number,
  z1: number,
  x2: number,
  y2: number,
  z2: number,
  color: number
): void {
  const geo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(x1, y1, z1),
    new THREE.Vector3(x2, y2, z2)
  ]);
  const mat = new THREE.LineBasicMaterial({ color, opacity: 0.5, transparent: true });
  const line = new THREE.Line(geo, mat);
  withBuildingTag(line, "wire-decor");
  scene.add(line);
}

export function buildBuilding(scene: THREE.Scene, meshes: THREE.Object3D[]): void {
  const blue = 0x4a9eff;
  const purple = 0x8b5cf6;
  const dimBlue = 0x1a3a6e;

  addBox(scene, meshes, 0, 0, 0, 4, 10, 3, blue, "main-tower", "structure");

  for (let i = -4; i <= 4; i += 2) {
    addEdgesOnly(scene, 0, i, 0, 4.02, 0.05, 3.02, dimBlue);
  }

  addBox(scene, meshes, 0, -4.5, 0, 6, 1, 5, dimBlue, "podium", "structure");
  addEdgesOnly(scene, 0, -4.5, 0, 6, 1, 5, blue);

  addBox(scene, meshes, -4, -2, 0, 2, 6, 3, dimBlue, "wing-left", "structure");
  addEdgesOnly(scene, -4, -2, 0, 2, 6, 3, purple);

  // Keep this module detached from the main tower to avoid coplanar overlap in solid mode.
  addGlass(scene, meshes, 2.85, -2, 0, 1.5, 4, 3, blue, "dashboard-app");

  addBox(scene, meshes, 0, 5.5, 0, 2, 1, 2, blue, "roof", "roof");

  const panelMat = new THREE.MeshBasicMaterial({
    color: 0x0a1830,
    opacity: 0.5,
    transparent: true,
    side: THREE.FrontSide
  });

  for (let y = -3.5; y <= 3.5; y += 2) {
    for (let x = -1.5; x <= 1.5; x += 1) {
      const pg = new THREE.PlaneGeometry(0.7, 1.4);
      const pm = new THREE.Mesh(pg, panelMat.clone());
      pm.position.set(x, y, 1.52);
      pm.userData = { type: "facade", hotspot: "facade" };
      withBuildingTag(pm, "solid");
      scene.add(pm);
      meshes.push(pm);

      const wg = new THREE.PlaneGeometry(0.6, 1.2);
      const wm = new THREE.MeshBasicMaterial({ color: 0x4a9eff, opacity: 0.08, transparent: true });
      const windowPanel = new THREE.Mesh(wg, wm);
      windowPanel.position.set(x, y, 1.53);
      withBuildingTag(windowPanel, "glass");
      scene.add(windowPanel);
    }
  }

  addThinLine(scene, -2, -5, 1.5, -2, 5.5, 1.5, blue);
  addThinLine(scene, 2, -5, 1.5, 2, 5.5, 1.5, blue);
  addThinLine(scene, -2, -5, -1.5, -2, 5.5, -1.5, dimBlue);
  addThinLine(scene, 2, -5, -1.5, 2, 5.5, -1.5, dimBlue);
}
