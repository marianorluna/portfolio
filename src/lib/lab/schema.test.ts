import { describe, expect, it } from "vitest";
import { labFrontmatterSchema } from "./schema";

const base = {
  title: "BIM Dashboard",
  description: "Demo de panel BIM",
  type: "demo" as const,
  slug: "bim-dashboard",
  level: "intermedio" as const,
  tags: ["Revit"],
  coverImage: "/lab/covers/bim-dashboard-grid.webp",
};

describe("labFrontmatterSchema demo fields", () => {
  it("acepta demo sin video ni live", () => {
    const parsed = labFrontmatterSchema.safeParse(base);
    expect(parsed.success).toBe(true);
  });

  it("acepta demoVideoId, demoUrl y repoUrl válidos", () => {
    const parsed = labFrontmatterSchema.safeParse({
      ...base,
      demoVideoId: "rWGBVo9qDEg",
      demoUrl: "https://demo.example.com/",
      repoUrl: "https://github.com/example/bim-dashboard",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.demoVideoId).toBe("rWGBVo9qDEg");
      expect(parsed.data.demoUrl).toBe("https://demo.example.com/");
    }
  });

  it("acepta demoVideoPending sin demoVideoId", () => {
    const parsed = labFrontmatterSchema.safeParse({
      ...base,
      demoVideoPending: true,
      demoUrl: "https://demo.example.com/",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.demoVideoPending).toBe(true);
    }
  });

  it("rechaza demoUrl que no sea https", () => {
    const parsed = labFrontmatterSchema.safeParse({
      ...base,
      demoUrl: "http://inseguro.example.com/",
    });
    expect(parsed.success).toBe(false);
  });

  it("rechaza demoVideoId inválido", () => {
    const parsed = labFrontmatterSchema.safeParse({
      ...base,
      demoVideoId: "??",
    });
    expect(parsed.success).toBe(false);
  });
});
