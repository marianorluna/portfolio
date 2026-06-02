"use client";

import { useServerInsertedHTML } from "next/navigation";

export type InlineScript = {
  id?: string;
  /** Tipo MIME; omitir para script ejecutable (text/javascript). */
  type?: string;
  /** Contenido JS o JSON ya serializado. */
  html: string;
};

type Props = {
  scripts: InlineScript[];
};

/**
 * Inyecta scripts inline en el stream SSR mediante useServerInsertedHTML, es
 * decir FUERA del árbol de React. React 19 nunca los renderiza en cliente, por
 * lo que no dispara el warning "Encountered a script tag while rendering React
 * component" (presente p. ej. al renderizar páginas not-found en Next 16).
 * Los scripts siguen presentes en el HTML servido (sin FOUC, visibles a
 * crawlers para JSON-LD).
 */
export function ServerInsertedScripts({ scripts }: Props) {
  useServerInsertedHTML(() => (
    <>
      {scripts.map((script, index) => (
        <script
          key={script.id ?? index}
          {...(script.type ? { type: script.type } : {})}
          dangerouslySetInnerHTML={{ __html: script.html }}
        />
      ))}
    </>
  ));

  return null;
}
