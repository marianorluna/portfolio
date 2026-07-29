import { redirect } from "next/navigation";
import { DEFAULT_LOCALE } from "@/i18n/locale";

export default function ContactoRootRedirect() {
  redirect(`/${DEFAULT_LOCALE}/contacto`);
}
