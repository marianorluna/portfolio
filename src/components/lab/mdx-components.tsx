import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef } from "react";
import { Callout } from "./Callout";
import { CodeBlock } from "./CodeBlock";
import { Figure } from "./Figure";
import { Highlight } from "./Highlight";
import { CardGrid, IntroCard, ReqCard, ToolCard } from "./LabCards";
import { PromptExample } from "./PromptExample";
import { PullQuote } from "./PullQuote";
import { Section } from "./Section";
import { Step } from "./Step";

function isExternalHref(href: string | undefined): boolean {
  return href != null && /^(https?:|mailto:|tel:)/i.test(href);
}

/** Fichas de proyecto del portfolio: misma UX que externos (lectura sin perder el sitio). */
function isPortfolioProjectHref(href: string | undefined): boolean {
  if (href == null) return false;
  return /(?:^|\/)(?:es\/proyectos|en\/projects)\//i.test(href);
}

function opensInNewTab(href: string | undefined): boolean {
  return isExternalHref(href) || isPortfolioProjectHref(href);
}

/**
 * Externos y fichas `/proyectos|projects/` en pestaña nueva;
 * resto de internos (Lab, legales, etc.) en la misma.
 */
function LabMdxAnchor({ href, children, ...rest }: ComponentPropsWithoutRef<"a">) {
  if (opensInNewTab(href)) {
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
 * `a` abre URLs externas y fichas de proyecto (`/proyectos|projects/`) en pestaña nueva.
 * `Figure` para capturas de pasos (`/lab/screenshots/…`).
 */
export const labMdxComponents: MDXComponents = {
  a: LabMdxAnchor,
  pre: CodeBlock,
  Step,
  Callout,
  Figure,
  Highlight,
  PullQuote,
  PromptExample,
  IntroCard,
  ReqCard,
  ToolCard,
  CardGrid,
  Section,
};
