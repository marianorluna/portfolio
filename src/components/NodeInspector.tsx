import { useState } from "react";

type Props = {
  codeHtml: string;
  title: string;
  status: string;
  /** true cuando hay hover sobre el modelo 3D o un proyecto fijado en el inspector. */
  liveSync: boolean;
  mode?: "inline" | "mobileOverlay";
  onClose?: () => void;
  closeLabel?: string;
  expandLabel?: string;
  collapseLabel?: string;
};

export function NodeInspector({
  codeHtml,
  title,
  status,
  liveSync,
  mode = "inline",
  onClose,
  closeLabel = "Cerrar",
  expandLabel = "Expandir",
  collapseLabel = "Contraer",
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
        <div className="code-block-wrapper data-panel__mobile-overlay-body">
          <div className="code-block" dangerouslySetInnerHTML={{ __html: codeHtml }} />
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
      <div className="code-block-wrapper" aria-hidden={isCollapsed}>
        <div className="code-block" dangerouslySetInnerHTML={{ __html: codeHtml }} />
      </div>
    </div>
  );
}
