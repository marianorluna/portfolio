"use client";

import { useId, type KeyboardEvent, type MouseEvent } from "react";
import type { LabCardSize, LabPlaceholderTone, LabResourceType } from "@/types/lab";
import { useLabCardReveal } from "./LabCardRevealContext";
import { useCoarsePointer } from "./useCoarsePointer";

type Props = {
  title: string;
  typeLabel: string;
  type: LabResourceType;
  tags: string[];
  size: LabCardSize;
  tone: LabPlaceholderTone;
  comingSoonLabel: string;
  enterDelayMs?: number;
};

/**
 * Celda decorativa del bento: fondo de color + velo gris, hover/tap revela
 * título + tags (sin CTA ni navegación).
 */
export function LabPlaceholderCard({
  title,
  typeLabel,
  type,
  tags,
  size,
  tone,
  comingSoonLabel,
  enterDelayMs = 0,
}: Props) {
  const coarse = useCoarsePointer();
  const { revealed, toggle } = useLabCardReveal();
  const detailId = useId();

  const className = [
    "lab-bento__card",
    "lab-bento__card--placeholder",
    `lab-bento__card--${size}`,
    `lab-bento__card--type-${type}`,
    `lab-bento__card--tone-${tone}`,
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
      <div className="lab-bento__media lab-bento__media--placeholder" aria-hidden>
        <div className="lab-bento__placeholder-pattern" />
        <div className="lab-bento__shade lab-bento__shade--placeholder" />
      </div>
      <div className="lab-bento__body">
        <span className="lab-bento__badge lab-bento__badge--soon">{comingSoonLabel}</span>
        <span className="lab-bento__badge lab-bento__badge--muted">{typeLabel}</span>
        <div id={detailId} className="lab-bento__detail">
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
    </article>
  );
}
