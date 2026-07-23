"use client";

import { useEffect } from "react";

function isImageTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLImageElement;
}

/**
 * Event Delegation: bloquea menú contextual y drag nativo solo en `<img>`,
 * sin desactivar el clic derecho del resto del documento.
 */
export function ImageInteractionGuard() {
  useEffect(() => {
    const onContextMenu = (event: MouseEvent) => {
      if (isImageTarget(event.target)) {
        event.preventDefault();
      }
    };

    const onDragStart = (event: DragEvent) => {
      if (isImageTarget(event.target)) {
        event.preventDefault();
      }
    };

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("dragstart", onDragStart);
    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("dragstart", onDragStart);
    };
  }, []);

  return null;
}
