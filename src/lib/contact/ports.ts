import type { ContactRequestPayload } from "./schema";

export type VerifyCaptchaResult =
  | { success: true }
  | { success: false; reason: "missing_secret" | "http" | "invalid" | "error_codes" };

export interface CaptchaVerifierPort {
  verify(token: string, request: Request): Promise<VerifyCaptchaResult>;
}

export interface MailSenderPort {
  send(payload: ContactRequestPayload): Promise<void>;
}

export interface ContactRateLimiterPort {
  check(request: Request): { allowed: boolean; retryAfterSeconds: number };
}
