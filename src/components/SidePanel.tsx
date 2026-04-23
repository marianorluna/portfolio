import type { Hotspot, TagItem } from "@/types/portfolio";

const GH_ICON = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
  </svg>
);

const EXT_ICON = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

function normalizeTag(tag: string | TagItem): TagItem {
  return typeof tag === "string" ? { t: tag, c: "" } : { t: tag.t, c: tag.c ?? "" };
}

type Props = {
  hotspot: Hotspot | null;
  isOpen: boolean;
  onClose: () => void;
};

export function SidePanel({ hotspot, isOpen, onClose }: Props) {
  return (
    <div className={`side-panel${isOpen ? " open" : ""}`} id="sidePanel">
      <div className="panel-header">
        <div>
          <div
            className="panel-type"
            style={{ color: hotspot?.color ?? "var(--blue)" }}
          >
            {hotspot?.panel.type ?? "// project"}
          </div>
          <div className="panel-title">{hotspot?.panel.title ?? ""}</div>
        </div>
        <button className="panel-close" onClick={onClose} type="button">
          ✕
        </button>
      </div>

      <div className="panel-body">
        {hotspot?.panel.sections.map((section, si) => (
          <div className="panel-section" key={si}>
            <div className="ps-label" style={{ color: hotspot.color }}>
              {section.label}
            </div>

            {section.desc && <div className="ps-desc">{section.desc}</div>}

            {section.metrics && (
              <div className="metric-row">
                {section.metrics.map((m, mi) => (
                  <div className="metric" key={mi}>
                    <div className="metric-val" style={{ color: hotspot.color }}>
                      {m.v}
                    </div>
                    <div className="metric-label">{m.l}</div>
                  </div>
                ))}
              </div>
            )}

            {section.tags && (
              <div className="tag-list">
                {section.tags.map((tag, ti) => {
                  const parsed = normalizeTag(tag);
                  return (
                    <span key={ti} className={`tag${parsed.c ? ` ${parsed.c}` : ""}`}>
                      {parsed.t}
                    </span>
                  );
                })}
              </div>
            )}

            {section.codeHtml && (
              <div
                className="code-snippet"
                dangerouslySetInnerHTML={{ __html: section.codeHtml }}
              />
            )}

            {section.links &&
              section.links.map((link, li) => (
                <a
                  key={li}
                  className="github-link"
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {link.icon === "gh" ? GH_ICON : EXT_ICON}
                  {link.text}
                </a>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
