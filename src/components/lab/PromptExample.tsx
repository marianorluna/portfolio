import type { ReactNode } from "react";

type Props = {
  /** Etiqueta localizada (p. ej. "Prompt de ejemplo" / "Example prompt"). */
  label?: string;
  children: ReactNode;
};

/**
 * Caja destacada para un prompt de ejemplo a copiar/adaptar en el chat de IA.
 * `children` se envuelve en `<div>`, no `<p>`: en MDX el contenido de bloque
 * ya llega envuelto en su propio `<p>`, y anidar `<p>` es HTML inválido.
 */
export function PromptExample({ label = "Prompt", children }: Props) {
  return (
    <blockquote className="lab-prompt">
      <span className="lab-prompt__kicker">{label}</span>
      <div className="lab-prompt__text">{children}</div>
    </blockquote>
  );
}
