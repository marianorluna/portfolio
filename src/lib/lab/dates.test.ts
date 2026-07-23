import { describe, expect, it } from "vitest";
import {
  formatLabMonthYear,
  getLabEffectiveDate,
  isLabUpdated,
  labMonthToDate,
} from "./dates";

describe("lab dates helpers", () => {
  it("elige updatedAt como fecha efectiva cuando es posterior", () => {
    expect(getLabEffectiveDate({ createdAt: "2026-01", updatedAt: "2026-07" })).toBe("2026-07");
    expect(isLabUpdated({ createdAt: "2026-01", updatedAt: "2026-07" })).toBe(true);
  });

  it("trata createdAt === updatedAt como no actualizado", () => {
    expect(getLabEffectiveDate({ createdAt: "2026-07", updatedAt: "2026-07" })).toBe("2026-07");
    expect(isLabUpdated({ createdAt: "2026-07", updatedAt: "2026-07" })).toBe(false);
  });

  it("formatea mes y año sin día", () => {
    expect(formatLabMonthYear("2026-07", "es")).toMatch(/2026/);
    expect(formatLabMonthYear("2026-07", "es").toLowerCase()).toContain("jul");
    expect(formatLabMonthYear("2026-07", "en")).toMatch(/2026/);
  });

  it("convierte YYYY-MM a Date UTC día 1", () => {
    const date = labMonthToDate("2026-07");
    expect(date.getUTCFullYear()).toBe(2026);
    expect(date.getUTCMonth()).toBe(6);
    expect(date.getUTCDate()).toBe(1);
  });
});
