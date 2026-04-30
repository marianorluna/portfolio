// @vitest-environment node

import { describe, expect, it, vi, beforeEach } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/contact/verify-turnstile", () => ({
  verifyTurnstile: vi.fn()
}));

vi.mock("@/lib/contact/send-contact-email", () => ({
  sendContactEmail: vi.fn()
}));

vi.mock("@/lib/contact/rate-limit", () => ({
  checkContactRateLimit: vi.fn()
}));

import { verifyTurnstile } from "@/lib/contact/verify-turnstile";
import { sendContactEmail } from "@/lib/contact/send-contact-email";
import { checkContactRateLimit } from "@/lib/contact/rate-limit";

const mockedVerify = vi.mocked(verifyTurnstile);
const mockedSend = vi.mocked(sendContactEmail);
const mockedRateLimit = vi.mocked(checkContactRateLimit);

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

function makeRawJsonRequest(rawBody: string): Request {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: rawBody
  });
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedRateLimit.mockReturnValue({ allowed: true, retryAfterSeconds: 60 });
    mockedVerify.mockResolvedValue({ success: true });
    mockedSend.mockResolvedValue();
  });

  it("devuelve 429 cuando excede el rate limit", async () => {
    mockedRateLimit.mockReturnValue({ allowed: false, retryAfterSeconds: 12 });
    const res = await POST(makeRequest({}));
    const data = (await res.json()) as { error?: string };
    expect(res.status).toBe(429);
    expect(data.error).toBe("rate_limited");
    expect(res.headers.get("Retry-After")).toBe("12");
  });

  it("devuelve 400 si falta token de turnstile", async () => {
    const res = await POST(
      makeRequest({ name: "Maria", email: "maria@mail.com", message: "Hola mundo largo" })
    );
    expect(res.status).toBe(400);
  });

  it("devuelve 400 cuando el json de entrada es invalido", async () => {
    const res = await POST(makeRawJsonRequest("{invalid-json"));
    const data = (await res.json()) as { error?: string };
    expect(res.status).toBe(400);
    expect(data.error).toBe("invalid_json");
  });

  it("devuelve 200 y no envia email cuando el honeypot viene relleno", async () => {
    const res = await POST(
      makeRequest({
        name: "Maria",
        email: "maria@mail.com",
        message: "Hola mundo largo",
        company: "spam-bot"
      })
    );
    const data = (await res.json()) as { ok?: boolean };
    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(mockedVerify).not.toHaveBeenCalled();
    expect(mockedSend).not.toHaveBeenCalled();
  });

  it("devuelve 503 si falta secret de turnstile", async () => {
    mockedVerify.mockResolvedValue({ success: false, reason: "missing_secret" });
    const res = await POST(
      makeRequest({
        name: "Maria",
        email: "maria@mail.com",
        message: "Hola mundo largo",
        turnstileToken: "token-ok"
      })
    );
    expect(res.status).toBe(503);
  });

  it("devuelve 403 cuando turnstile no verifica el token", async () => {
    mockedVerify.mockResolvedValue({ success: false, reason: "invalid" });
    const res = await POST(
      makeRequest({
        name: "Maria",
        email: "maria@mail.com",
        message: "Hola mundo largo",
        turnstileToken: "token-ok"
      })
    );
    const data = (await res.json()) as { error?: string; code?: string };
    expect(res.status).toBe(403);
    expect(data.error).toBe("turnstile");
    expect(data.code).toBe("verify");
  });

  it("devuelve 400 con fieldErrors cuando falla validacion de payload", async () => {
    const res = await POST(
      makeRequest({
        name: "",
        email: "not-an-email",
        message: "hola",
        turnstileToken: "token-ok"
      })
    );
    const data = (await res.json()) as {
      error?: string;
      fieldErrors?: Partial<Record<"name" | "email" | "message", string>>;
    };
    expect(res.status).toBe(400);
    expect(data.error).toBe("validation");
    expect(data.fieldErrors?.name).toBe("name_required");
    expect(data.fieldErrors?.email).toBe("email_invalid");
    expect(data.fieldErrors?.message).toBe("message_min");
  });

  it("devuelve 504 ante timeout de proveedor de correo", async () => {
    mockedSend.mockRejectedValue(new Error("RESEND_TIMEOUT"));
    const res = await POST(
      makeRequest({
        name: "Maria",
        email: "maria@mail.com",
        message: "Hola mundo largo",
        turnstileToken: "token-ok"
      })
    );
    expect(res.status).toBe(504);
  });

  it("devuelve 503 cuando falta configuracion de proveedor de correo", async () => {
    mockedSend.mockRejectedValue(new Error("MISSING_RESEND_KEY"));
    const res = await POST(
      makeRequest({
        name: "Maria",
        email: "maria@mail.com",
        message: "Hola mundo largo",
        turnstileToken: "token-ok"
      })
    );
    const data = (await res.json()) as { error?: string };
    expect(res.status).toBe(503);
    expect(data.error).toBe("config");
  });

  it("devuelve 500 ante error inesperado del proveedor de correo", async () => {
    mockedSend.mockRejectedValue(new Error("UNEXPECTED_PROVIDER_ERROR"));
    const res = await POST(
      makeRequest({
        name: "Maria",
        email: "maria@mail.com",
        message: "Hola mundo largo",
        turnstileToken: "token-ok"
      })
    );
    const data = (await res.json()) as { error?: string };
    expect(res.status).toBe(500);
    expect(data.error).toBe("server");
  });

  it("devuelve 500 cuando el proveedor lanza un error no-Error", async () => {
    mockedSend.mockRejectedValue("NON_ERROR_THROW");
    const res = await POST(
      makeRequest({
        name: "Maria",
        email: "maria@mail.com",
        message: "Hola mundo largo",
        turnstileToken: "token-ok"
      })
    );
    const data = (await res.json()) as { error?: string };
    expect(res.status).toBe(500);
    expect(data.error).toBe("server");
  });

  it("devuelve 200 en envio valido", async () => {
    const res = await POST(
      makeRequest({
        name: "Maria",
        email: "maria@mail.com",
        message: "Hola mundo largo",
        turnstileToken: "token-ok"
      })
    );
    const data = (await res.json()) as { ok?: boolean };
    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(mockedSend).toHaveBeenCalledTimes(1);
  });
});
