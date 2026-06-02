import { describe, expect, it } from "vitest";
import { getOtherLocale, resolveLocaleFromPathname } from "@/i18n/locale";

describe("resolveLocaleFromPathname", () => {
  it("resuelve es desde ruta con segmento adicional", () => {
    expect(resolveLocaleFromPathname("/es/foo")).toBe("es");
  });

  it("resuelve en desde home localizada", () => {
    expect(resolveLocaleFromPathname("/en")).toBe("en");
    expect(resolveLocaleFromPathname("/en/")).toBe("en");
  });

  it("usa es por defecto para locale inválido", () => {
    expect(resolveLocaleFromPathname("/fr/bar")).toBe("es");
    expect(resolveLocaleFromPathname("/unknown")).toBe("es");
  });

  it("usa es para pathname vacío o raíz", () => {
    expect(resolveLocaleFromPathname("/")).toBe("es");
    expect(resolveLocaleFromPathname("")).toBe("es");
  });
});

describe("getOtherLocale", () => {
  it("alterna entre es y en", () => {
    expect(getOtherLocale("es")).toBe("en");
    expect(getOtherLocale("en")).toBe("es");
  });
});
