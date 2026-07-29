import { describe, expect, it } from "vitest";
import { resolveCodeLanguage } from "./highlight-code";

describe("resolveCodeLanguage", () => {
  it("extrae language-* del className MDX", () => {
    expect(resolveCodeLanguage("language-json")).toBe("json");
    expect(resolveCodeLanguage("language-bash")).toBe("bash");
  });

  it("normaliza shell/sh a bash", () => {
    expect(resolveCodeLanguage("language-shell")).toBe("bash");
    expect(resolveCodeLanguage("lang-sh")).toBe("bash");
  });

  it("usa text como fallback", () => {
    expect(resolveCodeLanguage(undefined)).toBe("text");
    expect(resolveCodeLanguage("language-unknownlang")).toBe("text");
  });
});
