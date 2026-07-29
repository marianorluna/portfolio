"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, type KeyboardEvent, type MouseEvent } from "react";
import type { LabCardSize, LabResourceType } from "@/types/lab";
import { labFaceToneForType } from "@/lib/lab/face-tone";
import { useLabCardReveal } from "./LabCardRevealContext";
import { useCoarsePointer } from "./useCoarsePointer";

type Props = {
  href: string;
  title: string;
  description: string;
  typeLabel: string;
  type: LabResourceType;
  tags: string[];
  /** Cover ~1:1 (`*-grid.webp`) para celdas cercanas a cuadrado. */
  coverImage: string;
  coverAlt: string;
  /**
   * Cover ancha (`*-portada.webp`). Si existe, el CSS del slot la muestra
   * cuando el aspect ratio de la celda es ≥ 4/3 (span 2 / fill ancho).
   */
  wideCoverImage?: string;
  size?: LabCardSize;
  openCtaLabel: string;
  /** Fecha visible (mes + año) y su etiqueta (Publicado / Actualizado). */
  dateLabel?: string;
  dateText?: string;
  dateTime?: string;
  /** Duración estimada ya formateada (p. ej. "~20 min"). */
  durationText?: string;
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
  wideCoverImage,
  size = "md",
  openCtaLabel,
  dateLabel,
  dateText,
  dateTime,
  durationText,
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
    `lab-bento__card--${size}`,
    `lab-bento__card--type-${type}`,
    `lab-bento__card--face-${faceTone}`,
    revealed ? "is-revealed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const onCardClick = (event: MouseEvent<HTMLElement>) => {
    if (!coarse) return;
    if ((event.target as HTMLElement).closest("a")) return;
    // Tap: revelar / ocultar. El CTA navega sin disparar el toggle.
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
      onClick={onCardClick}
      onKeyDown={onCardKeyDown}
      tabIndex={coarse ? 0 : undefined}
      aria-expanded={coarse ? revealed : undefined}
      aria-controls={coarse ? detailId : undefined}
    >
      <div className="lab-bento__flip">
        <div className="lab-bento__face lab-bento__face--front" aria-hidden={revealed || undefined}>
          <div className="lab-bento__media">
            <div
              className={[
                "lab-bento__media-frame",
                wideCoverImage != null ? "lab-bento__media-frame--adaptive" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <Image
                src={coverImage}
                alt={coverAlt}
                fill
                sizes="(max-width: 560px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className={[
                  "lab-bento__image",
                  wideCoverImage != null ? "lab-bento__image--square" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                priority={enterDelayMs < 100}
                draggable={false}
              />
              {wideCoverImage != null && (
                <Image
                  src={wideCoverImage}
                  alt=""
                  fill
                  sizes="(max-width: 560px) 100vw, (max-width: 1024px) 100vw, 50vw"
                  className="lab-bento__image lab-bento__image--wide"
                  aria-hidden
                  draggable={false}
                />
              )}
            </div>
          </div>
        </div>

        <div
          id={detailId}
          className="lab-bento__face lab-bento__face--back"
          aria-hidden={coarse && !revealed ? true : undefined}
        >
          <div className="lab-bento__back-body">
            <div className="lab-bento__meta">
              <span className="lab-bento__badge">{typeLabel}</span>
              {durationText != null && durationText.length > 0 && (
                <span className="lab-bento__duration">{durationText}</span>
              )}
              {dateText != null && (
                <time className="lab-bento__date" dateTime={dateTime}>
                  {dateLabel != null ? `${dateLabel} ${dateText}` : dateText}
                </time>
              )}
            </div>
            <h2 className="lab-bento__title">{title}</h2>
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
      </div>

      {!coarse && (
        <Link href={href} className="lab-bento__hitarea" aria-label={title}>
          <span className="visually-hidden">{title}</span>
        </Link>
      )}
    </article>
  );
}
