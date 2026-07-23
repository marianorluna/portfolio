/**
 * Next.js DevTools (dev-tools-indicator/draggable.tsx) calls
 * releasePointerCapture on a pointer that the browser may already have
 * released (pointerup/cancel race). That throws NotFoundError in next dev.
 * Guard the API so the overlay cannot crash the page.
 */
if (process.env.NODE_ENV === "development") {
  const original = Element.prototype.releasePointerCapture;

  Element.prototype.releasePointerCapture = function releasePointerCaptureSafe(
    pointerId: number
  ): void {
    if (!this.hasPointerCapture(pointerId)) {
      return;
    }

    try {
      original.call(this, pointerId);
    } catch (error) {
      if (error instanceof DOMException && error.name === "NotFoundError") {
        return;
      }
      throw error;
    }
  };
}
