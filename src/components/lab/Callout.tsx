import type { ReactNode } from "react";

export type CalloutVariant = "tip" | "warning" | "critical";

type Props = {
  variant?: CalloutVariant;
  children: ReactNode;
};

const VARIANT_ICON: Record<CalloutVariant, string> = {
  tip: "💡",
  warning: "⚠️",
  critical: "❗",
};

/** Aviso destacado dentro del contenido (consejo, advertencia o bloqueo crítico). */
export function Callout({ variant = "tip", children }: Props) {
  return (
    <div className={`lab-callout lab-callout--${variant}`} role="note">
      <span className="lab-callout__icon" aria-hidden>
        {VARIANT_ICON[variant]}
      </span>
      <div className="lab-callout__body">{children}</div>
    </div>
  );
}
