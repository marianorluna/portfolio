const NON_EMBEDDABLE_DEMO_HOSTS = ["apps.autodesk.com"] as const;

/** Corrige `&amp;` literales que a veces vienen del JSON/HTML. */
export function normalizeDemoUrl(url: string): string {
  return url.replace(/&amp;/gi, "&").trim();
}

export function isNonEmbeddableDemoUrl(url: string): boolean {
  try {
    const hostname = new URL(normalizeDemoUrl(url)).hostname.toLowerCase();
    return NON_EMBEDDABLE_DEMO_HOSTS.some(
      (host) => hostname === host || hostname.endsWith(`.${host}`)
    );
  } catch {
    return false;
  }
}

/**
 * URL para abrir en pestaña nueva.
 * Los embeds de YouTube (`/embed/...`) fallan como documento top-level (Error 153);
 * se convierten a `watch?v=...`.
 */
export function toExternalDemoUrl(url: string): string {
  const normalized = normalizeDemoUrl(url);
  try {
    const parsed = new URL(normalized);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.replace(/^\//, "").split("/")[0];
      if (id) return `https://www.youtube.com/watch?v=${id}`;
      return normalized;
    }

    if (host === "youtube.com" || host === "youtube-nocookie.com" || host === "m.youtube.com") {
      const embedMatch = parsed.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/);
      if (embedMatch?.[1]) {
        return `https://www.youtube.com/watch?v=${embedMatch[1]}`;
      }
      const v = parsed.searchParams.get("v");
      if (v) return `https://www.youtube.com/watch?v=${v}`;
    }

    return normalized;
  } catch {
    return normalized;
  }
}
