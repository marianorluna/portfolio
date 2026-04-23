import type { ViewPreset } from "@/utils/view-variants";

type Props = {
  activeView: ViewPreset | null;
  isOrtho: boolean;
  autoRotate: boolean;
  onViewClick: (view: ViewPreset) => void;
  onToggleCamera: () => void;
  onToggleAuto: () => void;
};

export function ViewControls({
  activeView,
  isOrtho,
  autoRotate,
  onViewClick,
  onToggleCamera,
  onToggleAuto,
}: Props) {
  return (
    <div className="view-controls">
      <button
        className={`view-btn${activeView === "iso" ? " active" : ""}`}
        onClick={() => onViewClick("iso")}
        type="button"
      >
        Iso
      </button>
      <button
        className={`view-btn${activeView === "top" ? " active" : ""}`}
        onClick={() => onViewClick("top")}
        type="button"
      >
        Planta
      </button>
      <button
        className={`view-btn${activeView === "front" ? " active" : ""}`}
        onClick={() => onViewClick("front")}
        type="button"
      >
        Alzado
      </button>
      <div className="view-sep" />
      <button
        className={`view-btn${isOrtho ? " active" : ""}`}
        onClick={onToggleCamera}
        type="button"
      >
        {isOrtho ? "Ortogonal" : "Perspectiva"}
      </button>
      <div className="view-sep" />
      <button
        className={`view-btn${autoRotate ? " active" : ""}`}
        onClick={onToggleAuto}
        type="button"
      >
        Auto
      </button>
    </div>
  );
}
