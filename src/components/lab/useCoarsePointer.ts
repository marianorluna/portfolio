"use client";

import { useEffect, useState } from "react";

/** `true` cuando el dispositivo es coarse (touch) o no tiene hover fino. */
export function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    const hoverMq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setCoarse(!hoverMq.matches);
    sync();
    hoverMq.addEventListener("change", sync);
    return () => hoverMq.removeEventListener("change", sync);
  }, []);

  return coarse;
}
