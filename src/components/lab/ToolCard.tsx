"use client";

import { useId, type ReactNode } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { useLabMobileCollapse } from "./useLabMobileCollapse";

type Props = {
  icon?: LucideIcon;
  title: string;
  /** Nombres de tools MCP / APIs asociadas. */
  tools?: string[];
  /** En móvil, acordeón cerrado por defecto (≥640px siempre abierto). */
  collapsible?: boolean;
  children: ReactNode;
};

/** Card de caso de uso / tool (API tipo shadcn Card). */
export function ToolCardView({
  icon: Icon,
  title,
  tools = [],
  collapsible = true,
  children,
}: Props) {
  const { open, toggle } = useLabMobileCollapse(collapsible);
  const panelId = useId();
  const buttonId = useId();
  const titleId = useId();

  const toolsList =
    tools.length > 0 ? (
      <ul className="lab-tool-card__tools">
        {tools.map((tool) => (
          <li key={tool}>
            <code>{tool}</code>
          </li>
        ))}
      </ul>
    ) : null;

  if (!collapsible) {
    return (
      <article className="lab-tool-card">
        <header className="lab-tool-card__header">
          {Icon != null && (
            <span className="lab-tool-card__icon" aria-hidden>
              <Icon size={20} strokeWidth={1.8} />
            </span>
          )}
          <h3 className="lab-tool-card__title">{title}</h3>
        </header>
        <div className="lab-tool-card__body">{children}</div>
        {toolsList}
      </article>
    );
  }

  return (
    <article
      className={`lab-tool-card lab-kit-card--collapsible${open ? " is-open" : ""}`}
      aria-labelledby={titleId}
    >
      <h3 className="lab-kit-card__title-wrap" id={titleId}>
        <button
          type="button"
          id={buttonId}
          className="lab-kit-card__trigger"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={toggle}
        >
          {Icon != null && (
            <span className="lab-tool-card__icon" aria-hidden>
              <Icon size={20} strokeWidth={1.8} />
            </span>
          )}
          <span className="lab-tool-card__title">{title}</span>
          <ChevronDown
            className="lab-kit-card__chevron"
            size={18}
            strokeWidth={2}
            aria-hidden
          />
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className="lab-kit-card__panel"
        hidden={!open}
      >
        <div className="lab-tool-card__body">{children}</div>
        {toolsList}
      </div>
    </article>
  );
}
