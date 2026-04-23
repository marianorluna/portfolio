import * as THREE from "three";

export const FLOOR_HEIGHT = 2.5;

export interface FloorUserData {
  id: string;
  level: number;
  elevation: string;
  area: number;
  material: string;
  isHovered: boolean;
}

export function createBaseMaterial(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: 0x111111,
    metalness: 0.8,
    roughness: 0.2,
    transparent: true,
    opacity: 0.8,
  });
}

export function createLineMaterial(): THREE.LineBasicMaterial {
  return new THREE.LineBasicMaterial({
    color: 0x333333,
    transparent: true,
    opacity: 0.5,
  });
}

export function createFloor(
  i: number,
  baseMat: THREE.MeshPhysicalMaterial,
  lineMat: THREE.LineBasicMaterial
): { group: THREE.Group; mesh: THREE.Mesh } {
  const group = new THREE.Group();
  group.position.y = i * FLOOR_HEIGHT;
  group.name = `floor_${i}`;

  const angle = i * 0.15;
  const scale = 1 - i * 0.015;
  const slabH = FLOOR_HEIGHT * 0.8;

  // BoxGeometry es centrada: sin offset, la cota 0 (planta) cortaba el bloque a la mitad.
  const geom = new THREE.BoxGeometry(16 * scale, slabH, 16 * scale);
  const mesh = new THREE.Mesh(geom, baseMat.clone());
  mesh.position.y = slabH / 2;
  mesh.rotation.y = angle;

  const edges = new THREE.EdgesGeometry(geom);
  const line = new THREE.LineSegments(edges, lineMat.clone());
  mesh.add(line);

  const userData: FloorUserData = {
    id: `IfcSlab_FL${i.toString().padStart(2, "0")}`,
    level: i,
    elevation: (i * FLOOR_HEIGHT).toFixed(2),
    area: Math.round(16 * scale * (16 * scale)),
    material: "Concrete_C30/37",
    isHovered: false,
  };
  mesh.userData = userData;

  group.add(mesh);

  const coreGeom = new THREE.BoxGeometry(4, FLOOR_HEIGHT, 4);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a });
  const core = new THREE.Mesh(coreGeom, coreMat);
  core.position.y = FLOOR_HEIGHT / 2;
  group.add(core);

  // Pop-in animation
  group.scale.y = 0.001;
  group.userData.targetScaleY = 1;

  return { group, mesh };
}
