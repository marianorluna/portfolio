import { useState } from "react";
import { InspectorAccordionBody } from "./InspectorAccordionBody";
import type { InspectorContent } from "@/types/inspector";

type Props = {
  content: InspectorContent;
  title: string;
  status: string;
  /** true cuando hay hover sobre el modelo 3D o un proyecto fijado en el inspector. */
  liveSync: boolean;
  mode?: "inline" | "mobileOverlay";
  onClose?: () => void;
  closeLabel?: string;
  expandLabel?: string;
  collapseLabel?: string;
  collapseAllLabel?: string;
};

export function NodeInspector({
  content,
  title,
  status,
  liveSync,
  mode = "inline",
  onClose,
  closeLabel = "Cerrar",
  expandLabel = "Expandir",
  collapseLabel = "Contraer",
  collapseAllLabel = "Contraer todo",
}: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isOverlay = mode === "mobileOverlay";

  if (isOverlay) {
    return (
      <div className="data-panel data-panel--mobile-overlay" role="dialog" aria-modal="true" aria-label={title}>
        <div className="data-panel__mobile-overlay-header">
          <span className="panel-title-text">{title}</span>
          <span className="panel-header-right">
            <span className={`status-indicator ${liveSync ? "is-live" : ""}`}>{status}</span>
          </span>
        </div>
        <div className="data-panel__mobile-overlay-body inspector-body-wrapper">
          <InspectorAccordionBody
            content={content}
            collapseAllLabel={collapseAllLabel}
          />
        </div>
        {onClose != null ? (
          <div className="data-panel__mobile-overlay-footer">
            <button
              type="button"
              className="btn btn-secondary project-viewer__btn-close"
              onClick={onClose}
            >
              {closeLabel}
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`data-panel ${isCollapsed ? "is-collapsed" : ""}`}>
      <button
        type="button"
        className="panel-header panel-header-toggle"
        onClick={() => setIsCollapsed((prev) => !prev)}
        aria-expanded={!isCollapsed}
        aria-label={`${isCollapsed ? expandLabel : collapseLabel} ${title}`}
      >
        <span className="panel-title-text">{title}</span>
        <span className="panel-header-right">
          <span className={`status-indicator ${liveSync ? "is-live" : ""}`}>{status}</span>
          <span className={`panel-chevron ${isCollapsed ? "is-collapsed" : ""}`} aria-hidden>
            ▾
          </span>
        </span>
      </button>
      <div className="inspector-body-wrapper" aria-hidden={isCollapsed}>
        {isCollapsed ? null : (
          <InspectorAccordionBody
            content={content}
            collapseAllLabel={collapseAllLabel}
          />
        )}
      </div>
    </div>
  );
}
