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
#define TAU 6.28318530718
uniform vec3 uColorMajor;
uniform vec3 uColorMinor;
uniform float uCell;
varying vec3 vWorldPos;

void main() {
	vec2 p = vWorldPos.xz;
	float c = uCell;
	float cMaj = c * 5.0;
	float gcx = abs(sin(p.x * TAU / c));
	float gcy = abs(sin(p.y * TAU / c));
	float gmx = abs(sin(p.x * TAU / cMaj));
	float gmy = abs(sin(p.y * TAU / cMaj));
	float tmi = 1.0 - min(gcx, gcy);
	float tma = 1.0 - min(gmx, gmy);
	if (tma < 0.12 && tmi < 0.12) discard;
	bool isMaj = tma > 0.2;
	vec3 col = isMaj ? uColorMajor : uColorMinor;
	gl_FragColor = vec4(col, 1.0);
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
  dispose: () => void;
} {
  const uCell = options.cellSize ?? 2.0;
  const fogDensity = options.fogDensity ?? 0.012;
  const geom = new THREE.PlaneGeometry(PLANE_SIZE, PLANE_SIZE, 1, 1);
  const mat = new THREE.ShaderMaterial({
    fog: true,
    transparent: false,
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
