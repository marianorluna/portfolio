import { NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/contact/send-contact-email";
import { verifyTurnstile } from "@/lib/contact/verify-turnstile";
import { checkContactRateLimit } from "@/lib/contact/rate-limit";
import { processContactRequest } from "@/lib/contact/contact-service";

export async function POST(request: Request): Promise<NextResponse> {
  const result = await processContactRequest(request, {
    captchaVerifier: {
      verify: verifyTurnstile
    },
    mailSender: {
      send: sendContactEmail
    },
    rateLimiter: {
      check: checkContactRateLimit
    }
  });
  return NextResponse.json(result.body, { status: result.status, headers: result.headers });
}
