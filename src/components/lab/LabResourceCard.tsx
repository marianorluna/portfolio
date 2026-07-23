"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, type KeyboardEvent, type MouseEvent } from "react";
import type { LabCardSize, LabResourceType } from "@/types/lab";
import { useLabCardReveal } from "./LabCardRevealContext";
import { useCoarsePointer } from "./useCoarsePointer";

type Props = {
  href: string;
  title: string;
  description: string;
  typeLabel: string;
  type: LabResourceType;
  tags: string[];
  coverImage: string;
  coverAlt: string;
  size?: LabCardSize;
  openCtaLabel: string;
  /** Fecha visible (mes + año) y su etiqueta (Publicado / Actualizado). */
  dateLabel?: string;
  dateText?: string;
  dateTime?: string;
  /** Retraso de entrada staggered (ms). */
  enterDelayMs?: number;
};

export function LabResourceCard({
  href,
  title,
  description,
  typeLabel,
  type,
  tags,
  coverImage,
  coverAlt,
  size = "md",
  openCtaLabel,
  dateLabel,
  dateText,
  dateTime,
  enterDelayMs = 0,
}: Props) {
  const coarse = useCoarsePointer();
  const { revealed, reveal } = useLabCardReveal();
  const detailId = useId();

  const className = [
    "lab-bento__card",
    `lab-bento__card--${size}`,
    `lab-bento__card--type-${type}`,
    revealed ? "is-revealed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const onCardClick = (event: MouseEvent<HTMLElement>) => {
    if (!coarse || revealed) return;
    if ((event.target as HTMLElement).closest("a")) return;
    // Primer tap: revelar; el CTA navega en el segundo gesto.
    event.preventDefault();
    reveal();
  };

  const onCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!coarse || revealed) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      reveal();
    }
  };

  return (
    <article
      className={className}
      style={{ animationDelay: `${enterDelayMs}ms` }}
      onClick={onCardClick}
      onKeyDown={onCardKeyDown}
      tabIndex={coarse && !revealed ? 0 : undefined}
      aria-expanded={coarse ? revealed : undefined}
      aria-controls={coarse ? detailId : undefined}
    >
      <div className="lab-bento__media">
        <div className="lab-bento__media-frame">
          <Image
            src={coverImage}
            alt={coverAlt}
            fill
            sizes="(max-width: 560px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="lab-bento__image"
            priority={enterDelayMs < 100}
            draggable={false}
          />
        </div>
        <div className="lab-bento__shade" aria-hidden />
      </div>

      <div className="lab-bento__body">
        <div className="lab-bento__meta">
          <span className="lab-bento__badge">{typeLabel}</span>
          {dateText != null && (
            <time className="lab-bento__date" dateTime={dateTime}>
              {dateLabel != null ? `${dateLabel} ${dateText}` : dateText}
            </time>
          )}
        </div>
        <h2 className="lab-bento__title">{title}</h2>
        <div id={detailId} className="lab-bento__detail">
          <p className="lab-bento__description">{description}</p>
          {tags.length > 0 && (
            <ul className="lab-bento__tags">
              {tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          )}
          {coarse && (
            <Link href={href} className="lab-bento__cta">
              {openCtaLabel}
            </Link>
          )}
        </div>
      </div>

      {!coarse && (
        <Link href={href} className="lab-bento__hitarea" aria-label={title}>
          <span className="visually-hidden">{title}</span>
        </Link>
      )}
    </article>
  );
}
