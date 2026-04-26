import { NextResponse } from "next/server";
import {
  contactRequestSchema,
  mapZodToFieldErrors
} from "@/lib/contact/schema";
import { sendContactEmail } from "@/lib/contact/send-contact-email";
import { verifyTurnstile } from "@/lib/contact/verify-turnstile";

type Body = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  company?: unknown;
  turnstileToken?: unknown;
};

export async function POST(request: Request): Promise<NextResponse> {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json(
      { ok: false as const, error: "invalid_json" as const },
      { status: 400 }
    );
  }

  if (typeof body.company === "string" && body.company.trim().length > 0) {
    return NextResponse.json({ ok: true as const }, { status: 200 });
  }

  const turnstileToken =
    typeof body.turnstileToken === "string" ? body.turnstileToken.trim() : "";
  if (turnstileToken.length < 1) {
    return NextResponse.json(
      { ok: false as const, error: "turnstile" as const, code: "required" as const },
      { status: 400 }
    );
  }

  const check = await verifyTurnstile(turnstileToken, request);
  if (!check.success) {
    if (check.reason === "missing_secret") {
      return NextResponse.json(
        { ok: false as const, error: "config" as const },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { ok: false as const, error: "turnstile" as const, code: "verify" as const },
      { status: 403 }
    );
  }

  const parsed = contactRequestSchema.safeParse({
    name: body.name,
    email: body.email,
    message: body.message
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false as const,
        error: "validation" as const,
        fieldErrors: mapZodToFieldErrors(parsed.error)
      },
      { status: 400 }
    );
  }

  try {
    await sendContactEmail(parsed.data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "MISSING_RESEND_KEY" || msg === "MISSING_CONTACT_TO") {
      return NextResponse.json(
        { ok: false as const, error: "config" as const },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { ok: false as const, error: "server" as const },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true as const }, { status: 200 });
}
