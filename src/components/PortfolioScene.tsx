"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { Hotspot, PortfolioData } from "@/types/portfolio";
import { buildSceneObjects } from "@/utils/three-scene";
import { applyBuildingVariant, type ViewMode } from "@/utils/view-variants";
import { simulateLoad } from "@/utils/simulate-load";
import { LoadingScreen } from "./LoadingScreen";
import { Navbar } from "./Navbar";
import { StatusBar } from "./StatusBar";
import { HeroText } from "./HeroText";
import { SidePanel } from "./SidePanel";
import { ViewControls } from "./ViewControls";

type Props = { data: PortfolioData };

export function PortfolioScene({ data }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isPanelOpenRef = useRef(false);
  const rafRef = useRef(0);

  // Three.js mutable state via refs (no re-renders needed)
  const rotYRef = useRef(0.3);
  const rotXRef = useRef(0.15);
  const targetRotYRef = useRef(0.3);
  const targetRotXRef = useRef(0.15);
  const zoomRef = useRef(12);
  const targetZoomRef = useRef(12);
  const isDraggingRef = useRef(false);
  const autoRotateRef = useRef(true);
  const lastMouseXRef = useRef(0);
  const lastMouseYRef = useRef(0);
  const tRef = useRef(0);
  const buildingMeshesRef = useRef<THREE.Object3D[]>([]);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const viewModeRef = useRef<ViewMode>("wireframe");
  const xrayRef = useRef(false);

  // UI React state (triggers re-renders only when needed)
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadText, setLoadText] = useState("Initializing 3D engine...");
  const [loadHidden, setLoadHidden] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("all");
  const [viewMode, setViewModeState] = useState<ViewMode>("wireframe");
  const [xray, setXrayState] = useState(false);

  // High-frequency DOM refs (updated directly in rAF, never via state)
  const coordXRef = useRef<HTMLSpanElement>(null);
  const coordYRef = useRef<HTMLSpanElement>(null);
  const coordZRef = useRef<HTMLSpanElement>(null);
  const coordAzRef = useRef<HTMLSpanElement>(null);
  const coordElRef = useRef<HTMLSpanElement>(null);
  const sbHoverRef = useRef<HTMLSpanElement>(null);
  const hotspotLabelRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const openHotspotPanel = useCallback(
    (id: string) => {
      const h = data.hotspots.find(x => x.id === id);
      if (!h) return;
      autoRotateRef.current = false;
      isPanelOpenRef.current = true;
      setSelectedHotspot(h);
      setIsPanelOpen(true);
    },
    [data.hotspots]
  );

  const closePanel = useCallback(() => {
    isPanelOpenRef.current = false;
    autoRotateRef.current = true;
    setIsPanelOpen(false);
  }, []);

  const handleSetViewMode = useCallback((mode: ViewMode) => {
    viewModeRef.current = mode;
    setViewModeState(mode);
    const scene = sceneRef.current;
    if (!scene) return;
    applyBuildingVariant(scene, mode, xrayRef.current);
  }, []);

  const handleToggleXray = useCallback(() => {
    const next = !xrayRef.current;
    xrayRef.current = next;
    setXrayState(next);
    const scene = sceneRef.current;
    if (!scene) return;
    applyBuildingVariant(scene, viewModeRef.current, next);
  }, []);

  const handleResetCamera = useCallback(() => {
    targetRotYRef.current = 0.3;
    targetRotXRef.current = 0.15;
    targetZoomRef.current = 12;
    viewModeRef.current = "wireframe";
    xrayRef.current = false;
    setViewModeState("wireframe");
    setXrayState(false);
    const scene = sceneRef.current;
    if (!scene) return;
    applyBuildingVariant(scene, "wireframe", false);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const W = window.innerWidth;
    const H = window.innerHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x050c1a, 1);
    rendererRef.current = renderer;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 1000);
    camera.position.set(0, 4, zoomRef.current);
    cameraRef.current = camera;

    // Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Build scene
    buildSceneObjects(scene, buildingMeshesRef.current, data.hotspots);
    applyBuildingVariant(scene, viewModeRef.current, xrayRef.current);

    // Lights
    scene.add(new THREE.AmbientLight(0x4a9eff, 0.3));
    const dirLight = new THREE.DirectionalLight(0x8b5cf6, 0.5);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Animation loop
    function animate() {
      rafRef.current = requestAnimationFrame(animate);
      tRef.current += 0.01;

      if (!isDraggingRef.current && autoRotateRef.current && !isPanelOpenRef.current) {
        targetRotYRef.current += 0.003;
      }
      rotYRef.current += (targetRotYRef.current - rotYRef.current) * 0.05;
      rotXRef.current += (targetRotXRef.current - rotXRef.current) * 0.05;
      zoomRef.current += (targetZoomRef.current - zoomRef.current) * 0.05;

      const phi = rotXRef.current;
      const theta = rotYRef.current;
      camera.position.x = zoomRef.current * Math.sin(theta) * Math.cos(phi);
      camera.position.y = 4 + zoomRef.current * Math.sin(phi);
      camera.position.z = zoomRef.current * Math.cos(theta) * Math.cos(phi);
      camera.lookAt(0, 1, 0);

      // Pulse rings
      scene.children.forEach(obj => {
        if (obj.userData.ring) {
          const s = 1 + 0.3 * Math.sin(tRef.current * 2);
          obj.scale.set(s, s, 1);
          if (obj instanceof THREE.Mesh) {
            (obj.material as THREE.MeshBasicMaterial).opacity =
              0.4 - 0.3 * Math.abs(Math.sin(tRef.current * 2));
          }
          obj.lookAt(camera.position);
        }
      });

      // Hotspot screen positions (direct DOM)
      data.hotspots.forEach(h => {
        const el = hotspotLabelRefs.current[h.id];
        if (!el) return;
        const v = new THREE.Vector3(h.worldPos.x, h.worldPos.y, h.worldPos.z);
        v.project(camera);
        el.style.left = `${(v.x * 0.5 + 0.5) * window.innerWidth}px`;
        el.style.top = `${(-v.y * 0.5 + 0.5) * window.innerHeight}px`;
        el.style.display = v.z < 1 ? "block" : "none";
      });

      // Coords (direct DOM)
      if (coordXRef.current) coordXRef.current.textContent = camera.position.x.toFixed(1);
      if (coordYRef.current) coordYRef.current.textContent = camera.position.y.toFixed(1);
      if (coordZRef.current) coordZRef.current.textContent = camera.position.z.toFixed(1);
      if (coordAzRef.current)
        coordAzRef.current.textContent = `${((rotYRef.current * 180) / Math.PI % 360).toFixed(0)}°`;
      if (coordElRef.current)
        coordElRef.current.textContent = `${((rotXRef.current * 180) / Math.PI).toFixed(0)}°`;

      renderer.render(scene, camera);
    }
    animate();

    // ── Events ──────────────────────────────────────────────────────────────
    function onMouseDown(e: MouseEvent) {
      isDraggingRef.current = true;
      autoRotateRef.current = false;
      lastMouseXRef.current = e.clientX;
      lastMouseYRef.current = e.clientY;
    }

    function onMouseUp() {
      isDraggingRef.current = false;
      if (!isPanelOpenRef.current) {
        setTimeout(() => { autoRotateRef.current = true; }, 2000);
      }
    }

    function onMouseMove(e: MouseEvent) {
      if (isDraggingRef.current) {
        const dx = e.clientX - lastMouseXRef.current;
        const dy = e.clientY - lastMouseYRef.current;
        targetRotYRef.current += dx * 0.008;
        targetRotXRef.current -= dy * 0.008;
        targetRotXRef.current = Math.max(-0.5, Math.min(0.8, targetRotXRef.current));
        lastMouseXRef.current = e.clientX;
        lastMouseYRef.current = e.clientY;
      }

      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(buildingMeshesRef.current, false);

      if (hits.length > 0 && hits[0].object.userData.hotspot) {
        canvas.style.cursor = "pointer";
        const found = data.hotspots.find(h => h.id === hits[0].object.userData.hotspot);
        if (sbHoverRef.current)
          sbHoverRef.current.textContent = `↗ Click: ${found?.label ?? ""}`;
      } else {
        canvas.style.cursor = isDraggingRef.current ? "grabbing" : "grab";
        if (sbHoverRef.current)
          sbHoverRef.current.textContent = "Hover a component to explore ↗";
      }
    }

    function onClick(e: MouseEvent) {
      if (Math.abs(e.clientX - lastMouseXRef.current) > 3) return;
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(buildingMeshesRef.current, false);
      if (hits.length > 0 && hits[0].object.userData.hotspot) {
        const id = hits[0].object.userData.hotspot as string;
        const h = data.hotspots.find(x => x.id === id);
        if (h) {
          autoRotateRef.current = false;
          isPanelOpenRef.current = true;
          setSelectedHotspot(h);
          setIsPanelOpen(true);
        }
      }
    }

    function onWheel(e: WheelEvent) {
      targetZoomRef.current += e.deltaY * 0.02;
      targetZoomRef.current = Math.max(6, Math.min(22, targetZoomRef.current));
    }

    let lastTouchX = 0;
    let lastTouchY = 0;
    let lastPinchDist = 0;

    function onTouchStart(e: TouchEvent) {
      if (e.touches.length === 1) {
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
        isDraggingRef.current = true;
        autoRotateRef.current = false;
      } else if (e.touches.length === 2) {
        lastPinchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    }

    function onTouchMove(e: TouchEvent) {
      e.preventDefault();
      if (e.touches.length === 1 && isDraggingRef.current) {
        const dx = e.touches[0].clientX - lastTouchX;
        const dy = e.touches[0].clientY - lastTouchY;
        targetRotYRef.current += dx * 0.01;
        targetRotXRef.current -= dy * 0.01;
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        const d = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        targetZoomRef.current -= (d - lastPinchDist) * 0.05;
        targetZoomRef.current = Math.max(6, Math.min(22, targetZoomRef.current));
        lastPinchDist = d;
      }
    }

    function onTouchEnd() {
      isDraggingRef.current = false;
      setTimeout(() => { autoRotateRef.current = true; }, 2000);
    }

    function onResize() {
      const nW = window.innerWidth;
      const nH = window.innerHeight;
      renderer.setSize(nW, nH);
      camera.aspect = nW / nH;
      camera.updateProjectionMatrix();
    }

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("click", onClick);
    canvas.addEventListener("wheel", onWheel);
    canvas.addEventListener("touchstart", onTouchStart);
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);
    window.addEventListener("resize", onResize);

    // Loading simulation
    simulateLoad(
      p => setLoadProgress(p),
      msg => setLoadText(msg),
      () => setLoadHidden(true)
    );

    return () => {
      cancelAnimationFrame(rafRef.current);
      renderer.dispose();
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", onResize);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <LoadingScreen progress={loadProgress} text={loadText} hidden={loadHidden} />

      <canvas ref={canvasRef} id="three-canvas" />

      <div className="grid-overlay" />
      <div className="vignette" />

      <StatusBar data={data.status} sbHoverRef={sbHoverRef} />

      <Navbar
        logo={data.nav.logo}
        links={data.nav.links}
        cta={data.nav.cta}
        activeNav={activeNav}
        onNavClick={setActiveNav}
        onCtaClick={() => openHotspotPanel("about")}
      />

      <HeroText data={data} />

      {/* Hotspot floating labels */}
      <div id="hotspots">
        {data.hotspots.map(h => (
          <div
            key={h.id}
            ref={el => {
              hotspotLabelRefs.current[h.id] = el;
            }}
            className="hotspot-label"
            style={{ display: "none" }}
            onClick={() => openHotspotPanel(h.id)}
          >
            <div
              className="hl-inner"
              style={{
                border: `1px solid ${h.color}55`,
                boxShadow: `0 0 20px ${h.color}15`
              }}
            >
              <div className="hl-cat" style={{ color: h.color }}>
                {h.cat}
              </div>
              <div className="hl-name">{h.label}</div>
            </div>
            <div
              className="hl-line"
              style={{
                background: `linear-gradient(to bottom, ${h.color}88, transparent)`
              }}
            />
            <div
              className="hl-dot"
              style={{
                background: h.color,
                boxShadow: `0 0 0 3px ${h.color}33, 0 0 12px ${h.color}44`
              }}
            />
          </div>
        ))}
      </div>

      {/* Coordinates */}
      <div className="coords">
        // <span ref={coordXRef}>0.0</span>,&nbsp;
        <span ref={coordYRef}>0.0</span>,&nbsp;
        <span ref={coordZRef}>0.0</span>
        <br />θ <span ref={coordAzRef}>0°</span> · φ&nbsp;
        <span ref={coordElRef}>0°</span>
      </div>

      {/* Viewer info */}
      <div className="viewer-info">
        <span>// {data.meta.modelFile}</span>
        <br />
        Drag · Scroll · Click
      </div>

      <ViewControls
        viewMode={viewMode}
        xray={xray}
        onSetViewMode={handleSetViewMode}
        onToggleXray={handleToggleXray}
        onReset={handleResetCamera}
      />

      <SidePanel hotspot={selectedHotspot} isOpen={isPanelOpen} onClose={closePanel} />
    </>
  );
}
