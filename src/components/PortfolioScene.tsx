"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { PortfolioData } from "@/types/portfolio";
import { setupScene } from "@/utils/three-scene";
import {
  createFloor,
  createBaseMaterial,
  createLineMaterial,
  FLOOR_HEIGHT,
  type FloorUserData,
} from "@/utils/building-model";
import { getViewTarget, type ViewPreset } from "@/utils/view-variants";
import { simulateLoad } from "@/utils/simulate-load";
import { LoadingScreen } from "./LoadingScreen";
import { Navbar } from "./Navbar";
import { HeroText } from "./HeroText";
import { NodeInspector } from "./NodeInspector";
import { ViewControls } from "./ViewControls";
import { LevelControls } from "./LevelControls";

const FRUSTUM_SIZE = 40;
const MAX_FLOORS = 40;
const INITIAL_FLOORS = 15;
const DESKTOP_OFFSET_X = 10;

const DEFAULT_CODE_HTML =
  `<span class="kd">const</span> <span class="na">BuildingModel</span> <span class="p">=</span> () <span class="kd">=&gt;</span> {<br>` +
  `&nbsp;&nbsp;<span class="kd">return</span> (<br>` +
  `&nbsp;&nbsp;&nbsp;&nbsp;<span class="p">&lt;</span><span class="nc">IFCContainer</span> <span class="na">id=</span><span class="s">"TWIN-01"</span><span class="p">&gt;</span><br>` +
  `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="cm">// Interactúa con el modelo 3D</span><br>` +
  `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="cm">// para inspeccionar los nodos.</span><br>` +
  `&nbsp;&nbsp;&nbsp;&nbsp;<span class="p">&lt;/</span><span class="nc">IFCContainer</span><span class="p">&gt;</span><br>` +
  `&nbsp;&nbsp;);<br>};`;

type Props = { data: PortfolioData };

export function PortfolioScene({ data }: Props) {
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

  // Animation state refs
  const isFlyingRef = useRef(false);
  const flyTargetPosRef = useRef(new THREE.Vector3());
  const flyTargetLookAtRef = useRef(new THREE.Vector3());
  const isOrthoRef = useRef(false);
  const autoRotateRef = useRef(true);
  const activeViewRef = useRef<ViewPreset | null>(null);
  const floorCountRef = useRef(INITIAL_FLOORS);
  const rafRef = useRef(0);

  // React UI state
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadText, setLoadText] = useState("Initializing 3D engine...");
  const [loadHidden, setLoadHidden] = useState(false);
  const [floorCount, setFloorCount] = useState(INITIAL_FLOORS);
  const [codeHtml, setCodeHtml] = useState(DEFAULT_CODE_HTML);
  const [isOrtho, setIsOrtho] = useState(false);
  const [activeView, setActiveView] = useState<ViewPreset | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);

  // ── UI Handlers ──────────────────────────────────────────────────────────

  const handleAddFloor = useCallback(() => {
    if (floorCountRef.current >= MAX_FLOORS) return;
    const baseMat = baseMaterialRef.current;
    const lineMat = lineMaterialRef.current;
    const buildingGroup = buildingGroupRef.current;
    if (!baseMat || !lineMat || !buildingGroup) return;

    const { group, mesh } = createFloor(floorCountRef.current, baseMat, lineMat);
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
        if (tooltipRef.current) tooltipRef.current.style.opacity = "0";
        setCodeHtml(DEFAULT_CODE_HTML);
      }
    }
  }, []);

  const handleViewClick = useCallback((view: ViewPreset) => {
    const controls = controlsRef.current;
    const camera = activeCameraRef.current;
    if (!controls || !camera) return;

    const bX = window.innerWidth > 768 ? DESKTOP_OFFSET_X : 0;
    const target = getViewTarget(view, bX);
    flyTargetPosRef.current.copy(target.position);
    flyTargetLookAtRef.current.copy(target.lookAt);
    isFlyingRef.current = true;

    autoRotateRef.current = false;
    controls.autoRotate = false;
    setAutoRotate(false);
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
    controls.update();
  }, []);

  // ── Three.js Setup ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const aspect = W / H;
    const isDesk = W > 768;
    const bX = isDesk ? DESKTOP_OFFSET_X : 0;

    // Scene
    const scene = setupScene();
    sceneRef.current = scene;

    // Cameras
    const cameraPersp = new THREE.PerspectiveCamera(45, aspect, 1, 1000);
    cameraPersp.position.set(40, 30, 50);
    cameraPerspRef.current = cameraPersp;

    const cameraOrtho = new THREE.OrthographicCamera(
      (FRUSTUM_SIZE * aspect) / -2,
      (FRUSTUM_SIZE * aspect) / 2,
      FRUSTUM_SIZE / 2,
      FRUSTUM_SIZE / -2,
      1, 1000
    );
    cameraOrtho.position.copy(cameraPersp.position);
    cameraOrthoRef.current = cameraOrtho;
    activeCameraRef.current = cameraPersp;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x050505, 1);
    rendererRef.current = renderer;

    // OrbitControls
    const controls = new OrbitControls(cameraPersp, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.target.set(bX, 10, 0);
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;
    controlsRef.current = controls;

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
      buildingGroup.add(group);
      floors.push(mesh);
    }
    floorsRef.current = floors;

    // ── Animation Loop ────────────────────────────────────────────────────

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
            setCodeHtml(DEFAULT_CODE_HTML);
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

      // Si el hover apuntaba a un mesh ya eliminado, limpiar UI sin tocar materiales
      {
        const stale = intersectedRef.current;
        if (stale && !floorsRef.current.includes(stale)) {
          intersectedRef.current = null;
          if (tooltipRef.current) tooltipRef.current.style.opacity = "0";
          setCodeHtml(DEFAULT_CODE_HTML);
        }
      }

      // Raycasting hover: recursive=true (default) pega en los bordes LineSegments, sin userData
      raycasterRef.current.setFromCamera(mouseRef.current, activeCameraRef.current!);
      const intersects = raycasterRef.current.intersectObjects(floorsRef.current, false);

      if (intersects.length > 0) {
        const obj = intersects[0].object as THREE.Mesh;
        if (intersectedRef.current !== obj) {
          if (intersectedRef.current) resetFloorHighlight(intersectedRef.current);
          intersectedRef.current = obj;
          highlightFloor(obj);

          const d = obj.userData as FloorUserData;
          if (tooltipRef.current) {
            tooltipRef.current.innerHTML = `&lt;${d.id} /&gt;`;
            tooltipRef.current.style.opacity = "1";
          }
          setCodeHtml(buildFloorCodeHtml(d));
        }
      } else if (intersectedRef.current) {
        resetFloorHighlight(intersectedRef.current);
        intersectedRef.current = null;
        if (tooltipRef.current) tooltipRef.current.style.opacity = "0";
        setCodeHtml(DEFAULT_CODE_HTML);
      }

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
      isFlyingRef.current = false;
      autoRotateRef.current = false;
      controls.autoRotate = false;
      setAutoRotate(false);
      activeViewRef.current = null;
      setActiveView(null);
    });

    document.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", onResize);

    simulateLoad(
      p => setLoadProgress(p),
      msg => setLoadText(msg),
      () => setLoadHidden(true)
    );

    return () => {
      cancelAnimationFrame(rafRef.current);
      controls.dispose();
      renderer.dispose();
      document.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <>
      <LoadingScreen progress={loadProgress} text={loadText} hidden={loadHidden} />

      <canvas ref={canvasRef} id="three-canvas" />
      <div id="tooltip" ref={tooltipRef} />

      <Navbar brand={data.nav.brand} links={data.nav.links} />
      <NodeInspector codeHtml={codeHtml} />
      <HeroText data={data} />

      <div className="controls-wrapper">
        <ViewControls
          activeView={activeView}
          isOrtho={isOrtho}
          autoRotate={autoRotate}
          onViewClick={handleViewClick}
          onToggleCamera={handleToggleCamera}
          onToggleAuto={handleToggleAuto}
        />
        <div className="hint">
          <kbd>Click</kbd> Orbitar &nbsp;
          <kbd>Click Der</kbd> Pan &nbsp;
          <kbd>Scroll</kbd> Zoom
        </div>
      </div>

      <LevelControls
        floorCount={floorCount}
        onAdd={handleAddFloor}
        onRemove={handleRemoveFloor}
      />
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

function highlightFloor(mesh: THREE.Mesh): void {
  try {
    if (!mesh.material) return;
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
  } catch {
    /* material u objeto invalidado tras dispose */
  }
}

function resetFloorHighlight(mesh: THREE.Mesh): void {
  try {
    if (!mesh.material) return;
    forEachMeshStandardMaterial(mesh.material, mat => {
      safeColorSetHex(mat.color, 0x111111);
      safeColorSetHex(mat.emissive, 0x000000);
      mat.emissiveIntensity = 0;
    });
    const line = mesh.children[0];
    if (line instanceof THREE.LineSegments) {
      forEachLineBasicMaterial(line.material, mat => {
        safeColorSetHex(mat.color, 0x333333);
      });
    }
  } catch {
    /* material u objeto invalidado tras dispose */
  }
}

function buildFloorCodeHtml(d: FloorUserData): string {
  return (
    `<span class="p">&lt;</span><span class="nc">FloorNode</span><br>` +
    `&nbsp;&nbsp;<span class="na">guid</span><span class="p">=</span><span class="s">"${d.id}"</span><br>` +
    `&nbsp;&nbsp;<span class="na">level</span><span class="p">={</span><span class="m">${d.level}</span><span class="p">}</span><br>` +
    `&nbsp;&nbsp;<span class="na">elevation</span><span class="p">={</span><span class="m">${d.elevation}</span><span class="p">}</span><br>` +
    `&nbsp;&nbsp;<span class="na">properties</span><span class="p">={{</span><br>` +
    `&nbsp;&nbsp;&nbsp;&nbsp;<span class="na">area_m2</span><span class="p">:</span> <span class="m">${d.area}</span><span class="p">,</span><br>` +
    `&nbsp;&nbsp;&nbsp;&nbsp;<span class="na">material</span><span class="p">:</span> <span class="s">"${d.material}"</span><br>` +
    `&nbsp;&nbsp;<span class="p">}}</span><br>` +
    `<span class="p">/&gt;</span><br><br>` +
    `<span class="cm">// JSON Query Response</span><br>` +
    `<span class="kd">status</span>: <span class="s">"200 OK"</span><br>` +
    `<span class="kd">sync</span>: <span class="s">"realtime"</span>`
  );
}
