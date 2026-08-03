/** Sustituye `{minutes}` en la plantilla de UI del Lab. */
export function formatLabDurationReady(minutes: number, template: string): string {
  return template.replaceAll("{minutes}", String(minutes));
}

const DEFAULT_WORDS_PER_MINUTE = 200;

/** Extrae texto plano aproximado de un cuerpo MDX (sin fences, tags ni markup). */
export function stripMdxToPlainText(source: string): string {
  return source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/[#>*_~|-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Minutos de lectura estimados a partir del cuerpo MDX.
 * Mínimo 1; redondeo hacia arriba a ~200 wpm.
 */
export function estimateLabReadingMinutes(
  source: string,
  wordsPerMinute: number = DEFAULT_WORDS_PER_MINUTE
): number {
  const text = stripMdxToPlainText(source);
  if (text.length === 0) return 1;
  const words = text.split(/\s+/).filter(Boolean).length;
  const wpm = wordsPerMinute > 0 ? wordsPerMinute : DEFAULT_WORDS_PER_MINUTE;
  return Math.max(1, Math.ceil(words / wpm));
}
