import {
  contactRequestSchema,
  mapZodToFieldErrors,
  type ContactFieldErrorCode
} from "./schema";
import type {
  CaptchaVerifierPort,
  ContactRateLimiterPort,
  MailSenderPort
} from "./ports";

type Body = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  company?: unknown;
  turnstileToken?: unknown;
};

type ContactServiceDeps = {
  captchaVerifier: CaptchaVerifierPort;
  mailSender: MailSenderPort;
  rateLimiter: ContactRateLimiterPort;
};

type ContactApiResponseBody = {
  ok: boolean;
  error?: "invalid_json" | "turnstile" | "config" | "validation" | "server" | "rate_limited";
  code?: "required" | "verify";
  fieldErrors?: Partial<Record<"name" | "email" | "message", ContactFieldErrorCode>>;
};

export type ContactServiceResult = {
  status: number;
  body: ContactApiResponseBody;
  headers?: Record<string, string>;
};

function noStoreHeaders(extra?: Record<string, string>): Record<string, string> {
  return { "Cache-Control": "no-store", ...(extra ?? {}) };
}

export async function processContactRequest(
  request: Request,
  deps: ContactServiceDeps
): Promise<ContactServiceResult> {
  const rateLimit = deps.rateLimiter.check(request);
  if (!rateLimit.allowed) {
    return {
      status: 429,
      body: { ok: false, error: "rate_limited" },
      headers: noStoreHeaders({ "Retry-After": String(rateLimit.retryAfterSeconds) })
    };
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return { status: 400, body: { ok: false, error: "invalid_json" }, headers: noStoreHeaders() };
  }

  if (typeof body.company === "string" && body.company.trim().length > 0) {
    return { status: 200, body: { ok: true }, headers: noStoreHeaders() };
  }

  const turnstileToken =
    typeof body.turnstileToken === "string" ? body.turnstileToken.trim() : "";
  if (turnstileToken.length < 1) {
    return {
      status: 400,
      body: { ok: false, error: "turnstile", code: "required" },
      headers: noStoreHeaders()
    };
  }

  const check = await deps.captchaVerifier.verify(turnstileToken, request);
  if (!check.success) {
    if (check.reason === "missing_secret") {
      return { status: 503, body: { ok: false, error: "config" }, headers: noStoreHeaders() };
    }
    return {
      status: 403,
      body: { ok: false, error: "turnstile", code: "verify" },
      headers: noStoreHeaders()
    };
  }

  const parsed = contactRequestSchema.safeParse({
    name: body.name,
    email: body.email,
    message: body.message
  });

  if (!parsed.success) {
    return {
      status: 400,
      body: {
        ok: false,
        error: "validation",
        fieldErrors: mapZodToFieldErrors(parsed.error)
      },
      headers: noStoreHeaders()
    };
  }

  try {
    await deps.mailSender.send(parsed.data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "MISSING_RESEND_KEY" || msg === "MISSING_CONTACT_TO") {
      return { status: 503, body: { ok: false, error: "config" }, headers: noStoreHeaders() };
    }
    if (msg === "RESEND_TIMEOUT") {
      return { status: 504, body: { ok: false, error: "server" }, headers: noStoreHeaders() };
    }
    return { status: 500, body: { ok: false, error: "server" }, headers: noStoreHeaders() };
  }

  return { status: 200, body: { ok: true }, headers: noStoreHeaders() };
}
