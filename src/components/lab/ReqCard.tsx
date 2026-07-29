"use client";

import { useId, type ReactNode } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { useLabMobileCollapse } from "./useLabMobileCollapse";

type Props = {
  /** Nombre de icono Lucide pasado desde MDX vía mapa en el componente. */
  icon?: LucideIcon;
  title: string;
  /**
   * En viewport &lt; 640px actúa como acordeón (cerrado por defecto).
   * En desktop el cuerpo siempre es visible. Desactivar para IntroCard.
   */
  collapsible?: boolean;
  children: ReactNode;
};

/**
 * Card de requisito previo (API tipo shadcn Card).
 * En móvil, colapsable para no alargar la sección de requisitos.
 */
export function ReqCardView({
  icon: Icon,
  title,
  collapsible = true,
  children,
}: Props) {
  const { open, toggle } = useLabMobileCollapse(collapsible);
  const panelId = useId();
  const buttonId = useId();
  const titleId = useId();

  if (!collapsible) {
    return (
      <article className="lab-req-card">
        <header className="lab-req-card__header">
          {Icon != null && (
            <span className="lab-req-card__icon" aria-hidden>
              <Icon size={20} strokeWidth={1.8} />
            </span>
          )}
          <h3 className="lab-req-card__title">{title}</h3>
        </header>
        <div className="lab-req-card__body">{children}</div>
      </article>
    );
  }

  return (
    <article
      className={`lab-req-card lab-kit-card--collapsible${open ? " is-open" : ""}`}
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
            <span className="lab-req-card__icon" aria-hidden>
              <Icon size={20} strokeWidth={1.8} />
            </span>
          )}
          <span className="lab-req-card__title">{title}</span>
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
        <div className="lab-req-card__body">{children}</div>
      </div>
    </article>
  );
}
