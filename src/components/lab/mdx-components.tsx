import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef } from "react";
import { Callout } from "./Callout";
import { CodeBlock } from "./CodeBlock";
import { Figure } from "./Figure";
import { CardGrid, IntroCard, ReqCard, ToolCard } from "./LabCards";
import { PromptExample } from "./PromptExample";
import { Section } from "./Section";
import { Step } from "./Step";

function isExternalHref(href: string | undefined): boolean {
  return href != null && /^(https?:|mailto:|tel:)/i.test(href);
}

/** Enlaces externos en pestaña nueva; internos en la misma. */
function LabMdxAnchor({ href, children, ...rest }: ComponentPropsWithoutRef<"a">) {
  if (isExternalHref(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}

/**
 * Componentes disponibles en el MDX del Lab.
 * `pre` se sobrescribe globalmente: cualquier fence ``` estándar obtiene botón
 * de copiar sin que el autor tenga que usar una etiqueta distinta.
 * `a` abre URLs externas en pestaña nueva.
 * `Figure` para capturas de pasos (`/lab/screenshots/…`).
 */
export const labMdxComponents: MDXComponents = {
  a: LabMdxAnchor,
  pre: CodeBlock,
  Step,
  Callout,
  Figure,
  PromptExample,
  IntroCard,
  ReqCard,
  ToolCard,
  CardGrid,
  Section,
};
