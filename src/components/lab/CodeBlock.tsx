"use client";

import { useState, type ComponentPropsWithoutRef, type ReactNode } from "react";

type Props = ComponentPropsWithoutRef<"pre">;

const COPIED_RESET_MS = 1800;

/** Extrae el texto plano de los hijos de un `<pre><code>...</code></pre>` generado por MDX. */
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
 * Override del elemento `pre` para MDX del Lab: añade botón de copiar sin que
 * el autor tenga que usar un componente distinto al fence estándar (```).
 */
export function CodeBlock({ children, className, ...rest }: Props) {
  const [copied, setCopied] = useState(false);
  const code = extractText(children).replace(/\n$/, "");

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
      <pre className={`lab-code__pre${className ? ` ${className}` : ""}`} {...rest}>
        {children}
      </pre>
    </div>
  );
}
