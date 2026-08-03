"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

type Props = {
  scrollToTopLabel: string;
};

const SCROLL_THRESHOLD_PX = 320;

function getScrollRoot(): HTMLElement | null {
  return document.querySelector<HTMLElement>(".lab-page");
}

/**
 * Chrome de lectura para notas: barra de progreso superior + botón subir,
 * anclado al contenedor `.lab-page` (scroll propio, no window).
 */
export function LabReadingChrome({ scrollToTopLabel }: Props) {
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const root = getScrollRoot();
    if (root == null) return;

    const update = () => {
      const max = root.scrollHeight - root.clientHeight;
      const ratio = max > 0 ? root.scrollTop / max : 0;
      setProgress(Math.min(1, Math.max(0, ratio)));
      setShowTop(root.scrollTop >= SCROLL_THRESHOLD_PX);
    };

    update();
    root.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      root.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scrollToTop = () => {
    const root = getScrollRoot();
    if (root == null) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <>
      <div
        className="lab-reading-progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        aria-hidden={progress <= 0}
      >
        <div
          className="lab-reading-progress__bar"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
      <button
        type="button"
        className={`lab-scroll-top${showTop ? " is-visible" : ""}`}
        onClick={scrollToTop}
        aria-label={scrollToTopLabel}
        tabIndex={showTop ? 0 : -1}
      >
        <ArrowUp size={20} strokeWidth={2.25} aria-hidden />
      </button>
    </>
  );
}
