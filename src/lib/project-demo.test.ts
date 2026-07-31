import { describe, expect, it } from "vitest";
import {
  isNonEmbeddableDemoUrl,
  normalizeDemoUrl,
  toExternalDemoUrl,
} from "./project-demo";

describe("normalizeDemoUrl", () => {
  it("decodifica &amp; literales", () => {
    expect(normalizeDemoUrl("https://example.com/?a=1&amp;controls=0")).toBe(
      "https://example.com/?a=1&controls=0"
    );
  });
});

describe("isNonEmbeddableDemoUrl", () => {
  it("detecta Autodesk App Store", () => {
    expect(
      isNonEmbeddableDemoUrl(
        "https://apps.autodesk.com/RVT/es/Detail/Index?id=1&mode=preview"
      )
    ).toBe(true);
  });

  it("no marca YouTube", () => {
    expect(isNonEmbeddableDemoUrl("https://www.youtube.com/embed/abc")).toBe(false);
  });
});

describe("toExternalDemoUrl", () => {
  it("convierte embed de YouTube a watch", () => {
    expect(
      toExternalDemoUrl(
        "https://www.youtube.com/embed/rWGBVo9qDEg?si=feIjLqulLjMs4RA5&amp;controls=0"
      )
    ).toBe("https://www.youtube.com/watch?v=rWGBVo9qDEg");
  });

  it("convierte youtu.be", () => {
    expect(toExternalDemoUrl("https://youtu.be/rWGBVo9qDEg")).toBe(
      "https://www.youtube.com/watch?v=rWGBVo9qDEg"
    );
  });

  it("deja URLs normales intactas (normalizadas)", () => {
    expect(toExternalDemoUrl("https://viewer.arqfi.com/")).toBe(
      "https://viewer.arqfi.com/"
    );
  });
});
