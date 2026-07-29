"use client";

import { useEffect, useState } from "react";

const DESKTOP_MQ = "(min-width: 640px)";

/**
 * Acordeón móvil (&lt;640px): cerrado por defecto.
 * En desktop fuerza abierto para que el cuerpo siempre se vea.
 */
export function useLabMobileCollapse(enabled: boolean): {
  open: boolean;
  toggle: () => void;
} {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const mq = window.matchMedia(DESKTOP_MQ);
    const sync = () => {
      if (mq.matches) setOpen(true);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [enabled]);

  return {
    open,
    toggle: () => setOpen((prev) => !prev),
  };
}
