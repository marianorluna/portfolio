type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const WINDOW_MS = 60_000;
const DEFAULT_MAX_REQUESTS_PER_WINDOW = 5;

const store = new Map<string, RateLimitEntry>();

function cleanup(now: number): void {
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}

function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export type RateLimitDecision = {
  allowed: boolean;
  retryAfterSeconds: number;
};

function getMaxRequestsPerWindow(): number {
  const raw = process.env.CONTACT_RATE_LIMIT_MAX_PER_MINUTE;
  if (raw == null || raw.trim().length === 0) return DEFAULT_MAX_REQUESTS_PER_WINDOW;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_MAX_REQUESTS_PER_WINDOW;
  return parsed;
}

export function checkContactRateLimit(request: Request): RateLimitDecision {
  const maxRequestsPerWindow = getMaxRequestsPerWindow();
  const now = Date.now();
  cleanup(now);
  const ip = getClientIp(request);
  const current = store.get(ip);

  if (current == null || current.resetAt <= now) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSeconds: Math.ceil(WINDOW_MS / 1000) };
  }

  if (current.count >= maxRequestsPerWindow) {
    const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    return { allowed: false, retryAfterSeconds };
  }

  current.count += 1;
  store.set(ip, current);
  return {
    allowed: true,
    retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000))
  };
}
