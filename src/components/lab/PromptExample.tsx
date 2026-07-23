"use client";

import { useState, type ReactNode } from "react";

type Props = {
  /** Etiqueta localizada (p. ej. "Prompt de ejemplo" / "Example prompt"). */
  label?: string;
  children: ReactNode;
};

const COPIED_RESET_MS = 1800;

function extractText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node != null && typeof node === "object" && "props" in node) {
    const withChildren = node as { props?: { children?: ReactNode } };
    return extractText(withChildren.props?.children);
  }
  return "";
}

/**
 * Caja destacada para un prompt de ejemplo a copiar/adaptar en el chat de IA.
 * `children` se envuelve en `<div>`, no `<p>`: en MDX el contenido de bloque
 * ya llega envuelto en su propio `<p>`, y anidar `<p>` es HTML inválido.
 */
export function PromptExample({ label = "Prompt", children }: Props) {
  const [copied, setCopied] = useState(false);
  const text = extractText(children).trim();

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_RESET_MS);
    } catch {
      // Clipboard no disponible; no bloquea la lectura.
    }
  };

  return (
    <blockquote className="lab-prompt">
      <div className="lab-prompt__top">
        <span className="lab-prompt__kicker">{label}</span>
        <button
          type="button"
          className="lab-prompt__copy"
          onClick={handleCopy}
          aria-label={copied ? "Prompt copiado" : "Copiar prompt"}
        >
          {copied ? "Copiado ✓" : "Copiar"}
        </button>
      </div>
      <div className="lab-prompt__text">{children}</div>
    </blockquote>
  );
}
