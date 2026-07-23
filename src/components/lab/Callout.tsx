import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Info, Lightbulb } from "lucide-react";

export type CalloutVariant = "tip" | "warning" | "critical";

type Props = {
  variant?: CalloutVariant;
  children: ReactNode;
};

const VARIANT_ICON: Record<CalloutVariant, LucideIcon> = {
  tip: Lightbulb,
  warning: Info,
  critical: AlertTriangle,
};

/** Aviso destacado dentro del contenido (consejo, advertencia o bloqueo crítico). */
export function Callout({ variant = "tip", children }: Props) {
  const Icon = VARIANT_ICON[variant];
  return (
    <div className={`lab-callout lab-callout--${variant}`} role="note">
      <span className="lab-callout__icon" aria-hidden>
        <Icon size={16} strokeWidth={2} />
      </span>
      <div className="lab-callout__body">{children}</div>
    </div>
  );
}
