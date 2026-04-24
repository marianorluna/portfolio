import * as THREE from "three";
import { SCENE_BACKGROUND } from "@/config/scene-theme";

const vertexShader = /* glsl */ `
#include <common>
#include <fog_pars_vertex>
varying vec3 vWorldPos;
void main() {
	#include <begin_vertex>
	vWorldPos = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;
	#include <project_vertex>
	#include <fog_vertex>
}
`;

const fragmentShader = /* glsl */ `
#include <common>
#include <fog_pars_fragment>
uniform vec3 uColorMajor;
uniform vec3 uColorMinor;
uniform float uCell;
varying vec3 vWorldPos;

// Distancia a la frontera de celda [0, 0.5]; fwidth de tm escala el suavizado a espacio de pantalla.
float gridLineMask(vec2 tm, float wx, float wz) {
	float dX = min(fract(tm.x), 1.0 - fract(tm.x));
	float dY = min(fract(tm.y), 1.0 - fract(tm.y));
	float aX = 1.0 - smoothstep(0.0, 2.0 * wx, dX);
	float aY = 1.0 - smoothstep(0.0, 2.0 * wz, dY);
	return max(aX, aY);
}

void main() {
	vec2 p = vWorldPos.xz;
	float c = uCell;
	float cMaj = c * 5.0;
	vec2 tm = p / c;
	vec2 tM = p / cMaj;
	// fwidth: grosor de línea coherente al rotar (evita moiré/aliasing a lo lejos).
	float wxM = fwidth(tm.x) + 1e-5;
	float wzM = fwidth(tm.y) + 1e-5;
	float wMxM = fwidth(tM.x) + 1e-5;
	float wMzM = fwidth(tM.y) + 1e-5;
	float lineMinor = gridLineMask(tm, wxM, wzM);
	float lineMajor = gridLineMask(tM, wMxM, wMzM);
	float alpha = max(lineMinor * 0.55, lineMajor);
	if (alpha < 0.01) discard;

	vec3 col = mix(uColorMinor, uColorMajor, lineMajor);
	gl_FragColor = vec4(col, alpha);
	#include <fog_fragment>
}
`;

const MAJOR = new THREE.Color(0x4a5568);
const MINOR = new THREE.Color(0x2d3548);

const PLANE_SIZE = 520;
/** Suficiente ancho en alzado ortográfico (espacio edificio + márgen). */
const HORIZON_HALF_WIDTH = 900;

export type InfiniteGridUpdateOptions = {
  buildingOffsetX: number;
  /**
   * En alzado + orto el plano XZ visto casi de canto: la rejilla procedimental
   * parece en “perspectiva”. Se oculta y se usa una sola línea en y≈0.
   */
  frontElevationOrtho: boolean;
};

const defaultGridUpdate: InfiniteGridUpdateOptions = {
  buildingOffsetX: 0,
  frontElevationOrtho: false,
};

/**
 * Rejilla “infinita”: patrón en espacio mundo y plano ancho que sigue a la cámara en XZ.
 */
export function createInfiniteGrid(options: {
  cellSize?: number;
  /** Debe coincidir con `scene.fog` (FogExp2) para el primer frame y por coherencia. */
  fogDensity?: number;
} = {}): {
  mesh: THREE.Mesh;
  horizon: THREE.Line;
  update: (camera: THREE.Camera, opts?: Partial<InfiniteGridUpdateOptions>) => void;
  setColors: (major: number, minor: number, fog: number) => void;
  dispose: () => void;
} {
  const uCell = options.cellSize ?? 2.0;
  const fogDensity = options.fogDensity ?? 0.012;
  const geom = new THREE.PlaneGeometry(PLANE_SIZE, PLANE_SIZE, 1, 1);
  const mat = new THREE.ShaderMaterial({
    fog: true,
    transparent: true,
    depthWrite: true,
    depthTest: true,
    // ShaderMaterial no hereda UniformsLib: hace falta lo que pide `refreshFogUniforms` (r180).
    uniforms: {
      uColorMajor: { value: MAJOR },
      uColorMinor: { value: MINOR },
      uCell: { value: uCell },
      fogColor: { value: new THREE.Color(SCENE_BACKGROUND) },
      fogDensity: { value: fogDensity },
    },
    vertexShader,
    fragmentShader,
  });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.name = "infiniteGrid";
  mesh.rotation.x = -Math.PI / 2;
  mesh.frustumCulled = false;
  mesh.renderOrder = -1;

  const horizonGeom = new THREE.BufferGeometry();
  {
    const arr = new Float32Array(6);
    arr[0] = -HORIZON_HALF_WIDTH;
    arr[1] = 0;
    arr[2] = 0;
    arr[3] = HORIZON_HALF_WIDTH;
    arr[4] = 0;
    arr[5] = 0;
    horizonGeom.setAttribute("position", new THREE.BufferAttribute(arr, 3));
  }
  const horizonMat = new THREE.LineBasicMaterial({
    color: 0x4a5568,
    transparent: true,
    opacity: 0.9,
  });
  const horizon = new THREE.Line(horizonGeom, horizonMat);
  horizon.name = "elevationHorizon";
  horizon.renderOrder = -1;
  horizon.visible = false;
  /** Plano suelo: análogo a la malla, por debajo de la cota de planta. */
  horizon.position.y = -0.02;

  return {
    mesh,
    horizon,
    setColors(major: number, minor: number, fog: number) {
      mat.uniforms.uColorMajor.value.setHex(major);
      mat.uniforms.uColorMinor.value.setHex(minor);
      mat.uniforms.fogColor.value.setHex(fog);
      (horizonMat as THREE.LineBasicMaterial).color.setHex(major);
    },
    update(camera, opts) {
      const o = { ...defaultGridUpdate, ...opts };
      if (o.frontElevationOrtho) {
        mesh.visible = false;
        horizon.visible = true;
        horizon.position.set(o.buildingOffsetX, horizon.position.y, 0);
        return;
      }
      mesh.visible = true;
      horizon.visible = false;
      const { x, z } = camera.position;
      mesh.position.set(x, -0.1, z);
    },
    dispose() {
      geom.dispose();
      mat.dispose();
      horizonGeom.dispose();
      horizonMat.dispose();
    },
  };
}
