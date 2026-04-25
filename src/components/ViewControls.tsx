import type { ViewPreset } from "@/utils/view-variants";

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
  return (
    <div className="view-controls">
      <button className="view-btn" onClick={onReset} type="button" title={labels.resetTitle}>
        {labels.resetLabel}
      </button>
      <div className="view-sep" />
      <button
        className={`view-btn${activeView === "iso" ? " active" : ""}`}
        onClick={() => onViewClick("iso")}
        type="button"
      >
        {labels.isoLabel}
      </button>
      <button
        className={`view-btn${activeView === "top" ? " active" : ""}`}
        onClick={() => onViewClick("top")}
        type="button"
      >
        {labels.topLabel}
      </button>
      <button
        className={`view-btn${activeView === "front" ? " active" : ""}`}
        onClick={() => onViewClick("front")}
        type="button"
      >
        {labels.frontLabel}
      </button>
      <div className="view-sep" />
      <button
        className={`view-btn${isOrtho ? " active" : ""}`}
        onClick={onToggleCamera}
        type="button"
      >
        {isOrtho ? labels.orthoLabel : labels.perspectiveLabel}
      </button>
      <div className="view-sep" />
      <button
        className={`view-btn${autoRotate ? " active" : ""}`}
        onClick={onToggleAuto}
        type="button"
        aria-pressed={autoRotate}
        title={autoRotate ? labels.autoRotateOnTitle : labels.autoRotateOffTitle}
      >
        {labels.rotateLabel}
      </button>
    </div>
  );
}
