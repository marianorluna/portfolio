import type { ViewMode } from "@/utils/view-variants";

type Props = {
  viewMode: ViewMode;
  xray: boolean;
  onSetViewMode: (mode: ViewMode) => void;
  onToggleXray: () => void;
  onReset: () => void;
};

export function ViewControls({ viewMode, xray, onSetViewMode, onToggleXray, onReset }: Props) {
  return (
    <div className="view-controls">
      <button
        className={`vc-btn${viewMode === "wireframe" ? " active" : ""}`}
        onClick={() => onSetViewMode("wireframe")}
        type="button"
      >
        Wireframe
      </button>
      <div className="vc-sep" />
      <button
        className={`vc-btn${viewMode === "solid" ? " active" : ""}`}
        onClick={() => onSetViewMode("solid")}
        type="button"
      >
        Solid
      </button>
      <div className="vc-sep" />
      <button
        className={`vc-btn${xray ? " active" : ""}`}
        onClick={onToggleXray}
        type="button"
      >
        X-Ray
      </button>
      <div className="vc-sep" />
      <button className="vc-btn" onClick={onReset} type="button">
        Reset
      </button>
    </div>
  );
}
