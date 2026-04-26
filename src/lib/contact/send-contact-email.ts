import { Resend } from "resend";
import type { ContactRequestPayload } from "./schema";
import { escapeHtml } from "./escape-html";

function getEnv(): { apiKey: string; from: string; to: string } {
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey == null || apiKey.length === 0) {
    throw new Error("MISSING_RESEND_KEY");
  }
  const to = process.env.CONTACT_TO;
  if (to == null || to.length === 0) {
    throw new Error("MISSING_CONTACT_TO");
  }
  const from =
    process.env.CONTACT_FROM && process.env.CONTACT_FROM.length > 0
      ? process.env.CONTACT_FROM
      : "Portfolio <onboarding@resend.dev>";
  return { apiKey, from, to };
}

/**
 * Puerto de salida: envía un correo vía Resend. Solo debe ejecutarse en el servidor.
 */
export async function sendContactEmail(payload: ContactRequestPayload): Promise<void> {
  const { apiKey, from, to } = getEnv();
  const resend = new Resend(apiKey);
  const { name, email, message } = payload;
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replaceAll("\n", "<br>");

  const { error } = await resend.emails.send({
    from,
    to: [to],
    replyTo: email,
    subject: `[Portfolio Mariano Luna] Mensaje de ${name}`,
    text: `Nombre: ${name}\nCorreo: ${email}\n\n${message}`,
    html: `<p><strong>Nombre:</strong> ${safeName}</p><p><strong>Correo:</strong> ${safeEmail}</p><p><strong>Mensaje:</strong></p><p>${safeMessage}</p>`,
  });

  if (error != null) {
    throw new Error(error.message);
  }
}
