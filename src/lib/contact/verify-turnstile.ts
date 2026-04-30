/**
 * Verificación con Cloudflare: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */
export function getRequestClientIp(request: Request): string | undefined {
  const xff = request.headers.get("x-forwarded-for");
  if (xff != null && xff.length > 0) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get("x-real-ip");
  if (real != null && real.length > 0) return real.trim();
  return undefined;
}

export type TurnstileVerifyResult =
  | { success: true }
  | { success: false; reason: "missing_secret" | "http" | "invalid" | "error_codes" };

const TURNSTILE_TIMEOUT_MS = 8000;

/**
 * Comprueba el token devuelto por el widget Turnstile (servidor, usa `TURNSTILE_SECRET_KEY`).
 */
export async function verifyTurnstile(
  responseToken: string,
  request: Request
): Promise<TurnstileVerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (secret == null || secret.length === 0) {
    return { success: false, reason: "missing_secret" };
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", responseToken);
  const ip = getRequestClientIp(request);
  if (ip != null) {
    body.set("remoteip", ip);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, TURNSTILE_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      signal: controller.signal
    });
  } catch {
    clearTimeout(timeoutId);
    return { success: false, reason: "http" };
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    return { success: false, reason: "http" };
  }

  const data = (await res.json()) as {
    success: boolean;
    "error-codes"?: string[];
  };

  if (data.success === true) {
    return { success: true };
  }

  if (data["error-codes"] != null && data["error-codes"].length > 0) {
    return { success: false, reason: "error_codes" };
  }

  return { success: false, reason: "invalid" };
}
