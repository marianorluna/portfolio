import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

/** Cita / frase clave editorial (borde izquierdo accent, tipografía mayor). */
export function PullQuote({ children }: Props) {
  return <blockquote className="lab-pullquote">{children}</blockquote>;
}
