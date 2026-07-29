/** Sustituye `{minutes}` en la plantilla de UI del Lab. */
export function formatLabDurationReady(minutes: number, template: string): string {
  return template.replaceAll("{minutes}", String(minutes));
}
