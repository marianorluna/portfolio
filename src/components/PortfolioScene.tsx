"use client";

import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { MOUSE } from "three";
import type { PortfolioData } from "@/types/portfolio";
import { setupScene } from "@/utils/three-scene";
import type { SceneLights } from "@/utils/three-scene";
import { SCENE_BACKGROUND, SCENE_COLORS } from "@/config/scene-theme";
import type { SceneTheme } from "@/config/scene-theme";
import {
  createFloor,
  createBaseMaterial,
  createLineMaterial,
  type FloorUserData,
} from "@/utils/building-model";
import {
  findProjectWithCategory,
  PROJECT_HOTSPOT_COLORS,
  tagMeshUserDataWithProject,
} from "@/utils/floor-project-hotspots";
import { getViewTarget, type ViewPreset } from "@/utils/view-variants";
import { HERO_VARIANTS, pickHeroVariant, type HeroStartupVariant } from "@/utils/hero-variants";
import { simulateLoad } from "@/utils/simulate-load";
import { LoadingScreen } from "./LoadingScreen";
import { Navbar, type NavActivePanel } from "./Navbar";
import { HeroText } from "./HeroText";
import { ProjectViewerModal } from "./ProjectViewerModal";
import { NodeInspector } from "./NodeInspector";
import { ViewControls } from "./ViewControls";
import { LevelControls } from "./LevelControls";

const FRUSTUM_SIZE = 40;
const MAX_FLOORS = 40;
const INITIAL_FLOORS = 15;
/** Más estrecho que 45: encuadre al tercio central del edificio (mismo sentido en toggle orto). */
const PERSP_FOV = 32;
const DESKTOP_OFFSET_X = 10;
/** Cota y=0 = base del edificio; el pan no debe cruzar el suelo. */
const MIN_PAN_TARGET_Y = 0;
const MIN_ORBIT_EYE_Y = 0.22;
const MIN_ZOOM_DISTANCE = 18;
const MAX_ZOOM_DISTANCE = 120;
const CAMERA_COLLISION_MARGIN = 1.2;
const TARGET_COLLISION_MARGIN = 0.9;
const MIN_ORTHO_ZOOM = 0.7;
const MAX_ORTHO_ZOOM = 3.2;
/**
 * En cámara ortográfica (excepto alzado fijo mira horizontal), el arco polar se
 * limita al hemisferio "por encima" del plano horizontal del target: se evita orbitar
 * bajo y=0 y ver el modelo desde debajo de la rejilla.
 */
const ORTHO_ORBIT_MAX_POLAR = Math.PI / 2 - 0.05;
/**
 * Umbral del componente Y de la dirección de cámara para considerar que
 * la ortográfica apunta "en horizontal" (alzado). |dir.y| < threshold → alzado.
 * ISO tiene |dir.y| ≈ 0.34 (34°), alzado tiene |dir.y| ≈ 0.
 */
const ORTHO_HORIZONTAL_THRESHOLD = 0.28;
const _clampCamDir = new THREE.Vector3();
const ROTATE_SPEED_MIN = 1;
const ROTATE_SPEED_MAX = 10;
const ROTATE_SPEED_FACTOR = 0.3;
const DEFAULT_ROTATE_SPEED_LEVEL = 4;
/** Máx. desplazamiento en px para considerar clic (no pan) sobre hotspot. */
const HOTSPOT_CLICK_MAX_DIST_PX = 5;
type InteractionCursorState = "idle" | "orbit" | "pan";
const ORBIT_CURSOR_URL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cg fill='none' stroke='%23d8f7ff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='16' cy='16' r='8.5'/%3E%3Cpath d='M16 4.5l-2.5 2.5M16 4.5l2.5 2.5'/%3E%3Cpath d='M27.5 16l-2.5-2.5M27.5 16l-2.5 2.5'/%3E%3Cpath d='M16 27.5l-2.5-2.5M16 27.5l2.5-2.5'/%3E%3Cpath d='M4.5 16l2.5-2.5M4.5 16l2.5 2.5'/%3E%3C/g%3E%3C/svg%3E\") 16 16, grab";

function clampOrbitToGround(
  controls: OrbitControls,
  camera: THREE.Camera,
  activeView: ViewPreset | null
): void {
  if (camera instanceof THREE.OrthographicCamera) {
    // Planta cenital: no hace falta clamp de pan vertical.
    if (activeView === "top") return;
    // Detectar si la cámara mira casi en horizontal (alzado / front), incluso cuando
    // activeView es null (el usuario ya ha empezado a interactuar y la ref se pone a null).
    // Esto evita que un pan hacia abajo saque la rejilla del encuadre inferior.
    _clampCamDir.set(0, 0, -1).applyQuaternion(camera.quaternion);
    if (Math.abs(_clampCamDir.y) < ORTHO_HORIZONTAL_THRESHOLD) {
      const minTargetY = (FRUSTUM_SIZE / 2) / camera.zoom;
      if (controls.target.y < minTargetY) {
        controls.target.y = minTargetY;
      }
    }
    // Cámara inclinada (ISO): la rejilla sigue visible por los rayos diagonales;
    // no se necesita clamp extra de pan.
    return;
  }
  if (camera.position.y < MIN_ORBIT_EYE_Y) {
    camera.position.y = MIN_ORBIT_EYE_Y;
  }
  if (controls.target.y < MIN_PAN_TARGET_Y) {
    controls.target.y = MIN_PAN_TARGET_Y;
  }
}

/**
 * Ajusta el target (y por tanto la cámara horizontal) para que y=0 coincida
 * exactamente con el borde inferior del frustum ortográfico.
 * Llamar siempre DESPUÉS de que `cameraOrtho.zoom` esté actualizado.
 */
function snapFrontToGround(
  cameraOrtho: THREE.OrthographicCamera,
  controls: OrbitControls
): void {
  const halfH = (FRUSTUM_SIZE / 2) / cameraOrtho.zoom;
  controls.target.y = halfH;
  cameraOrtho.position.y = halfH;
  controls.update();
}

/**
 * Ajusta límites polares: alzado+orto = fijo horizontal; otras orto = encima del plano
 * del suelo; perspectiva = giro completo.
 */
function applyOrbitPolarLock(
  controls: OrbitControls,
  activeView: ViewPreset | null,
  isOrtho: boolean
): void {
  if (activeView === "front" && isOrtho) {
    controls.minPolarAngle = Math.PI / 2;
    controls.maxPolarAngle = Math.PI / 2;
  } else if (isOrtho) {
    controls.minPolarAngle = 0;
    controls.maxPolarAngle = ORTHO_ORBIT_MAX_POLAR;
  } else {
    controls.minPolarAngle = 0;
    controls.maxPolarAngle = Math.PI;
  }
}

/**
 * Alinea cámaras y OrbitControls con una variante de hero (mismo criterio que
 * al cargar y al pulsar Inicio). Patrón: extracción de "estrategia" de encuadre
 * reutilizable para no bifurcar init vs reset.
 */
function applyHeroVariantToCameras(
  heroVariant: HeroStartupVariant,
  bX: number,
  stackFloors: number,
  cameraPersp: THREE.PerspectiveCamera,
  cameraOrtho: THREE.OrthographicCamera,
  controls: OrbitControls,
  activeCameraRef: MutableRefObject<THREE.Camera | null>,
  isOrthoRef: MutableRefObject<boolean>
): { activeView: ViewPreset | null; autoRotateLevel: number; isOrtho: boolean } {
  const viewOpts = { stackFloors } as const;
  const { position: startPos, lookAt: startLookAt } = heroVariant.getCamera
    ? heroVariant.getCamera(bX, stackFloors)
    : getViewTarget(heroVariant.view ?? "iso", bX, viewOpts);

  cameraPersp.position.copy(startPos);
  cameraPersp.lookAt(startLookAt);
  cameraPersp.zoom = 1;
  cameraPersp.updateProjectionMatrix();
  cameraPersp.updateMatrixWorld();

  cameraOrtho.position.copy(startPos);
  cameraOrtho.quaternion.copy(cameraPersp.quaternion);
  cameraOrtho.zoom = 1;
  cameraOrtho.updateProjectionMatrix();
  cameraOrtho.updateMatrixWorld();

  controls.maxPolarAngle = heroVariant.getCamera ? Math.PI : ORTHO_ORBIT_MAX_POLAR;
  controls.target.copy(startLookAt);
  controls.autoRotateSpeed = heroVariant.autoRotateSpeed * ROTATE_SPEED_FACTOR;
  controls.update();

  isOrthoRef.current = false;
  activeCameraRef.current = cameraPersp;
  controls.object = cameraPersp;

  if (heroVariant.cameraMode === "orthographic") {
    const dist = cameraPersp.position.distanceTo(controls.target);
    cameraOrtho.position.copy(cameraPersp.position);
    cameraOrtho.quaternion.copy(cameraPersp.quaternion);
    const halfHeight = Math.tan(THREE.MathUtils.degToRad(PERSP_FOV / 2)) * dist;
    cameraOrtho.zoom = (FRUSTUM_SIZE / 2) / halfHeight;
    cameraOrtho.updateProjectionMatrix();
    activeCameraRef.current = cameraOrtho;
    controls.object = cameraOrtho;
    isOrthoRef.current = true;

    if (heroVariant.view === "front") {
      applyOrbitPolarLock(controls, "front", true);
      const halfH = (FRUSTUM_SIZE / 2) / cameraOrtho.zoom;
      controls.target.y = halfH;
      cameraOrtho.position.y = halfH;
    } else {
      applyOrbitPolarLock(controls, heroVariant.view, true);
    }
    controls.update();
  } else if (heroVariant.getCamera) {
    applyOrbitPolarLock(controls, null, false);
    controls.update();
  } else {
    controls.minPolarAngle = 0;
    controls.maxPolarAngle = ORTHO_ORBIT_MAX_POLAR;
    controls.update();
  }

  return {
    activeView: heroVariant.view,
    autoRotateLevel: heroVariant.autoRotateSpeed,
    isOrtho: heroVariant.cameraMode === "orthographic",
  };
}

type Props = { data: PortfolioData };
type ProjectItem = PortfolioData["projects"]["categories"][number]["items"][number];

export function PortfolioScene({ data }: Props) {
  const defaultCodeHtml = data.ui.inspector.codeHtml.default;
  const dataRef = useRef(data);
  dataRef.current = data;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Three.js refs
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraPerspRef = useRef<THREE.PerspectiveCamera | null>(null);
  const cameraOrthoRef = useRef<THREE.OrthographicCamera | null>(null);
  const activeCameraRef = useRef<THREE.Camera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const buildingGroupRef = useRef<THREE.Group | null>(null);
  const floorsRef = useRef<THREE.Mesh[]>([]);
  const baseMaterialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const lineMaterialRef = useRef<THREE.LineBasicMaterial | null>(null);
  const intersectedRef = useRef<THREE.Mesh | null>(null);
  const mouseRef = useRef(new THREE.Vector2());
  const raycasterRef = useRef(new THREE.Raycaster());
  const cameraCollisionRaycasterRef = useRef(new THREE.Raycaster());
  const targetCollisionRaycasterRef = useRef(new THREE.Raycaster());
  const cameraToTargetDirRef = useRef(new THREE.Vector3());
  const safeCameraPosRef = useRef(new THREE.Vector3());
  const targetViewDirRef = useRef(new THREE.Vector3());
  const safeTargetPosRef = useRef(new THREE.Vector3());

  // Lights + grid refs (para actualizar tema en caliente)
  const sceneLightsRef    = useRef<SceneLights | null>(null);
  const setGridColorsRef  = useRef<((major: number, minor: number, fog: number) => void) | null>(null);
  // Inicializado desde localStorage para que los handlers del loop tengan el valor correcto
  // desde el primer frame, antes de que useEffect([theme]) haya corrido.
  const themeRef = useRef<SceneTheme>(
    typeof window !== "undefined"
      ? ((window.localStorage.getItem("portfolio-theme") as SceneTheme) ?? "dark")
      : "dark"
  );

  // Animation state refs
  const isFlyingRef = useRef(false);
  const flyTargetPosRef = useRef(new THREE.Vector3());
  const flyTargetLookAtRef = useRef(new THREE.Vector3());
  const isOrthoRef = useRef(false);
  const autoRotateRef = useRef(true);
  const activeViewRef = useRef<ViewPreset | null>("iso");
  const floorCountRef = useRef(INITIAL_FLOORS);
  const rafRef = useRef(0);
  const buildingOffsetXRef = useRef(0);
  const interactionCursorRef = useRef<InteractionCursorState>("idle");
  const hasUserInteractedRef = useRef(false);
  const heroVariantRef = useRef<HeroStartupVariant | null>(null);
  /** HTML del proyecto "pinned" en el inspector; null = ninguno seleccionado. */
  const selectedProjectHtmlRef = useRef<string | null>(null);

  /** Último mesh del que se derivó hero + inspector (evita setState por frame). */
  const prevHoverUiMeshRef = useRef<THREE.Mesh | null>(null);
  const defaultCodeHtmlRef = useRef(defaultCodeHtml);
  defaultCodeHtmlRef.current = defaultCodeHtml;

  const [activeNavPanel, setActiveNavPanel] = useState<NavActivePanel>(null);

  const [heroSelection, setHeroSelection] = useState<{
    categoryLabel: string;
    project: ProjectItem;
  } | null>(null);

  const [heroFloorPreview, setHeroFloorPreview] = useState<{
    categoryLabel: string;
    project: ProjectItem;
  } | null>(null);

  const clearProjectSelection = useCallback(() => {
    selectedProjectHtmlRef.current = null;
    prevHoverUiMeshRef.current = null;
    setHeroSelection(null);
    setHeroFloorPreview(null);
    setCodeHtml(defaultCodeHtml);
  }, [defaultCodeHtml]);

  const clearProjectSelectionRef = useRef(clearProjectSelection);
  clearProjectSelectionRef.current = clearProjectSelection;

  const [liveSync, setLiveSync] = useState(false);
  const setLiveSyncRef = useRef(setLiveSync);
  setLiveSyncRef.current = setLiveSync;
  const prevLiveSyncRef = useRef(false);

  // Tema: inicializado desde localStorage para evitar flash
  const [theme, setTheme] = useState<SceneTheme>(() => {
    if (typeof window === "undefined") return "dark";
    return (window.localStorage.getItem("portfolio-theme") as SceneTheme) ?? "dark";
  });

  // React UI state
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadText, setLoadText] = useState(data.ui.loading.initialText);
  const [loadHidden, setLoadHidden] = useState(false);
  const [floorCount, setFloorCount] = useState(INITIAL_FLOORS);
  const [codeHtml, setCodeHtml] = useState(defaultCodeHtml);
  const setCodeHtmlRef = useRef(setCodeHtml);
  setCodeHtmlRef.current = setCodeHtml;
  const setHeroFloorPreviewRef = useRef(setHeroFloorPreview);
  setHeroFloorPreviewRef.current = setHeroFloorPreview;

  const [isOrtho, setIsOrtho] = useState(false);
  const [activeView, setActiveView] = useState<ViewPreset | null>("iso");
  const [autoRotate, setAutoRotate] = useState(true);
  const [rotateSpeedLevel, setRotateSpeedLevel] = useState(DEFAULT_ROTATE_SPEED_LEVEL);

  // ── UI Handlers ──────────────────────────────────────────────────────────

  const handleAddFloor = useCallback(() => {
    if (floorCountRef.current >= MAX_FLOORS) return;
    const baseMat = baseMaterialRef.current;
    const lineMat = lineMaterialRef.current;
    const buildingGroup = buildingGroupRef.current;
    if (!baseMat || !lineMat || !buildingGroup) return;

    const levelIndex = floorCountRef.current;
    const { group, mesh } = createFloor(levelIndex, baseMat, lineMat);
    tagMeshUserDataWithProject(mesh, levelIndex);
    buildingGroup.add(group);
    floorsRef.current.push(mesh);
    floorCountRef.current++;
    setFloorCount(floorCountRef.current);
  }, []);

  const handleRemoveFloor = useCallback(() => {
    if (floorCountRef.current <= 1) return;
    const buildingGroup = buildingGroupRef.current;
    if (!buildingGroup) return;

    floorCountRef.current--;
    setFloorCount(floorCountRef.current);

    const topFloor = buildingGroup.getObjectByName(`floor_${floorCountRef.current}`);
    if (topFloor) {
      topFloor.userData.targetScaleY = 0.001;
      topFloor.userData.isRemoving = true;

      const intersected = intersectedRef.current;
      if (intersected && intersected.parent === topFloor) {
        // No tocar materiales: el piso se anima a salida; reset podría chocar con el estado de Three
        intersectedRef.current = null;
        prevHoverUiMeshRef.current = null;
        if (tooltipRef.current) tooltipRef.current.style.opacity = "0";
        setHeroFloorPreview(null);
        setCodeHtml(defaultCodeHtml);
      }
    }
  }, [defaultCodeHtml]);

  const handleViewClick = useCallback((view: ViewPreset) => {
    const controls = controlsRef.current;
    const camera = activeCameraRef.current;
    if (!controls || !camera) return;

    // Liberar restricciones polares de la vista anterior ANTES de iniciar el vuelo.
    // Si no se hace aquí, controls.update() mantiene la restricción PI/2 (alzado+orto)
    // y pelea con la animación de lerp, impidiendo llegar al destino.
    applyOrbitPolarLock(controls, view, isOrthoRef.current);

    const bX = window.innerWidth > 768 ? DESKTOP_OFFSET_X : 0;
    const target = getViewTarget(view, bX, { stackFloors: floorCountRef.current });
    flyTargetPosRef.current.copy(target.position);
    flyTargetLookAtRef.current.copy(target.lookAt);

    if (view === "top") {
      // Preservar el azimut actual: solo subir la cámara a Y=80 sin forzar orientación XZ.
      // Sin este ajuste, el offset 0.001Z del preset fuerza phi=0 y resetea los ejes a V/H.
      const lx = target.lookAt.x;
      const lz = target.lookAt.z;
      const dx = camera.position.x - lx;
      const dz = camera.position.z - lz;
      const flatDist = Math.hypot(dx, dz);
      const TINY = 0.001;
      flyTargetPosRef.current.x = flatDist > TINY ? lx + (dx / flatDist) * TINY : lx;
      flyTargetPosRef.current.y = 80;
      flyTargetPosRef.current.z = flatDist > TINY ? lz + (dz / flatDist) * TINY : lz + TINY;
    }

    // Para alzado+orto, bake del ajuste de suelo directamente en el destino del fly.
    // Sin esto, snapFrontToGround se aplica al final del vuelo como un snap instantáneo.
    if (view === "front" && isOrthoRef.current && cameraOrthoRef.current) {
      const halfH = (FRUSTUM_SIZE / 2) / cameraOrthoRef.current.zoom;
      flyTargetPosRef.current.y = halfH;
      flyTargetLookAtRef.current.y = halfH;
    }

    // Durante el vuelo: desactivar damping (elimina velocidad residual del usuario)
    // y suspender autoRotate temporalmente para que la cámara no orbite mientras vuela.
    // La preferencia real del usuario (autoRotateRef) NO se toca aquí; se restaura al aterrizar.
    controls.enableDamping = false;
    controls.autoRotate = false;
    isFlyingRef.current = true;

    activeViewRef.current = view;
    setActiveView(view);
  }, []);

  const handleToggleAuto = useCallback(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const next = !autoRotateRef.current;
    autoRotateRef.current = next;
    controls.autoRotate = next;
    setAutoRotate(next);
  }, []);

  const handleRotateSpeedChange = useCallback((nextLevel: number) => {
    const controls = controlsRef.current;
    const clamped = Math.min(ROTATE_SPEED_MAX, Math.max(ROTATE_SPEED_MIN, Math.round(nextLevel)));
    setRotateSpeedLevel(clamped);
    if (!controls) return;
    controls.autoRotateSpeed = clamped * ROTATE_SPEED_FACTOR;
  }, []);

  const handleIncreaseRotateSpeed = useCallback(() => {
    handleRotateSpeedChange(rotateSpeedLevel + 1);
  }, [handleRotateSpeedChange, rotateSpeedLevel]);

  const handleDecreaseRotateSpeed = useCallback(() => {
    handleRotateSpeedChange(rotateSpeedLevel - 1);
  }, [handleRotateSpeedChange, rotateSpeedLevel]);

  const handleResetScene = useCallback(() => {
    const controls = controlsRef.current;
    const cameraPersp = cameraPerspRef.current;
    const cameraOrtho = cameraOrthoRef.current;
    const buildingGroup = buildingGroupRef.current;
    const baseMat = baseMaterialRef.current;
    const lineMat = lineMaterialRef.current;
    if (!controls || !cameraPersp || !cameraOrtho || !buildingGroup || !baseMat || !lineMat) return;

    // Reset interaction and UI overlays.
    isFlyingRef.current = false;
    hasUserInteractedRef.current = false;
    intersectedRef.current = null;
    clearProjectSelection();
    if (tooltipRef.current) tooltipRef.current.style.opacity = "0";

    // Reset floor stack to initial amount.
    if (floorCountRef.current < INITIAL_FLOORS) {
      for (let i = floorCountRef.current; i < INITIAL_FLOORS; i++) {
        const { group, mesh } = createFloor(i, baseMat, lineMat);
        tagMeshUserDataWithProject(mesh, i);
        group.scale.y = 1;
        group.userData.targetScaleY = 1;
        buildingGroup.add(group);
        floorsRef.current.push(mesh);
      }
    } else if (floorCountRef.current > INITIAL_FLOORS) {
      for (let i = floorCountRef.current - 1; i >= INITIAL_FLOORS; i--) {
        const topFloor = buildingGroup.getObjectByName(`floor_${i}`);
        if (!(topFloor instanceof THREE.Group)) continue;
        const mesh = topFloor.children.find(child => child instanceof THREE.Mesh);
        if (mesh instanceof THREE.Mesh) {
          floorsRef.current = floorsRef.current.filter(existing => existing !== mesh);
        }
        topFloor.traverse(child => {
          if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
            child.geometry?.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach(m => m.dispose());
            } else {
              child.material?.dispose();
            }
          }
        });
        buildingGroup.remove(topFloor);
      }
    }
    floorCountRef.current = INITIAL_FLOORS;
    setFloorCount(INITIAL_FLOORS);

    // Cámara / vista: misma variante de hero que al cargar (ver `heroVariantRef` en el init de Three).
    const bX = window.innerWidth > 768 ? DESKTOP_OFFSET_X : 0;
    buildingOffsetXRef.current = bX;
    buildingGroup.position.x = bX;
    const variant = heroVariantRef.current ?? HERO_VARIANTS[0];
    const applied = applyHeroVariantToCameras(
      variant,
      bX,
      INITIAL_FLOORS,
      cameraPersp,
      cameraOrtho,
      controls,
      activeCameraRef,
      isOrthoRef
    );
    setIsOrtho(applied.isOrtho);
    setActiveView(applied.activeView);
    setRotateSpeedLevel(applied.autoRotateLevel);
    activeViewRef.current = applied.activeView;

    controls.enableDamping = true;
    autoRotateRef.current = true;
    controls.autoRotate = true;
    setAutoRotate(true);
    controls.update();
  }, [clearProjectSelection]);

  const handleToggleCamera = useCallback(() => {
    const controls = controlsRef.current;
    const cameraPersp = cameraPerspRef.current;
    const cameraOrtho = cameraOrthoRef.current;
    if (!controls || !cameraPersp || !cameraOrtho) return;

    const nextOrtho = !isOrthoRef.current;
    isOrthoRef.current = nextOrtho;
    setIsOrtho(nextOrtho);

    if (nextOrtho) {
      const distance = cameraPersp.position.distanceTo(controls.target);
      cameraOrtho.position.copy(cameraPersp.position);
      cameraOrtho.quaternion.copy(cameraPersp.quaternion);
      const halfHeight = Math.tan(THREE.MathUtils.degToRad(cameraPersp.fov) / 2) * distance;
      cameraOrtho.zoom = (FRUSTUM_SIZE / 2) / halfHeight;
      cameraOrtho.updateProjectionMatrix();
      activeCameraRef.current = cameraOrtho;
      controls.object = cameraOrtho;
      if (activeViewRef.current === "front") {
        // Mini fly suave al plano base: evita el snap brusco que provocaba
        // el salto visible al activar ortogonal estando en la vista alzado.
        const halfH = (FRUSTUM_SIZE / 2) / cameraOrtho.zoom;
        flyTargetPosRef.current.copy(cameraOrtho.position);
        flyTargetPosRef.current.y = halfH;
        flyTargetLookAtRef.current.copy(controls.target);
        flyTargetLookAtRef.current.y = halfH;
        controls.enableDamping = false;
        controls.autoRotate = false;
        isFlyingRef.current = true;
      }
    } else {
      const halfHeight = (FRUSTUM_SIZE / 2) / cameraOrtho.zoom;
      const newDistance =
        halfHeight / Math.tan(THREE.MathUtils.degToRad(cameraPersp.fov) / 2);
      const direction = new THREE.Vector3()
        .subVectors(cameraOrtho.position, controls.target)
        .normalize();
      cameraPersp.position.copy(controls.target).addScaledVector(direction, newDistance);
      cameraPersp.quaternion.copy(cameraOrtho.quaternion);
      cameraPersp.zoom = 1;
      cameraPersp.updateProjectionMatrix();
      activeCameraRef.current = cameraPersp;
      controls.object = cameraPersp;
    }
    applyOrbitPolarLock(controls, activeViewRef.current, nextOrtho);
    controls.update();
  }, []);

  const handleThemeToggle = useCallback(() => {
    setTheme(prev => {
      const next: SceneTheme = prev === "dark" ? "light" : "dark";
      window.localStorage.setItem("portfolio-theme", next);
      return next;
    });
  }, []);

  const handleProjectSelect = useCallback(
    (project: ProjectItem, categoryLabel: string) => {
      const html = buildProjectCodeHtml(project);
      const currentIntersected = intersectedRef.current;
      if (currentIntersected) {
        const tc = SCENE_COLORS[themeRef.current];
        resetFloorHighlight(currentIntersected, tc.buildingBase, tc.buildingLines);
        intersectedRef.current = null;
      }
      prevHoverUiMeshRef.current = null;
      if (tooltipRef.current) tooltipRef.current.style.opacity = "0";
      selectedProjectHtmlRef.current = html;
      setCodeHtml(html);
      setHeroFloorPreview(null);
      setHeroSelection({ project, categoryLabel });
    },
    []
  );

  const handleProjectSelectRef = useRef(handleProjectSelect);
  handleProjectSelectRef.current = handleProjectSelect;

  // ── Three.js Setup ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const aspect = W / H;
    const isDesk = W > 768;
    const bX = isDesk ? DESKTOP_OFFSET_X : 0;
    buildingOffsetXRef.current = bX;

    // Scene
    const { scene, lights, updateInfiniteGrid, setGridColors, disposeInfiniteGrid } = setupScene();
    sceneRef.current      = scene;
    sceneLightsRef.current    = lights;
    setGridColorsRef.current  = setGridColors;

    // ── Hero Variant: elegida una vez por sesión (Inicio reutiliza esta ref) ─
    const heroVariant = pickHeroVariant();
    heroVariantRef.current = heroVariant;

    // Cameras — se configuran con `applyHeroVariantToCameras` tras crear controls
    const cameraPersp = new THREE.PerspectiveCamera(PERSP_FOV, aspect, 1, 1000);
    cameraPerspRef.current = cameraPersp;

    const cameraOrtho = new THREE.OrthographicCamera(
      (FRUSTUM_SIZE * aspect) / -2,
      (FRUSTUM_SIZE * aspect) / 2,
      FRUSTUM_SIZE / 2,
      FRUSTUM_SIZE / -2,
      1, 1000
    );
    cameraOrthoRef.current = cameraOrtho;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(SCENE_BACKGROUND, 1);
    rendererRef.current = renderer;

    // OrbitControls
    const controls = new OrbitControls(cameraPersp, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.mouseButtons = {
      LEFT: MOUSE.PAN,
      MIDDLE: MOUSE.DOLLY,
      RIGHT: MOUSE.ROTATE,
    };
    controls.minDistance = MIN_ZOOM_DISTANCE;
    controls.maxDistance = MAX_ZOOM_DISTANCE;
    controls.minZoom = MIN_ORTHO_ZOOM;
    controls.maxZoom = MAX_ORTHO_ZOOM;

    const applied = applyHeroVariantToCameras(
      heroVariant,
      bX,
      INITIAL_FLOORS,
      cameraPersp,
      cameraOrtho,
      controls,
      activeCameraRef,
      isOrthoRef
    );
    setIsOrtho(applied.isOrtho);
    activeViewRef.current = applied.activeView;
    setActiveView(applied.activeView);
    setRotateSpeedLevel(applied.autoRotateLevel);
    controls.autoRotate = true;
    controlsRef.current = controls;

    const setCanvasCursor = (state: InteractionCursorState) => {
      interactionCursorRef.current = state;
      if (state === "pan") {
        canvas.style.cursor = "grab";
        return;
      }
      if (state === "orbit") {
        canvas.style.cursor = ORBIT_CURSOR_URL;
        return;
      }
      canvas.style.cursor = "crosshair";
    };

    const resolveCursorStateFromPointer = (e: PointerEvent): InteractionCursorState => {
      if (e.button === 2 || ((e.ctrlKey || e.metaKey || e.shiftKey) && e.button === 0)) {
        return "orbit";
      }
      if (e.button === 0) return "pan";
      return "idle";
    };

    let pointerPickLeft: { x: number; y: number; pointerId: number } | null = null;

    const onPointerDown = (e: PointerEvent) => {
      hasUserInteractedRef.current = true;
      setCanvasCursor(resolveCursorStateFromPointer(e));
      if (e.button === 0) {
        pointerPickLeft = { x: e.clientX, y: e.clientY, pointerId: e.pointerId };
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      setCanvasCursor("idle");
      if (e.type === "pointercancel") {
        pointerPickLeft = null;
        return;
      }
      const pick = pointerPickLeft;
      pointerPickLeft = null;
      if (
        pick == null ||
        e.pointerId !== pick.pointerId ||
        e.button !== 0 ||
        selectedProjectHtmlRef.current
      ) {
        return;
      }
      const dx = e.clientX - pick.x;
      const dy = e.clientY - pick.y;
      if (dx * dx + dy * dy > HOTSPOT_CLICK_MAX_DIST_PX * HOTSPOT_CLICK_MAX_DIST_PX) {
        return;
      }
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycasterRef.current.setFromCamera(mouseRef.current, activeCameraRef.current!);
      const hits = raycasterRef.current.intersectObjects(floorsRef.current, false);
      if (hits.length === 0) return;
      const mesh = hits[0].object as THREE.Mesh;
      const ud = mesh.userData as FloorUserData;
      if (!ud.projectId) return;
      const hit = findProjectWithCategory(dataRef.current, ud.projectId);
      if (hit) {
        handleProjectSelectRef.current(hit.project, hit.categoryLabel);
      }
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    canvas.style.cursor = "crosshair";
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("contextmenu", onContextMenu);

    // Building group
    const buildingGroup = new THREE.Group();
    buildingGroup.position.x = bX;
    scene.add(buildingGroup);
    buildingGroupRef.current = buildingGroup;

    const baseMaterial = createBaseMaterial();
    const lineMaterial = createLineMaterial();
    baseMaterialRef.current = baseMaterial;
    lineMaterialRef.current = lineMaterial;

    const floors: THREE.Mesh[] = [];
    for (let i = 0; i < INITIAL_FLOORS; i++) {
      const { group, mesh } = createFloor(i, baseMaterial, lineMaterial);
      tagMeshUserDataWithProject(mesh, i);
      buildingGroup.add(group);
      floors.push(mesh);
    }
    floorsRef.current = floors;

    // ── Animation Loop ────────────────────────────────────────────────────

    function syncHoverUiFromMesh(obj: THREE.Mesh | null) {
      if (prevHoverUiMeshRef.current === obj) return;
      prevHoverUiMeshRef.current = obj;
      const fallback =
        selectedProjectHtmlRef.current ?? defaultCodeHtmlRef.current;
      if (obj == null) {
        setHeroFloorPreviewRef.current(null);
        setCodeHtmlRef.current(fallback);
        return;
      }
      const d = obj.userData as FloorUserData;
      if (d.projectId) {
        const found = findProjectWithCategory(dataRef.current, d.projectId);
        if (found) {
          setCodeHtmlRef.current(buildProjectCodeHtml(found.project));
          setHeroFloorPreviewRef.current({
            project: found.project,
            categoryLabel: found.categoryLabel,
          });
          return;
        }
      }
      setHeroFloorPreviewRef.current(null);
      setCodeHtmlRef.current(
        buildFloorCodeHtml(d, dataRef.current.ui.inspector.codeHtml)
      );
    }

    function commitLiveSync() {
      const next =
        selectedProjectHtmlRef.current != null || intersectedRef.current != null;
      if (next !== prevLiveSyncRef.current) {
        prevLiveSyncRef.current = next;
        setLiveSyncRef.current(next);
      }
    }

    function animate() {
      rafRef.current = requestAnimationFrame(animate);

      // Fly-to animation
      if (isFlyingRef.current) {
        const cam = activeCameraRef.current!;
        cam.position.lerp(flyTargetPosRef.current, 0.05);
        controls.target.lerp(flyTargetLookAtRef.current, 0.05);
        if (cam.position.distanceTo(flyTargetPosRef.current) < 0.005) {
          cam.position.copy(flyTargetPosRef.current);
          controls.target.copy(flyTargetLookAtRef.current);
          isFlyingRef.current = false;
          controls.enableDamping = true;
          // Restaurar la preferencia de rotación del usuario (no se alteró al cambiar vista).
          controls.autoRotate = autoRotateRef.current;
          applyOrbitPolarLock(controls, activeViewRef.current, isOrthoRef.current);
          if (activeViewRef.current === "front" && isOrthoRef.current) {
            const ortho = cameraOrthoRef.current;
            if (ortho) snapFrontToGround(ortho, controls);
          }
        }
      }

      // Floor pop-in / pop-out
      for (let i = buildingGroup.children.length - 1; i >= 0; i--) {
        const fg = buildingGroup.children[i];
        if (fg.userData.targetScaleY === undefined) continue;

        fg.scale.y += (fg.userData.targetScaleY - fg.scale.y) * 0.15;

        if (fg.userData.isRemoving && fg.scale.y < 0.01) {
          const inter = intersectedRef.current;
          if (inter && (inter.parent === fg || !floorsRef.current.includes(inter))) {
            intersectedRef.current = null;
            if (tooltipRef.current) tooltipRef.current.style.opacity = "0";
            prevHoverUiMeshRef.current = null;
            setHeroFloorPreviewRef.current(null);
            setCodeHtmlRef.current(
              selectedProjectHtmlRef.current ?? defaultCodeHtmlRef.current
            );
          }
          fg.traverse(child => {
            if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
              child.geometry?.dispose();
              if (Array.isArray(child.material)) {
                child.material.forEach(m => m.dispose());
              } else {
                child.material?.dispose();
              }
            }
          });
          buildingGroup.remove(fg);
          const idx = floorsRef.current.findIndex(m => m.parent === fg);
          if (idx > -1) floorsRef.current.splice(idx, 1);
        }
      }

      controls.update();
      // Colisión target/cámara en perspectiva: evita orbitar o acercar el foco dentro del volumen.
      if (!isFlyingRef.current && hasUserInteractedRef.current) {
        const targetAdjusted = preventPerspectiveTargetPenetration(
          controls,
          activeCameraRef.current!,
          floorsRef.current,
          targetCollisionRaycasterRef.current,
          targetViewDirRef.current,
          safeTargetPosRef.current
        );
        const cameraAdjusted = preventPerspectiveCameraPenetration(
          controls,
          activeCameraRef.current!,
          floorsRef.current,
          cameraCollisionRaycasterRef.current,
          cameraToTargetDirRef.current,
          safeCameraPosRef.current
        );
        if (targetAdjusted || cameraAdjusted) {
          controls.update();
        }
      }
      // No aplicar el clamp durante vuelos programáticos: el clamp orto forzaría
      // target.y >= FRUSTUM_SIZE/2/zoom (~14) impidiendo alcanzar lookAt.y=10 (planta).
      if (!isFlyingRef.current) {
        clampOrbitToGround(controls, activeCameraRef.current!, activeViewRef.current);
      }
      {
        const cam = activeCameraRef.current!;
        // La grid solo cambia a modo elevación al terminar el fly, no durante él,
        // para evitar el salto visual mientras la cámara todavía está en tránsito.
        const frontElOrtho =
          !isFlyingRef.current &&
          activeViewRef.current === "front" &&
          isOrthoRef.current &&
          cam instanceof THREE.OrthographicCamera;
        updateInfiniteGrid(cam, {
          buildingOffsetX: buildingOffsetXRef.current,
          frontElevationOrtho: frontElOrtho,
        });
      }

      // Mientras haya un proyecto fijado en el inspector, bloquear hover/raycast 3D.
      if (selectedProjectHtmlRef.current) {
        if (intersectedRef.current) {
          const tc = SCENE_COLORS[themeRef.current];
          resetFloorHighlight(intersectedRef.current, tc.buildingBase, tc.buildingLines);
          intersectedRef.current = null;
        }
        if (tooltipRef.current) tooltipRef.current.style.opacity = "0";
        commitLiveSync();
        renderer.render(scene, activeCameraRef.current!);
        return;
      }

      // Si el hover apuntaba a un mesh ya eliminado, limpiar UI sin tocar materiales
      {
        const stale = intersectedRef.current;
        if (stale && !floorsRef.current.includes(stale)) {
          intersectedRef.current = null;
          if (tooltipRef.current) tooltipRef.current.style.opacity = "0";
          prevHoverUiMeshRef.current = null;
          setHeroFloorPreviewRef.current(null);
          setCodeHtmlRef.current(
            selectedProjectHtmlRef.current ?? defaultCodeHtmlRef.current
          );
        }
      }

      // Raycasting hover: recursive=true (default) pega en los bordes LineSegments, sin userData
      raycasterRef.current.setFromCamera(mouseRef.current, activeCameraRef.current!);
      const intersects = raycasterRef.current.intersectObjects(floorsRef.current, false);

      if (intersects.length > 0) {
        const obj = intersects[0].object as THREE.Mesh;
        if (intersectedRef.current !== obj) {
          if (intersectedRef.current) {
            const tc = SCENE_COLORS[themeRef.current];
            resetFloorHighlight(intersectedRef.current, tc.buildingBase, tc.buildingLines);
          }
          intersectedRef.current = obj;
          highlightHoveredFloor(obj);
          syncHoverUiFromMesh(obj);

          const d = obj.userData as FloorUserData;
          if (tooltipRef.current) {
            const tip =
              d.projectId != null
                ? findProjectWithCategory(dataRef.current, d.projectId)?.project.name ??
                  d.id
                : `<${d.id} />`;
            tooltipRef.current.textContent = tip;
            tooltipRef.current.style.opacity = "1";
          }
        }
      } else if (intersectedRef.current) {
        const tc = SCENE_COLORS[themeRef.current];
        resetFloorHighlight(intersectedRef.current, tc.buildingBase, tc.buildingLines);
        intersectedRef.current = null;
        if (tooltipRef.current) tooltipRef.current.style.opacity = "0";
        syncHoverUiFromMesh(null);
      }

      if (interactionCursorRef.current === "idle") {
        const hit = intersectedRef.current;
        const ud = hit?.userData as FloorUserData | undefined;
        if (ud?.projectId) {
          canvas.style.cursor = "pointer";
        } else {
          canvas.style.cursor = "crosshair";
        }
      }

      commitLiveSync();
      renderer.render(scene, activeCameraRef.current!);
    }

    animate();

    // ── Events ────────────────────────────────────────────────────────────

    function onMouseMove(e: MouseEvent) {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
      if (tooltipRef.current) {
        tooltipRef.current.style.left = `${e.clientX}px`;
        tooltipRef.current.style.top = `${e.clientY}px`;
      }
    }

    function onResize() {
      const nW = window.innerWidth;
      const nH = window.innerHeight;
      const nAspect = nW / nH;
      const newBX = nW > 768 ? DESKTOP_OFFSET_X : 0;
      buildingOffsetXRef.current = newBX;

      if (cameraPerspRef.current) {
        cameraPerspRef.current.aspect = nAspect;
        cameraPerspRef.current.updateProjectionMatrix();
      }
      if (cameraOrthoRef.current) {
        cameraOrthoRef.current.left = (-FRUSTUM_SIZE * nAspect) / 2;
        cameraOrthoRef.current.right = (FRUSTUM_SIZE * nAspect) / 2;
        cameraOrthoRef.current.top = FRUSTUM_SIZE / 2;
        cameraOrthoRef.current.bottom = -FRUSTUM_SIZE / 2;
        cameraOrthoRef.current.updateProjectionMatrix();
      }

      renderer.setSize(nW, nH);
      buildingGroup.position.x = newBX;
      controls.target.setX(newBX);
    }

    controls.addEventListener("start", () => {
      hasUserInteractedRef.current = true;
      isFlyingRef.current = false;
      activeViewRef.current = null;
      setActiveView(null);
      applyOrbitPolarLock(controls, null, isOrthoRef.current);
      if (interactionCursorRef.current === "idle") {
        setCanvasCursor("orbit");
      }
    });

    controls.addEventListener("end", () => {
      setCanvasCursor("idle");
    });

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && selectedProjectHtmlRef.current) {
        clearProjectSelectionRef.current();
      }
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);

    simulateLoad(
      data.ui.loading.messages,
      p => setLoadProgress(p),
      msg => setLoadText(msg),
      () => setLoadHidden(true)
    );

    return () => {
      cancelAnimationFrame(rafRef.current);
      disposeInfiniteGrid();
      controls.dispose();
      renderer.dispose();
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("contextmenu", onContextMenu);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Theme (declarado DESPUÉS del init para que las refs 3D ya estén listas) ──

  useEffect(() => {
    themeRef.current = theme;
    const colors   = SCENE_COLORS[theme];
    const scene    = sceneRef.current;
    const renderer = rendererRef.current;

    // CSS variables (sobreescribe el valor inline del layout)
    document.documentElement.style.setProperty("--bg-color", colors.backgroundCSS);
    document.documentElement.setAttribute("data-theme", theme);

    if (!scene || !renderer) return;

    // Fondo + niebla
    const bg = new THREE.Color(colors.background);
    scene.background = bg;
    if (scene.fog instanceof THREE.FogExp2) scene.fog.color.copy(bg);
    renderer.setClearColor(colors.background, 1);

    // Rejilla
    setGridColorsRef.current?.(colors.gridMajor, colors.gridMinor, colors.background);

    // Luces
    const lt = sceneLightsRef.current;
    if (lt) {
      lt.dir1.color.setHex(colors.dirLight1.color);   lt.dir1.intensity = colors.dirLight1.intensity;
      lt.dir2.color.setHex(colors.dirLight2.color);   lt.dir2.intensity = colors.dirLight2.intensity;
      lt.dir3.color.setHex(colors.dirLight3.color);   lt.dir3.intensity = colors.dirLight3.intensity;
      lt.fillA.color.setHex(colors.fillA.color);      lt.fillA.intensity = colors.fillA.intensity;
      lt.fillB.color.setHex(colors.fillB.color);      lt.fillB.intensity = colors.fillB.intensity;
    }

    // Materiales del edificio (meshes clonados por piso)
    buildingGroupRef.current?.traverse(obj => {
      if (obj instanceof THREE.Mesh) {
        const mat = obj.material;
        if (mat instanceof THREE.MeshPhysicalMaterial) {
          mat.color.setHex(colors.buildingBase);
          mat.metalness        = colors.buildingMetalness;
          mat.roughness        = colors.buildingRoughness;
          mat.opacity          = colors.buildingBaseOpacity;
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0;
          mat.needsUpdate      = true;
        } else if (mat instanceof THREE.MeshBasicMaterial) {
          mat.color.setHex(colors.buildingCore);
          mat.needsUpdate = true;
        }
      }
      if (obj instanceof THREE.LineSegments) {
        const mat = obj.material;
        if (mat instanceof THREE.LineBasicMaterial) {
          mat.color.setHex(colors.buildingLines);
          mat.opacity          = colors.buildingLinesOpacity;
          mat.needsUpdate      = true;
        }
      }
    });

    // Material plantilla (para pisos que se añadan después)
    const bm = baseMaterialRef.current;
    if (bm) {
      bm.color.setHex(colors.buildingBase);
      bm.metalness  = colors.buildingMetalness;
      bm.roughness  = colors.buildingRoughness;
      bm.opacity    = colors.buildingBaseOpacity;
      bm.needsUpdate = true;
    }
    const lm = lineMaterialRef.current;
    if (lm) {
      lm.color.setHex(colors.buildingLines);
      lm.opacity    = colors.buildingLinesOpacity;
      lm.needsUpdate = true;
    }
  }, [theme]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <>
      <LoadingScreen
        progress={loadProgress}
        text={loadText}
        hidden={loadHidden}
        brandMain={data.ui.loading.brandMain}
        brandAccent={data.ui.loading.brandAccent}
      />

      <canvas ref={canvasRef} id="three-canvas" />
      <div id="tooltip" ref={tooltipRef} />

      <Navbar
        brand={data.nav.brand}
        links={data.nav.links}
        projects={data.projects}
        formacion={data.formacion}
        contactForm={data.ui.contactForm}
        contactSocial={data.ui.contactSocial}
        uiText={data.nav.uiText}
        theme={theme}
        activePanel={activeNavPanel}
        onActivePanelChange={setActiveNavPanel}
        onThemeToggle={handleThemeToggle}
        onProjectSelect={handleProjectSelect}
      />
      <NodeInspector
        codeHtml={codeHtml}
        title={data.ui.inspector.title}
        status={data.ui.inspector.status}
        liveSync={liveSync}
      />
      {heroSelection == null && (
        <HeroText
          data={data}
          selection={heroFloorPreview}
          onOpenProyectos={() => setActiveNavPanel("proyectos")}
        />
      )}
      {heroSelection != null && (
        <>
          {/* Bloquea interacción con rail, escena, inspector y controles; el visor (z-100) queda encima. */}
          <div className="project-viewer-backdrop" aria-hidden tabIndex={-1} />
          <ProjectViewerModal
            selection={heroSelection}
            onClose={clearProjectSelection}
            openDemoLabel={data.ui.projectViewer.openDemoLabel}
            projectViewer={data.ui.projectViewer}
          />
        </>
      )}

      <div className="controls-wrapper">
        <ViewControls
          activeView={activeView}
          isOrtho={isOrtho}
          autoRotate={autoRotate}
          onReset={handleResetScene}
          onViewClick={handleViewClick}
          onToggleCamera={handleToggleCamera}
          onToggleAuto={handleToggleAuto}
          labels={data.ui.viewControls}
        />
        <div className="hint">
          <kbd>{data.ui.interactionHint.clickLabel}</kbd> {data.ui.interactionHint.panLabel} &nbsp;
          <kbd>{data.ui.interactionHint.rightClickLabel}</kbd> {data.ui.interactionHint.orbitLabel} &nbsp;
          <kbd>{data.ui.interactionHint.scrollLabel}</kbd> {data.ui.interactionHint.zoomLabel}
        </div>
      </div>

      <LevelControls
        floorCount={floorCount}
        onAdd={handleAddFloor}
        onRemove={handleRemoveFloor}
        floorsLabel={data.ui.levelControls.floorsLabel}
      />

      <div className="level-controls rotation-controls">
        <button className="lvl-btn" onClick={handleIncreaseRotateSpeed} type="button">+</button>
        <span className="lvl-value">{rotateSpeedLevel}</span>
        <button className="lvl-btn" onClick={handleDecreaseRotateSpeed} type="button">−</button>
        <span className="lvl-label">{data.ui.levelControls.rotationLabel}</span>
      </div>
    </>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Nunca asume `THREE.Color` bien formado; tras `dispose` u objetos híbridos, `.setHex` puede faltar.
 */
function safeColorSetHex(
  c: { setHex?: (hex: number) => void } | null | undefined,
  hex: number
): void {
  if (c == null || typeof c.setHex !== "function") return;
  try {
    c.setHex(hex);
  } catch {
    /* color invalidado o material bajo destrucción */
  }
}

function forEachLineBasicMaterial(
  m: THREE.Material | THREE.Material[] | null | undefined,
  fn: (mat: THREE.LineBasicMaterial) => void
): void {
  if (m == null) return;
  if (Array.isArray(m)) {
    m.forEach(mat => {
      if (mat != null && mat instanceof THREE.LineBasicMaterial) fn(mat);
    });
  } else if (m instanceof THREE.LineBasicMaterial) {
    fn(m);
  }
}

function forEachMeshStandardMaterial(
  m: THREE.Material | THREE.Material[] | null | undefined,
  fn: (mat: THREE.MeshStandardMaterial) => void
): void {
  if (m == null) return;
  if (Array.isArray(m)) {
    m.forEach(mat => {
      if (mat != null && mat instanceof THREE.MeshStandardMaterial) fn(mat);
    });
  } else if (m instanceof THREE.MeshStandardMaterial) {
    fn(m);
  }
}

function highlightHoveredFloor(mesh: THREE.Mesh): void {
  const ud = mesh.userData as FloorUserData;
  const palette =
    ud.projectId != null ? PROJECT_HOTSPOT_COLORS[ud.projectId] : undefined;
  try {
    if (!mesh.material) return;
    if (palette) {
      forEachMeshStandardMaterial(mesh.material, mat => {
        safeColorSetHex(mat.color, palette.base);
        safeColorSetHex(mat.emissive, palette.emissive);
        mat.emissiveIntensity = 0.55;
      });
      const line = mesh.children[0];
      if (line instanceof THREE.LineSegments) {
        forEachLineBasicMaterial(line.material, mat => {
          safeColorSetHex(mat.color, palette.line);
        });
      }
    } else {
      forEachMeshStandardMaterial(mesh.material, mat => {
        safeColorSetHex(mat.color, 0x002244);
        safeColorSetHex(mat.emissive, 0x0044aa);
        mat.emissiveIntensity = 0.5;
      });
      const line = mesh.children[0];
      if (line instanceof THREE.LineSegments) {
        forEachLineBasicMaterial(line.material, mat => {
          safeColorSetHex(mat.color, 0x00e5ff);
        });
      }
    }
  } catch {
    /* material u objeto invalidado tras dispose */
  }
}

function resetFloorHighlight(
  mesh: THREE.Mesh,
  baseColor = 0x111111,
  lineColor = 0x333333
): void {
  try {
    if (!mesh.material) return;
    forEachMeshStandardMaterial(mesh.material, mat => {
      safeColorSetHex(mat.color, baseColor);
      safeColorSetHex(mat.emissive, 0x000000);
      mat.emissiveIntensity = 0;
    });
    const line = mesh.children[0];
    if (line instanceof THREE.LineSegments) {
      forEachLineBasicMaterial(line.material, mat => {
        safeColorSetHex(mat.color, lineColor);
      });
    }
  } catch {
    /* material u objeto invalidado tras dispose */
  }
}

function buildFloorCodeHtml(
  d: FloorUserData,
  codeHtmlText: {
    jsonResponseComment: string;
    status: string;
    sync: string;
  }
): string {
  return (
    `<div class="cl">` +
    `<span class="p">&lt;</span><span class="nc">FloorNode</span>` +
    `</div>` +
    `<div class="cl cl-i1">` +
    `<span class="na">guid</span><span class="p">=</span><span class="s">"${d.id}"</span>` +
    `</div>` +
    `<div class="cl cl-i1">` +
    `<span class="na">level</span><span class="p">={</span><span class="m">${d.level}</span><span class="p">}</span>` +
    `</div>` +
    `<div class="cl cl-i1">` +
    `<span class="na">elevation</span><span class="p">={</span><span class="m">${d.elevation}</span><span class="p">}</span>` +
    `</div>` +
    `<div class="cl cl-i1">` +
    `<span class="na">properties</span><span class="p">={{</span>` +
    `</div>` +
    `<div class="cl cl-i2">` +
    `<span class="na">area_m2</span><span class="p">:</span> <span class="m">${d.area}</span><span class="p">,</span>` +
    `</div>` +
    `<div class="cl cl-i2">` +
    `<span class="na">material</span><span class="p">:</span> <span class="s">"${d.material}"</span>` +
    `</div>` +
    `<div class="cl cl-i1"><span class="p">}}</span></div>` +
    `<div class="cl"><span class="p">/&gt;</span></div><br><br>` +
    `<div class="cl"><span class="cm">${codeHtmlText.jsonResponseComment}</span></div>` +
    `<div class="cl">` +
    `<span class="kd">status</span>: <span class="s">"${codeHtmlText.status}"</span>` +
    `</div>` +
    `<div class="cl">` +
    `<span class="kd">sync</span>: <span class="s">"${codeHtmlText.sync}"</span>` +
    `</div>`
  );
}

function sanitizeCodeValue(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;");
}

/** "Control Manager" → "ControlManager" */
function toPascalCase(name: string): string {
  return name
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

type CodeLineIndent = "i1" | "i2";

/** Convierte texto largo en dos líneas si supera `maxLen` caracteres. */
function wrapAttr(
  attr: string,
  value: string,
  indent: CodeLineIndent,
  maxLen = 34
): string {
  const lineClass = `cl cl-${indent}`;
  const safe = sanitizeCodeValue(value);
  const nameAndEq =
    `<span class="na">${attr}</span>` +
    `<span class="p">=</span>`;

  if (value.length <= maxLen) {
    return (
      `<div class="${lineClass}">` +
      nameAndEq +
      `<span class="s">"${safe}"</span>` +
      `</div>`
    );
  }

  const breakAt = value.lastIndexOf(" ", maxLen) > 12
    ? value.lastIndexOf(" ", maxLen)
    : maxLen;
  const safeA = sanitizeCodeValue(value.slice(0, breakAt));
  const safeB = sanitizeCodeValue(value.slice(breakAt).trimStart());
  return (
    `<div class="${lineClass}">` +
    nameAndEq +
    `<span class="s">"${safeA}</span><br>` +
    `<span class="s">${safeB}"</span>` +
    `</div>`
  );
}

function buildProjectCodeHtml(project: ProjectItem): string {
  const componentName = toPascalCase(project.name);

  const stackItems = project.stack
    .map(t => `<span class="s">"${sanitizeCodeValue(t)}"</span>`)
    .join(`<span class="p">,</span> `);

  return (
    `<div class="cl"><span class="cm">// → ${sanitizeCodeValue(project.name)}</span></div>` +
    `<div class="cl">` +
    `<span class="kd">const</span> ` +
    `<span class="nc">${componentName}</span> ` +
    `<span class="p">=</span> ` +
    `<span class="p">()</span> ` +
    `<span class="kd">=&gt;</span> ` +
    `<span class="p">(</span>` +
    `</div>` +
    `<div class="cl cl-i1">` +
    `<span class="p">&lt;</span><span class="nc">ProjectNode</span>` +
    `</div>` +
    `<div class="cl cl-i2"><span class="cm">// Contexto: problema real</span></div>` +
    wrapAttr("contexto", project.context, "i2") +
    `<div class="cl cl-i2"><span class="cm">// Impacto: resultado medible</span></div>` +
    wrapAttr("impacto", project.impact, "i2") +
    `<div class="cl cl-i2"><span class="cm">// Rol exacto</span></div>` +
    wrapAttr("rol", project.role, "i2") +
    `<div class="cl cl-i2">` +
    `<span class="na">stack</span>` +
    `<span class="p">={[</span>${stackItems}<span class="p">]}</span>` +
    `</div>` +
    `<div class="cl cl-i1"><span class="p">&gt;</span></div>` +
    `<div class="cl cl-i2"><span class="cm">// Enlaces</span></div>` +
    wrapAttr("link", project.link, "i2") +
    wrapAttr("github", project.github, "i2") +
    wrapAttr("demo", project.demo, "i2") +
    (project.demoEmbedFallback
      ? wrapAttr("demoEmbedFallback", project.demoEmbedFallback, "i2")
      : "") +
    `<div class="cl cl-i1">` +
    `<span class="p">&lt;/</span>` +
    `<span class="nc">ProjectNode</span>` +
    `<span class="p">&gt;</span>` +
    `</div>` +
    `<div class="cl"><span class="p">);</span></div>`
  );
}

/**
 * Evita que la cámara de perspectiva atraviese el edificio.
 * Traza un rayo desde el target hacia la cámara actual y recorta la distancia
 * cuando encuentra una intersección antes de llegar al ojo.
 */
function preventPerspectiveCameraPenetration(
  controls: OrbitControls,
  camera: THREE.Camera,
  floors: THREE.Mesh[],
  raycaster: THREE.Raycaster,
  tmpDir: THREE.Vector3,
  tmpSafePos: THREE.Vector3
): boolean {
  if (!(camera instanceof THREE.PerspectiveCamera)) return false;
  if (floors.length === 0) return false;

  tmpDir.subVectors(camera.position, controls.target);
  const eyeDistance = tmpDir.length();
  if (eyeDistance <= 0.0001) return false;
  tmpDir.normalize();

  raycaster.set(controls.target, tmpDir);
  raycaster.far = eyeDistance;
  const hits = raycaster.intersectObjects(floors, false);
  if (hits.length === 0) return false;

  const nearestHitDistance = hits[0].distance;
  const safeDistance = Math.max(
    MIN_ZOOM_DISTANCE,
    nearestHitDistance + CAMERA_COLLISION_MARGIN
  );
  if (eyeDistance >= safeDistance) return false;

  tmpSafePos.copy(controls.target).addScaledVector(tmpDir, safeDistance);
  camera.position.copy(tmpSafePos);
  camera.updateMatrixWorld();
  return true;
}

/**
 * Evita que el target de órbita quede dentro del edificio cuando se rota/manualmente.
 * Si hay intersección entre cámara y target, el target se recoloca justo antes del impacto.
 */
function preventPerspectiveTargetPenetration(
  controls: OrbitControls,
  camera: THREE.Camera,
  floors: THREE.Mesh[],
  raycaster: THREE.Raycaster,
  tmpDir: THREE.Vector3,
  tmpSafePos: THREE.Vector3
): boolean {
  if (!(camera instanceof THREE.PerspectiveCamera)) return false;
  if (floors.length === 0) return false;

  tmpDir.subVectors(controls.target, camera.position);
  const targetDistance = tmpDir.length();
  if (targetDistance <= 0.0001) return false;
  tmpDir.normalize();

  raycaster.set(camera.position, tmpDir);
  raycaster.far = targetDistance;
  const hits = raycaster.intersectObjects(floors, false);
  if (hits.length === 0) return false;

  const nearestHitDistance = hits[0].distance;
  const safeDistance = Math.max(0, nearestHitDistance - TARGET_COLLISION_MARGIN);
  if (targetDistance <= safeDistance) return false;

  tmpSafePos.copy(camera.position).addScaledVector(tmpDir, safeDistance);
  controls.target.copy(tmpSafePos);
  return true;
}
