"use client";

import { useId, type KeyboardEvent, type MouseEvent } from "react";
import type { LabCardSize, LabResourceType } from "@/types/lab";
import { labFaceToneForType } from "@/lib/lab/face-tone";
import { useLabCardReveal } from "./LabCardRevealContext";
import { useCoarsePointer } from "./useCoarsePointer";

type Props = {
  title: string;
  typeLabel: string;
  type: LabResourceType;
  tags: string[];
  size: LabCardSize;
  comingSoonLabel: string;
  enterDelayMs?: number;
};

/**
 * Celda decorativa del bento: anverso y reverso con fondo sólido del tema
 * según el tipo (sin CTA ni navegación).
 */
export function LabPlaceholderCard({
  title,
  typeLabel,
  type,
  tags,
  size,
  comingSoonLabel,
  enterDelayMs = 0,
}: Props) {
  const coarse = useCoarsePointer();
  const { revealed, toggle } = useLabCardReveal();
  const detailId = useId();
  const faceTone = labFaceToneForType(type);
  const flipAxis = size === "wide" ? "v" : "h";

  const className = [
    "lab-bento__card",
    "lab-bento__card--flip",
    `lab-bento__card--flip-${flipAxis}`,
    "lab-bento__card--placeholder",
    `lab-bento__card--${size}`,
    `lab-bento__card--type-${type}`,
    `lab-bento__card--face-${faceTone}`,
    revealed ? "is-revealed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const onCardClick = (event: MouseEvent<HTMLElement>) => {
    if (!coarse) return;
    event.preventDefault();
    toggle();
  };

  const onCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!coarse) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle();
    }
  };

  return (
    <article
      className={className}
      style={{ animationDelay: `${enterDelayMs}ms` }}
      aria-label={`${comingSoonLabel}: ${title}`}
      onClick={onCardClick}
      onKeyDown={onCardKeyDown}
      tabIndex={coarse ? 0 : undefined}
      aria-expanded={coarse ? revealed : undefined}
      aria-controls={coarse ? detailId : undefined}
    >
      <div className="lab-bento__flip">
        <div className="lab-bento__face lab-bento__face--front" aria-hidden={revealed || undefined}>
          <div className="lab-bento__front-badges">
            <span className="lab-bento__badge lab-bento__badge--soon">{comingSoonLabel}</span>
            <span className="lab-bento__badge lab-bento__badge--muted">{typeLabel}</span>
          </div>
        </div>

        <div
          id={detailId}
          className="lab-bento__face lab-bento__face--back"
          aria-hidden={coarse && !revealed ? true : undefined}
        >
          <div className="lab-bento__back-body">
            <span className="lab-bento__badge lab-bento__badge--soon">{comingSoonLabel}</span>
            <span className="lab-bento__badge lab-bento__badge--muted">{typeLabel}</span>
            <h2 className="lab-bento__title">{title}</h2>
            {tags.length > 0 && (
              <ul className="lab-bento__tags">
                {tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
