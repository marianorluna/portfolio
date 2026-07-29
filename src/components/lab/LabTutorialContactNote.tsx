import Link from "next/link";
import type { Locale } from "@/types/portfolio";
import { Callout } from "./Callout";

type Props = {
  locale: Locale;
  lead: string;
  formLabel: string;
  orLabel: string;
  /** `mailto:…` desde `ui.contactSocial`. */
  emailHref: string;
};

/** Pie de feedback en tutoriales: formulario en inicio + correo del sitio. */
export function LabTutorialContactNote({
  locale,
  lead,
  formLabel,
  orLabel,
  emailHref,
}: Props) {
  const emailAddress = emailHref.replace(/^mailto:/i, "");

  return (
    <aside className="lab-tutorial-contact">
      <Callout variant="tip">
        <p className="lab-tutorial-contact__text">
          {lead}{" "}
          <Link href={`/${locale}`}>{formLabel}</Link> {orLabel}{" "}
          <a href={emailHref}>{emailAddress}</a>.
        </p>
      </Callout>
    </aside>
  );
}
