import type { MDXComponents } from "mdx/types";
import { Callout } from "./Callout";
import { CodeBlock } from "./CodeBlock";
import { CardGrid, ReqCard, ToolCard } from "./LabCards";
import { PromptExample } from "./PromptExample";
import { Section } from "./Section";
import { Step } from "./Step";

/**
 * Componentes disponibles en el MDX del Lab.
 * `pre` se sobrescribe globalmente: cualquier fence ``` estándar obtiene botón
 * de copiar sin que el autor tenga que usar una etiqueta distinta.
 */
export const labMdxComponents: MDXComponents = {
  pre: CodeBlock,
  Step,
  Callout,
  PromptExample,
  ReqCard,
  ToolCard,
  CardGrid,
  Section,
};
