import { describe, expect, it } from "vitest";
import { formatLabDurationReady } from "./duration";

describe("formatLabDurationReady", () => {
  it("sustituye {minutes} en la plantilla", () => {
    expect(formatLabDurationReady(20, "~{minutes} min")).toBe("~20 min");
  });
});
