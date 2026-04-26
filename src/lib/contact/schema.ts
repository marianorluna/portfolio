import { z } from "zod";

export const contactFieldErrorCodes = [
  "name_required",
  "name_max",
  "email_invalid",
  "message_min",
  "message_max"
] as const;

export type ContactFieldErrorCode = (typeof contactFieldErrorCodes)[number];

export const contactRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "name_required" satisfies ContactFieldErrorCode })
    .max(120, { message: "name_max" satisfies ContactFieldErrorCode }),
  email: z
    .string()
    .trim()
    .min(1, { message: "email_invalid" satisfies ContactFieldErrorCode })
    .max(320)
    .email({ message: "email_invalid" satisfies ContactFieldErrorCode })
    .transform(val => val.toLowerCase()),
  message: z
    .string()
    .trim()
    .min(10, { message: "message_min" satisfies ContactFieldErrorCode })
    .max(4000, { message: "message_max" satisfies ContactFieldErrorCode })
});

export type ContactRequestPayload = z.infer<typeof contactRequestSchema>;

export function mapZodToFieldErrors(
  err: z.ZodError<unknown>
): Partial<Record<"name" | "email" | "message", ContactFieldErrorCode>> {
  const out: Partial<Record<"name" | "email" | "message", ContactFieldErrorCode>> = {};
  for (const issue of err.issues) {
    const key = issue.path[0];
    if (key === "name" || key === "email" || key === "message") {
      const code = issue.message;
      if (
        code === "name_required" ||
        code === "name_max" ||
        code === "email_invalid" ||
        code === "message_min" ||
        code === "message_max"
      ) {
        out[key] = code;
      }
    }
  }
  return out;
}
