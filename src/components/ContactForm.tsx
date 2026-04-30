"use client";

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useCallback, useRef, useState } from "react";
import type { ZodError } from "zod";
import {
  contactRequestSchema,
  mapZodToFieldErrors
} from "@/lib/contact/schema";
import type { ContactFieldErrorCode } from "@/lib/contact/schema";
import type { ContactFormCopy } from "@/types/portfolio";

type FieldKey = "name" | "email" | "message";

type FieldErrors = Partial<Record<FieldKey, string>>;

type Props = {
  copy: ContactFormCopy;
};

function codeToMessage(code: ContactFieldErrorCode, c: ContactFormCopy): string {
  const messageByCode: Record<ContactFieldErrorCode, string> = {
    name_required: c.nameRequired,
    name_max: c.nameMax,
    email_invalid: c.emailInvalid,
    message_min: c.messageMin,
    message_max: c.messageMax,
  };
  return messageByCode[code];
}

function zodToMessages(err: ZodError, c: ContactFormCopy): FieldErrors {
  const mapped = mapZodToFieldErrors(err);
  const out: FieldErrors = {};
  for (const key of ["name", "email", "message"] as const) {
    const code = mapped[key];
    if (code) out[key] = codeToMessage(code, c);
  }
  return out;
}

type ApiFieldErrors = Partial<Record<FieldKey, ContactFieldErrorCode>>;

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export function ContactForm({ copy }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  /** Código devuelto por Turnstile en el cliente (p. ej. «110200» = dominio no autorizado). */
  const [turnstileClientError, setTurnstileClientError] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle"
  );
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const onTurnstileSuccess = useCallback((token: string) => {
    setTurnstileToken(token);
    setTurnstileClientError(null);
    setServerMessage(null);
    setStatus(s => (s === "error" ? "idle" : s));
  }, []);

  const onTurnstileError = useCallback((code: string) => {
    setTurnstileToken(null);
    setTurnstileClientError(code);
  }, []);

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setFieldErrors({});
      setServerMessage(null);

      const parsed = contactRequestSchema.safeParse({ name, email, message });
      if (!parsed.success) {
        setFieldErrors(zodToMessages(parsed.error, copy));
        return;
      }

      if (turnstileSiteKey.length < 1) {
        setServerMessage(copy.errorConfig);
        setStatus("error");
        return;
      }

      if (turnstileToken == null || turnstileToken.length < 1) {
        setServerMessage(copy.errorTurnstileRequired);
        setStatus("error");
        return;
      }

      setStatus("sending");
      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: parsed.data.name,
            email: parsed.data.email,
            message: parsed.data.message,
            company,
            turnstileToken
          })
        });

        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          error?: string;
          code?: string;
          fieldErrors?: ApiFieldErrors;
        };

        if (res.status === 200 && data.ok) {
          setName("");
          setEmail("");
          setMessage("");
          setCompany("");
          setTurnstileToken(null);
          setFieldErrors({});
          turnstileRef.current?.reset();
          setStatus("success");
          return;
        }

        if (res.status === 400 && data.error === "validation" && data.fieldErrors) {
          const fe: FieldErrors = {};
          for (const k of ["name", "email", "message"] as const) {
            const code = data.fieldErrors[k];
            if (code) fe[k] = codeToMessage(code, copy);
          }
          setFieldErrors(fe);
          setStatus("idle");
          return;
        }

        if (res.status === 400 && data.error === "turnstile" && data.code === "required") {
          setServerMessage(copy.errorTurnstileRequired);
          setStatus("error");
          turnstileRef.current?.reset();
          return;
        }

        if (res.status === 403 && data.error === "turnstile") {
          setServerMessage(copy.errorTurnstile);
          setStatus("error");
          setTurnstileToken(null);
          turnstileRef.current?.reset();
          return;
        }

        if (res.status === 503 && data.error === "config") {
          setServerMessage(copy.errorConfig);
          setStatus("error");
          return;
        }

        setServerMessage(copy.errorGeneric);
        setStatus("error");
      } catch {
        setServerMessage(copy.errorGeneric);
        setStatus("error");
      }
    },
    [name, email, message, company, copy, turnstileToken]
  );

  const isSending = status === "sending";
  const isSuccess = status === "success";

  return (
    <form
      className="nav-contact"
      onSubmit={onSubmit}
      noValidate
      aria-label={copy.formAriaLabel}
    >
      <div className="nav-contact__field">
        <label className="nav-contact__label" htmlFor="contact-name">
          {copy.nameLabel}
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          className="nav-contact__input"
          value={name}
          onChange={e => {
            setName(e.target.value);
            if (fieldErrors.name) {
              setFieldErrors(fe => {
                const next = { ...fe };
                delete next.name;
                return next;
              });
            }
          }}
          autoComplete="name"
          maxLength={120}
          disabled={isSending}
          aria-invalid={fieldErrors.name != null}
          aria-describedby={fieldErrors.name ? "contact-name-err" : undefined}
        />
        {fieldErrors.name && (
          <p className="nav-contact__error" id="contact-name-err" role="alert">
            {fieldErrors.name}
          </p>
        )}
      </div>

      <div className="nav-contact__field">
        <label className="nav-contact__label" htmlFor="contact-email">
          {copy.emailLabel}
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          className="nav-contact__input"
          value={email}
          onChange={e => {
            setEmail(e.target.value);
            if (fieldErrors.email) {
              setFieldErrors(fe => {
                const next = { ...fe };
                delete next.email;
                return next;
              });
            }
          }}
          autoComplete="email"
          maxLength={320}
          disabled={isSending}
          aria-invalid={fieldErrors.email != null}
          aria-describedby={fieldErrors.email ? "contact-email-err" : undefined}
        />
        {fieldErrors.email && (
          <p className="nav-contact__error" id="contact-email-err" role="alert">
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div className="nav-contact__field">
        <label className="nav-contact__label" htmlFor="contact-message">
          {copy.messageLabel}
        </label>
        <textarea
          id="contact-message"
          name="message"
          className="nav-contact__textarea"
          value={message}
          onChange={e => {
            setMessage(e.target.value);
            if (fieldErrors.message) {
              setFieldErrors(fe => {
                const next = { ...fe };
                delete next.message;
                return next;
              });
            }
          }}
          rows={5}
          maxLength={4000}
          disabled={isSending}
          aria-invalid={fieldErrors.message != null}
          aria-describedby={fieldErrors.message ? "contact-message-err" : undefined}
        />
        {fieldErrors.message && (
          <p className="nav-contact__error" id="contact-message-err" role="alert">
            {fieldErrors.message}
          </p>
        )}
      </div>

      {turnstileSiteKey.length > 0 ? (
        <div
          className={`nav-contact__turnstile${isSending ? " nav-contact__turnstile--disabled" : ""}`}
          aria-busy={isSending}
        >
          <Turnstile
            ref={turnstileRef}
            siteKey={turnstileSiteKey}
            onSuccess={onTurnstileSuccess}
            onExpire={() => {
              setTurnstileToken(null);
            }}
            onError={onTurnstileError}
            options={{ language: "es", theme: "auto", size: "flexible" }}
          />
          {turnstileClientError != null && turnstileClientError.length > 0 && (
            <p className="nav-contact__error nav-contact__error--turnstile" id="contact-turnstile-err" role="alert">
              {turnstileClientError === "110200"
                ? copy.errorTurnstileDomain
                : copy.errorTurnstile}
            </p>
          )}
        </div>
      ) : (
        <p className="nav-contact__feedback nav-contact__feedback--error" role="alert">
          {copy.errorConfig}
        </p>
      )}

      <div
        className="nav-contact__hp"
        aria-hidden
        tabIndex={-1}
      >
        <label htmlFor="contact-company">{copy.honeypotLabel}</label>
        <input
          id="contact-company"
          name="company"
          type="text"
          className="nav-contact__input"
          value={company}
          onChange={e => setCompany(e.target.value)}
          autoComplete="off"
        />
      </div>

      {isSuccess && (
        <p className="nav-contact__feedback nav-contact__feedback--success" role="status">
          {copy.successMessage}
        </p>
      )}

      {status === "error" && serverMessage && (
        <p className="nav-contact__feedback nav-contact__feedback--error" role="alert">
          {serverMessage}
        </p>
      )}

      <div className="nav-contact__actions">
        <button
          type="submit"
          className="nav-contact__btn nav-contact__btn--primary"
          disabled={isSending}
        >
          {isSending ? copy.sendingLabel : copy.sendLabel}
        </button>
        {isSuccess && (
        <button
          type="button"
            className="nav-contact__btn nav-contact__btn--secondary"
            onClick={() => {
              setStatus("idle");
              setServerMessage(null);
              setTurnstileToken(null);
              turnstileRef.current?.reset();
            }}
          >
            {copy.newMessageLabel}
          </button>
        )}
      </div>
    </form>
  );
}
