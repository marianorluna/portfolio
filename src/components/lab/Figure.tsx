"use client";

import { useEffect, useId, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { X, ZoomIn } from "lucide-react";
import { resolveLocaleFromPathname } from "@/i18n/locale";
import type { Locale } from "@/types/portfolio";

type Props = {
  /** Ruta pública, p. ej. `/lab/screenshots/{slug}/01-….webp`. */
  src: string;
  alt: string;
  /** Pie opcional bajo la captura. */
  caption?: string;
};

const FIGURE_UI: Record<
  Locale,
  { expandLabel: string; closeLabel: string; dialogLabel: string }
> = {
  es: {
    expandLabel: "Ampliar imagen",
    closeLabel: "Cerrar imagen",
    dialogLabel: "Vista ampliada",
  },
  en: {
    expandLabel: "Expand image",
    closeLabel: "Close image",
    dialogLabel: "Expanded view",
  },
};

const emptySubscribe = () => () => undefined;

function useIsClient(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

/**
 * Captura de pantalla en pasos del Lab.
 * Si el asset aún no existe, muestra un hueco con la ruta esperada.
 * Clic o botón de zoom abren lightbox a pantalla completa.
 */
export function Figure({ src, alt, caption }: Props) {
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const locale = resolveLocaleFromPathname(pathname ?? "/");
  const ui = FIGURE_UI[locale];
  const fileName = src.split("/").pop() ?? src;

  return (
    <figure className="lab-figure">
      {failed ? (
        <div className="lab-figure__pending" role="img" aria-label={alt}>
          <code className="lab-figure__pending-path">{fileName}</code>
        </div>
      ) : (
        <button
          type="button"
          className="lab-figure__trigger"
          onClick={() => setOpen(true)}
          aria-label={`${ui.expandLabel}: ${alt}`}
        >
          <img
            src={src}
            alt=""
            className="lab-figure__img"
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
          />
          <span className="lab-figure__zoom" aria-hidden="true">
            <ZoomIn size={16} strokeWidth={2.25} />
          </span>
        </button>
      )}
      {caption != null && caption.length > 0 && (
        <figcaption className="lab-figure__caption">{caption}</figcaption>
      )}
      {open && !failed && (
        <FigureLightbox
          src={src}
          alt={alt}
          caption={caption}
          closeLabel={ui.closeLabel}
          dialogLabel={ui.dialogLabel}
          onClose={() => setOpen(false)}
        />
      )}
    </figure>
  );
}

type LightboxProps = {
  src: string;
  alt: string;
  caption?: string;
  closeLabel: string;
  dialogLabel: string;
  onClose: () => void;
};

function FigureLightbox({
  src,
  alt,
  caption,
  closeLabel,
  dialogLabel,
  onClose,
}: LightboxProps) {
  const mounted = useIsClient();
  const titleId = useId();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className="lab-figure-lightbox" role="presentation">
      <button
        type="button"
        className="lab-figure-lightbox__backdrop"
        aria-label={closeLabel}
        onClick={onClose}
      />
      <div
        className="lab-figure-lightbox__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="lab-figure-lightbox__toolbar">
          <p id={titleId} className="lab-figure-lightbox__title">
            {caption != null && caption.length > 0 ? caption : dialogLabel}
          </p>
          <button
            type="button"
            className="lab-figure-lightbox__close"
            aria-label={closeLabel}
            onClick={onClose}
            autoFocus
          >
            <X size={18} strokeWidth={2.25} aria-hidden="true" />
          </button>
        </div>
        <div className="lab-figure-lightbox__stage">
          <img
            src={src}
            alt={alt}
            className="lab-figure-lightbox__img"
            decoding="async"
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
