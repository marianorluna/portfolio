import type { ViewPreset } from "@/utils/view-variants";
import { useEffect, useRef, useState } from "react";

function Icon({
  name,
}: {
  name:
    | "home"
    | "iso"
    | "top"
    | "front"
    | "camera-ortho"
    | "camera-persp"
    | "rotate";
}) {
  switch (name) {
    case "home":
      return (
        <svg className="view-icon" viewBox="0 0 24 24" aria-hidden focusable="false">
          <path d="M4 11.5L12 4l8 7.5" />
          <path d="M7 10.8V20h10v-9.2" />
          <path d="M10 20v-5h4v5" />
        </svg>
      );
    case "iso":
      return (
        <svg className="view-icon" viewBox="0 0 24 24" aria-hidden focusable="false">
          <path d="M12 2.5l8.5 4.8L12 12 3.5 7.3 12 2.5z" />
          <path d="M3.5 7.3V17L12 21.5V12" />
          <path d="M20.5 7.3V17L12 21.5" />
        </svg>
      );
    case "top":
      return (
        <svg className="view-icon" viewBox="0 0 24 24" aria-hidden focusable="false">
          <path d="M12 2.5l8.5 4.8L12 12 3.5 7.3 12 2.5z" />
          <path className="view-icon__face" d="M12 2.5l8.5 4.8L12 12 3.5 7.3 12 2.5z" />
          <path d="M3.5 7.3V17L12 21.5l8.5-4.5V7.3" />
        </svg>
      );
    case "front":
      return (
        <svg className="view-icon" viewBox="0 0 24 24" aria-hidden focusable="false">
          <path d="M12 2.5l8.5 4.8L12 12 3.5 7.3 12 2.5z" />
          <path d="M3.5 7.3V17L12 21.5V12" />
          <path d="M20.5 7.3V17L12 21.5" />
          <path className="view-icon__face" d="M3.5 7.3V17L12 21.5V12L3.5 7.3z" />
        </svg>
      );
    case "camera-ortho":
      return (
        <svg className="view-icon" viewBox="0 0 24 24" aria-hidden focusable="false">
          <path d="M12 2.5l8.5 4.8L12 12 3.5 7.3 12 2.5z" />
          <path d="M3.5 7.3V17L12 21.5V12" />
          <path d="M20.5 7.3V17L12 21.5" />
          <path d="M2.2 9.4h4.2" />
          <path d="M2.2 12h4.2" />
          <path d="M2.2 14.6h4.2" />
        </svg>
      );
    case "camera-persp":
      return (
        <svg className="view-icon" viewBox="0 0 24 24" aria-hidden focusable="false">
          <path d="M12 2.5l8.5 4.8L12 12 3.5 7.3 12 2.5z" />
          <path d="M3.5 7.3V17L12 21.5V12" />
          <path d="M20.5 7.3V17L12 21.5" />
          <path d="M2.4 12l4-2.6" />
          <path d="M2.4 12l4 2.6" />
          <path d="M2.4 12h4" />
        </svg>
      );
    case "rotate":
      return (
        <svg className="view-icon" viewBox="0 0 24 24" aria-hidden focusable="false">
          <path d="M12 3a9 9 0 1 0 9 9" />
          <path d="M21 3v6h-6" />
        </svg>
      );
  }
}

type Props = {
  activeView: ViewPreset | null;
  isOrtho: boolean;
  autoRotate: boolean;
  onReset: () => void;
  onViewClick: (view: ViewPreset) => void;
  onToggleCamera: () => void;
  onToggleAuto: () => void;
  labels: {
    resetTitle: string;
    resetLabel: string;
    isoLabel: string;
    topLabel: string;
    frontLabel: string;
    orthoLabel: string;
    perspectiveLabel: string;
    autoRotateOnTitle: string;
    autoRotateOffTitle: string;
    rotateLabel: string;
  };
};

export function ViewControls({
  activeView,
  isOrtho,
  autoRotate,
  onReset,
  onViewClick,
  onToggleCamera,
  onToggleAuto,
  labels,
}: Props) {
  const isCoarseRef = useRef(false);
  const hideTimerRef = useRef<number | null>(null);
  const [touchTooltip, setTouchTooltip] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia?.("(pointer: coarse)");
    const commit = () => {
      isCoarseRef.current = Boolean(mq?.matches);
      if (!isCoarseRef.current) setTouchTooltip(null);
    };
    commit();
    mq?.addEventListener?.("change", commit);
    return () => {
      mq?.removeEventListener?.("change", commit);
      if (hideTimerRef.current != null) window.clearTimeout(hideTimerRef.current);
    };
  }, []);

  const showTouchTooltip = (text: string) => {
    if (typeof window === "undefined") return;
    if (!isCoarseRef.current) return;
    setTouchTooltip(text);
    if (hideTimerRef.current != null) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => setTouchTooltip(null), 1400);
  };

  return (
    <div className="view-controls">
      <button
        className="view-btn"
        onClick={() => {
          onReset();
          showTouchTooltip(labels.resetLabel);
        }}
        type="button"
        title={labels.resetTitle}
        aria-label={labels.resetLabel}
      >
        <span className="view-icon-wrap">
          <Icon name="home" />
        </span>
        <span className="view-label">{labels.resetLabel}</span>
      </button>
      <div className="view-sep" />
      <button
        className={`view-btn${activeView === "iso" ? " active" : ""}`}
        onClick={() => {
          onViewClick("iso");
          showTouchTooltip(labels.isoLabel);
        }}
        type="button"
        aria-label={labels.isoLabel}
      >
        <span className="view-icon-wrap">
          <Icon name="iso" />
        </span>
        <span className="view-label">{labels.isoLabel}</span>
      </button>
      <button
        className={`view-btn${activeView === "top" ? " active" : ""}`}
        onClick={() => {
          onViewClick("top");
          showTouchTooltip(labels.topLabel);
        }}
        type="button"
        aria-label={labels.topLabel}
      >
        <span className="view-icon-wrap">
          <Icon name="top" />
        </span>
        <span className="view-label">{labels.topLabel}</span>
      </button>
      <button
        className={`view-btn${activeView === "front" ? " active" : ""}`}
        onClick={() => {
          onViewClick("front");
          showTouchTooltip(labels.frontLabel);
        }}
        type="button"
        aria-label={labels.frontLabel}
      >
        <span className="view-icon-wrap">
          <Icon name="front" />
        </span>
        <span className="view-label">{labels.frontLabel}</span>
      </button>
      <div className="view-sep" />
      <button
        className={`view-btn${isOrtho ? " active" : ""}`}
        onClick={() => {
          onToggleCamera();
          showTouchTooltip(isOrtho ? labels.orthoLabel : labels.perspectiveLabel);
        }}
        type="button"
        aria-label={isOrtho ? labels.orthoLabel : labels.perspectiveLabel}
      >
        <span className="view-icon-wrap">
          <Icon name={isOrtho ? "camera-ortho" : "camera-persp"} />
        </span>
        <span className="view-label">{isOrtho ? labels.orthoLabel : labels.perspectiveLabel}</span>
      </button>
      <div className="view-sep" />
      <button
        className={`view-btn${autoRotate ? " active" : ""}`}
        onClick={() => {
          onToggleAuto();
          showTouchTooltip(labels.rotateLabel);
        }}
        type="button"
        aria-pressed={autoRotate}
        title={autoRotate ? labels.autoRotateOnTitle : labels.autoRotateOffTitle}
        aria-label={labels.rotateLabel}
      >
        <span className="view-icon-wrap">
          <Icon name="rotate" />
        </span>
        <span className="view-label">{labels.rotateLabel}</span>
      </button>

      {touchTooltip != null && (
        <div className="view-touch-tooltip" role="status" aria-live="polite">
          {touchTooltip}
        </div>
      )}
    </div>
  );
}
