import { describe, expect, it } from "vitest";
import {
  estimateLabReadingMinutes,
  formatLabDurationReady,
  stripMdxToPlainText,
} from "./duration";

describe("formatLabDurationReady", () => {
  it("sustituye {minutes} en la plantilla", () => {
    expect(formatLabDurationReady(20, "~{minutes} min")).toBe("~20 min");
  });
});

describe("stripMdxToPlainText", () => {
  it("elimina tags JSX, fences y deja el texto", () => {
    const raw = `
Hola mundo.

<Figure src="/x.webp" alt="img" />

\`\`\`ts
const x = 1;
\`\`\`

Más [texto](https://example.com) aquí.
`;
    expect(stripMdxToPlainText(raw)).toBe("Hola mundo. Más texto aquí.");
  });
});

describe("estimateLabReadingMinutes", () => {
  it("devuelve al menos 1 minuto", () => {
    expect(estimateLabReadingMinutes("")).toBe(1);
    expect(estimateLabReadingMinutes("uno")).toBe(1);
  });

  it("redondea hacia arriba según wpm", () => {
    const words = Array.from({ length: 250 }, (_, i) => `w${i}`).join(" ");
    expect(estimateLabReadingMinutes(words, 200)).toBe(2);
  });
});
