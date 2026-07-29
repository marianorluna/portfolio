import { describe, expect, it } from "vitest";
import {
  LAB_BENTO_WIDE_ASPECT_RATIO,
  resolveLabBentoCoverSrc,
  resolveLabBentoCoverVariant,
} from "./cover-variant";

describe("resolveLabBentoCoverVariant", () => {
  it("usa square cuando la celda es ~1:1", () => {
    expect(resolveLabBentoCoverVariant(1, true)).toBe("square");
    expect(resolveLabBentoCoverVariant(1.2, true)).toBe("square");
  });

  it("usa wide cuando la celda supera el umbral y hay portada", () => {
    expect(resolveLabBentoCoverVariant(LAB_BENTO_WIDE_ASPECT_RATIO, true)).toBe(
      "wide"
    );
    expect(resolveLabBentoCoverVariant(2, true)).toBe("wide");
  });

  it("cae a square si no hay imagen ancha", () => {
    expect(resolveLabBentoCoverVariant(2, false)).toBe("square");
  });
});

describe("resolveLabBentoCoverSrc", () => {
  const square = "/lab/covers/demo-grid.webp";
  const wide = "/lab/covers/demo-portada.webp";

  it("elige portada en celdas anchas", () => {
    expect(
      resolveLabBentoCoverSrc({
        coverImage: square,
        wideCoverImage: wide,
        aspectRatio: 1.8,
      })
    ).toBe(wide);
  });

  it("elige grid en celdas cuadradas", () => {
    expect(
      resolveLabBentoCoverSrc({
        coverImage: square,
        wideCoverImage: wide,
        aspectRatio: 1,
      })
    ).toBe(square);
  });

  it("usa coverImage si falta wideCoverImage", () => {
    expect(
      resolveLabBentoCoverSrc({ coverImage: square, aspectRatio: 2 })
    ).toBe(square);
  });
});
