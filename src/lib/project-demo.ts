const NON_EMBEDDABLE_DEMO_HOSTS = ["apps.autodesk.com"] as const;

export function isNonEmbeddableDemoUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return NON_EMBEDDABLE_DEMO_HOSTS.some(
      (host) => hostname === host || hostname.endsWith(`.${host}`)
    );
  } catch {
    return false;
  }
}
