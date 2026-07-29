import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import { highlightCode, resolveCodeLanguage } from "@/lib/lab/highlight-code";
import { CodeBlockClient } from "./CodeBlockClient";

type Props = ComponentPropsWithoutRef<"pre">;

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

function extractClassName(node: ReactNode): string | undefined {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = extractClassName(child);
      if (found) return found;
    }
    return undefined;
  }
  if (node != null && typeof node === "object" && "props" in node) {
    const el = node as ReactElement<{ className?: string; children?: ReactNode }>;
    if (typeof el.props.className === "string" && el.props.className.length > 0) {
      return el.props.className;
    }
    return extractClassName(el.props.children);
  }
  return undefined;
}

/**
 * Override del elemento `pre` para MDX del Lab: resaltado Shiki (RSC) + botón de
 * copiar. El autor sigue usando el fence estándar (```json).
 */
export async function CodeBlock({ children, className }: Props) {
  const code = extractText(children).replace(/\n$/, "");
  const lang = resolveCodeLanguage(className ?? extractClassName(children));
  const html = await highlightCode(code, lang);

  return <CodeBlockClient code={code} html={html} />;
}
