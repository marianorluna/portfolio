import type { MDXComponents } from "mdx/types";
import { CodeBlock } from "./CodeBlock";
import { Step } from "./Step";
import { Callout } from "./Callout";
import { PromptExample } from "./PromptExample";

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
};
