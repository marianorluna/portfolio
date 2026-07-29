import { codeToHtml, type BundledLanguage, type SpecialLanguage } from "shiki";

export type LabCodeLanguage = BundledLanguage | SpecialLanguage;

const FALLBACK_LANG: SpecialLanguage = "text";

const KNOWN_LANGS = new Set<string>([
  "bash",
  "json",
  "text",
  "plaintext",
  "txt",
  "ts",
  "tsx",
  "js",
  "jsx",
  "md",
  "mdx",
  "yaml",
  "yml",
  "css",
  "html",
  "python",
  "py",
  "shell",
  "sh",
]);

/** Normaliza `language-json` / `lang-bash` a un id de lenguaje Shiki. */
export function resolveCodeLanguage(className?: string): LabCodeLanguage {
  if (!className) return FALLBACK_LANG;
  const match = /(?:language|lang)-([a-z0-9_+-]+)/i.exec(className);
  const raw = match?.[1]?.toLowerCase() ?? FALLBACK_LANG;
  const lang = raw === "shell" || raw === "sh" ? "bash" : raw;
  return (KNOWN_LANGS.has(lang) ? lang : FALLBACK_LANG) as LabCodeLanguage;
}

/**
 * Resalta código con Shiki (temas duales light/dark vía CSS variables).
 * Usado en RSC al compilar MDX del Lab.
 */
export async function highlightCode(
  code: string,
  lang: LabCodeLanguage
): Promise<string> {
  return codeToHtml(code, {
    lang,
    themes: {
      light: "github-light",
      dark: "github-dark",
    },
    defaultColor: false,
  });
}
