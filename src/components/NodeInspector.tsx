import { useState } from "react";

type Props = {
  codeHtml: string;
  title: string;
  status: string;
};

export function NodeInspector({ codeHtml, title, status }: Props) {
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
          <span className="status-indicator">{status}</span>
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
