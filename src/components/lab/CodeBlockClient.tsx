"use client";

import { useState } from "react";

type Props = {
  code: string;
  html: string;
};

const COPIED_RESET_MS = 1800;

/**
 * Capa cliente del CodeBlock: botón de copiar sobre HTML ya resaltado por Shiki.
 */
export function CodeBlockClient({ code, html }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_RESET_MS);
    } catch {
      // Clipboard no disponible (permisos/navegador); no bloquea la lectura.
    }
  };

  return (
    <div className="lab-code">
      <button
        type="button"
        className="lab-code__copy"
        onClick={handleCopy}
        aria-label={copied ? "Código copiado" : "Copiar código"}
      >
        {copied ? "Copiado ✓" : "Copiar"}
      </button>
      <div
        className="lab-code__highlight"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
