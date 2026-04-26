import { useState } from "react";

type Props = {
  codeHtml: string;
  title: string;
  status: string;
  /** true cuando hay hover sobre el modelo 3D o un proyecto fijado en el inspector. */
  liveSync: boolean;
};

export function NodeInspector({ codeHtml, title, status, liveSync }: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`data-panel ${isCollapsed ? "is-collapsed" : ""}`}>
      <button
        type="button"
        className="panel-header panel-header-toggle"
        onClick={() => setIsCollapsed((prev) => !prev)}
        aria-expanded={!isCollapsed}
        aria-label={`${isCollapsed ? "Expandir" : "Contraer"} ${title}`}
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
        <div
          className="code-block"
          dangerouslySetInnerHTML={{ __html: codeHtml }}
        />
      </div>
    </div>
  );
}
