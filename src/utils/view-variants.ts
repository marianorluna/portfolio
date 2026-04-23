import * as THREE from "three";

export type ViewMode = "wireframe" | "solid";

type BuildingRenderRole = "wire" | "wire-decor" | "solid" | "glass";

function setMaterialVisible(material: THREE.Material | THREE.Material[], visible: boolean): void {
  if (Array.isArray(material)) {
    material.forEach(m => {
      m.visible = visible;
    });
    return;
  }
  material.visible = visible;
}

function setMaterialOpacity(material: THREE.Material | THREE.Material[], opacity: number): void {
  if (Array.isArray(material)) {
    material.forEach(m => {
      m.transparent = opacity < 1;
      m.opacity = opacity;
      m.depthWrite = opacity >= 1;
    });
    return;
  }
  material.transparent = opacity < 1;
  material.opacity = opacity;
  material.depthWrite = opacity >= 1;
}

function setMaterialWireframe(material: THREE.Material | THREE.Material[], wireframe: boolean): void {
  if (Array.isArray(material)) {
    material.forEach(m => {
      if (m instanceof THREE.MeshBasicMaterial) m.wireframe = wireframe;
    });
    return;
  }
  if (material instanceof THREE.MeshBasicMaterial) material.wireframe = wireframe;
}

export function applyBuildingVariant(scene: THREE.Scene, viewMode: ViewMode, xray: boolean): void {
  scene.traverse(obj => {
    if (!obj.userData.building) return;

    const role = obj.userData.renderRole as BuildingRenderRole | undefined;
    if (!role) return;

    if (obj instanceof THREE.LineSegments || obj instanceof THREE.Line) {
      const isWireVisible = viewMode === "wireframe";
      obj.visible = role === "wire" || role === "wire-decor" ? isWireVisible : obj.visible;
      return;
    }

    if (!(obj instanceof THREE.Mesh)) return;

    if (role === "solid") {
      const solidVisible = viewMode === "solid";
      obj.visible = solidVisible;
      setMaterialVisible(obj.material, solidVisible);
      setMaterialWireframe(obj.material, false);
      setMaterialOpacity(obj.material, xray ? 0.2 : 1);
      return;
    }

    if (role === "glass") {
      obj.visible = true;
      setMaterialVisible(obj.material, true);
      setMaterialWireframe(obj.material, false);
      setMaterialOpacity(obj.material, xray ? 0.08 : viewMode === "solid" ? 1 : 0.12);
      return;
    }

    obj.visible = viewMode === "wireframe";
    setMaterialWireframe(obj.material, true);
    setMaterialOpacity(obj.material, xray ? 0.12 : 0.35);
  });
}
