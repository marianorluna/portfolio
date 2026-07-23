import { describe, expect, it } from "vitest";
import {
  getLabBentoPageCount,
  getLabBentoPageItems,
  LAB_BENTO_FIRST_CONTENT,
  LAB_BENTO_PAGE_SIZE,
  resolveLabBentoBreakpoint,
} from "./bento-pages";

describe("resolveLabBentoBreakpoint", () => {
  it("clasifica desktop / tablet / mobile (tablet hasta 1024)", () => {
    expect(resolveLabBentoBreakpoint(1280)).toBe("desktop");
    expect(resolveLabBentoBreakpoint(1025)).toBe("desktop");
    expect(resolveLabBentoBreakpoint(1024)).toBe("tablet");
    expect(resolveLabBentoBreakpoint(900)).toBe("tablet");
    expect(resolveLabBentoBreakpoint(560)).toBe("mobile");
  });
});

describe("getLabBentoPageCount", () => {
  it("desktop: 11 contenido = 1 página; 12 abre la segunda", () => {
    expect(getLabBentoPageCount(0, "desktop")).toBe(1);
    expect(getLabBentoPageCount(LAB_BENTO_FIRST_CONTENT, "desktop")).toBe(1);
    expect(getLabBentoPageCount(LAB_BENTO_FIRST_CONTENT + 1, "desktop")).toBe(2);
    expect(
      getLabBentoPageCount(LAB_BENTO_FIRST_CONTENT + LAB_BENTO_PAGE_SIZE, "desktop")
    ).toBe(2);
  });

  it("tablet/móvil: 6 contenido = 1 página; el resto pagina de 8", () => {
    expect(getLabBentoPageCount(6, "tablet")).toBe(1);
    expect(getLabBentoPageCount(7, "tablet")).toBe(2);
    expect(getLabBentoPageCount(6, "mobile")).toBe(1);
    expect(getLabBentoPageCount(7, "mobile")).toBe(2);
    expect(getLabBentoPageCount(14, "mobile")).toBe(2);
    expect(getLabBentoPageCount(15, "mobile")).toBe(3);
  });
});

describe("getLabBentoPageItems", () => {
  const items = Array.from({ length: 30 }, (_, i) => i);

  it("desktop: primera página 11, luego chunks de 12", () => {
    expect(getLabBentoPageItems(items, 0, "desktop")).toEqual(items.slice(0, 11));
    expect(getLabBentoPageItems(items, 1, "desktop")).toEqual(items.slice(11, 23));
  });

  it("tablet/móvil: primera página 6, luego chunks de 8", () => {
    expect(getLabBentoPageItems(items, 0, "tablet")).toEqual(items.slice(0, 6));
    expect(getLabBentoPageItems(items, 1, "tablet")).toEqual(items.slice(6, 14));
    expect(getLabBentoPageItems(items, 0, "mobile")).toEqual(items.slice(0, 6));
    expect(getLabBentoPageItems(items, 1, "mobile")).toEqual(items.slice(6, 14));
  });
});
