"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

type Props = {
  number: number;
  title: string;
  /** Abierto por defecto (p. ej. el primer paso). API tipo AccordionItem. */
  defaultOpen?: boolean;
  children: ReactNode;
};

/**
 * Paso numerado de tutorial/guía con acordeón accesible.
 * API shadcn-ready: `defaultOpen` como AccordionItem.
 */
export function Step({ number, title, defaultOpen = false, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const buttonId = useId();

  return (
    <section
      className={`lab-step${open ? " is-open" : ""}`}
      aria-labelledby={`lab-step-${number}-title`}
    >
      <h3 className="lab-step__title" id={`lab-step-${number}-title`}>
        <button
          type="button"
          id={buttonId}
          className="lab-step__trigger"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className="lab-step__number" aria-hidden>
            {number}
          </span>
          <span className="lab-step__label">{title}</span>
          <ChevronDown
            className="lab-step__chevron"
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
        className="lab-step__panel"
        hidden={!open}
      >
        <div className="lab-step__body">{children}</div>
      </div>
    </section>
  );
}
