import { NotFoundView } from "@/components/errors/NotFoundView";
import { globalNotFoundMetadata } from "@/config/site-seo";
import { DEFAULT_LOCALE } from "@/i18n/locale";

export const metadata = globalNotFoundMetadata;

export default function GlobalNotFound() {
  return <NotFoundView locale={DEFAULT_LOCALE} />;
}
