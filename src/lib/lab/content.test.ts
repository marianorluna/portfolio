import path from "node:path";
import { isValidElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const files = new Map<string, string>();
const dirs = new Map<string, string[]>();

vi.mock("node:fs/promises", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs/promises")>();
  const readFile = vi.fn(async (filePath: string) => {
    const content = files.get(filePath);
    if (content == null) throw new Error(`ENOENT: ${filePath}`);
    return content;
  });
  const readdir = vi.fn(async (dirPath: string) => {
    const entries = dirs.get(dirPath);
    if (entries == null) throw new Error(`ENOENT dir: ${dirPath}`);
    return entries;
  });
  return { ...actual, readFile, readdir, default: { ...actual, readFile, readdir } };
});

const CONTENT_ROOT = path.join(process.cwd(), "content", "lab");
const INDEX_PATH = path.join(CONTENT_ROOT, "index.json");

function setIndex(
  entries: Array<{ id: string; slug: string; createdAt: string; updatedAt: string }>
): void {
  files.set(INDEX_PATH, JSON.stringify({ entries }));
}

function setEntry(
  locale: "es" | "en",
  slug: string,
  frontmatter: Record<string, unknown>,
  body = "Contenido de prueba."
): void {
  const dir = path.join(CONTENT_ROOT, locale);
  const filePath = path.join(dir, `${slug}.mdx`);
  const frontmatterYaml = Object.entries(frontmatter)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join("\n");
  files.set(filePath, `---\n${frontmatterYaml}\n---\n\n${body}\n`);
  const existing = dirs.get(dir) ?? [];
  if (!existing.includes(`${slug}.mdx`)) existing.push(`${slug}.mdx`);
  dirs.set(dir, existing);
}

const baseFrontmatter = {
  title: "Título de prueba",
  description: "Descripción de prueba",
  type: "tutorial",
  level: "intro",
  tags: ["revit"],
  coverImage: "/lab/covers/conectar-revit-2027-cursor.webp",
};

beforeEach(() => {
  files.clear();
  dirs.clear();
  vi.resetModules();
});

describe("listLabResources", () => {
  it("devuelve recursos publicados ordenados por fecha efectiva del index", async () => {
    const { listLabResources } = await import("./content");
    setIndex([
      { id: "1001", slug: "guia-antigua", createdAt: "2025-01", updatedAt: "2025-01" },
      { id: "1002", slug: "guia-reciente", createdAt: "2026-01", updatedAt: "2026-06" },
    ]);
    setEntry("es", "guia-antigua", { ...baseFrontmatter, slug: "guia-antigua" });
    setEntry("es", "guia-reciente", { ...baseFrontmatter, slug: "guia-reciente" });

    const result = await listLabResources("es");

    expect(result.map((r) => r.slug)).toEqual(["guia-reciente", "guia-antigua"]);
    expect(result[0].locale).toBe("es");
    expect(result[0].id).toBe("1002");
    expect(result[0].updatedAt).toBe("2026-06");
  });

  it("excluye recursos marcados como draft", async () => {
    const { listLabResources } = await import("./content");
    setIndex([
      { id: "1001", slug: "borrador", createdAt: "2026-01", updatedAt: "2026-01" },
      { id: "1002", slug: "publicado", createdAt: "2026-01", updatedAt: "2026-02" },
    ]);
    setEntry("es", "borrador", { ...baseFrontmatter, slug: "borrador", draft: true });
    setEntry("es", "publicado", { ...baseFrontmatter, slug: "publicado" });

    const result = await listLabResources("es");

    expect(result.map((r) => r.slug)).toEqual(["publicado"]);
  });

  it("devuelve lista vacía si no existe el directorio del locale", async () => {
    const { listLabResources } = await import("./content");
    setIndex([]);
    const result = await listLabResources("en");
    expect(result).toEqual([]);
  });

  it("lanza si el frontmatter no cumple el schema", async () => {
    const { listLabResources } = await import("./content");
    setIndex([{ id: "1001", slug: "invalida", createdAt: "2026-01", updatedAt: "2026-01" }]);
    setEntry("es", "invalida", {
      description: "Falta title",
      type: "tutorial",
      slug: "invalida",
      level: "intro",
      tags: ["x"],
    });

    await expect(listLabResources("es")).rejects.toThrow(/Frontmatter inválido/);
  });

  it("lanza si el slug del frontmatter no coincide con el nombre de archivo", async () => {
    const { listLabResources } = await import("./content");
    setIndex([{ id: "1001", slug: "archivo-real", createdAt: "2026-01", updatedAt: "2026-01" }]);
    setEntry("es", "archivo-real", { ...baseFrontmatter, slug: "otro-slug" });

    await expect(listLabResources("es")).rejects.toThrow(/no coincide con el nombre de archivo/);
  });

  it("lanza si el slug no está en index.json", async () => {
    const { listLabResources } = await import("./content");
    setIndex([]);
    setEntry("es", "sin-index", { ...baseFrontmatter, slug: "sin-index" });

    await expect(listLabResources("es")).rejects.toThrow(/no está registrado en content\/lab\/index\.json/);
  });
});

describe("getLabIndexForNav", () => {
  it("limita el número de resultados para el flyout del rail", async () => {
    const { getLabIndexForNav } = await import("./content");
    const indexEntries = [];
    for (let i = 0; i < 6; i += 1) {
      const slug = `entrada-${i}`;
      indexEntries.push({
        id: `id-${i}`,
        slug,
        createdAt: "2026-01",
        updatedAt: `2026-0${Math.min(i + 1, 9)}` as string,
      });
      setEntry("es", slug, { ...baseFrontmatter, slug });
    }
    setIndex(indexEntries);

    const result = await getLabIndexForNav("es", 3);

    expect(result).toHaveLength(3);
  });
});

describe("getLabResource", () => {
  it("devuelve null si el slug no existe", async () => {
    const { getLabResource } = await import("./content");
    setIndex([]);
    const result = await getLabResource("es", "no-existe");
    expect(result).toBeNull();
  });

  it("devuelve null si el recurso es draft", async () => {
    const { getLabResource } = await import("./content");
    setIndex([{ id: "1001", slug: "borrador", createdAt: "2026-01", updatedAt: "2026-01" }]);
    setEntry("es", "borrador", { ...baseFrontmatter, slug: "borrador", draft: true });

    const result = await getLabResource("es", "borrador");

    expect(result).toBeNull();
  });

  it("compila el MDX y devuelve frontmatter + id/fechas + contenido React", async () => {
    const { getLabResource } = await import("./content");
    setIndex([
      { id: "01TESTID000000000000000001", slug: "entrada-completa", createdAt: "2026-01", updatedAt: "2026-03" },
    ]);
    setEntry(
      "es",
      "entrada-completa",
      { ...baseFrontmatter, slug: "entrada-completa" },
      "## Hola\n\nContenido de ejemplo."
    );

    const result = await getLabResource("es", "entrada-completa");

    expect(result).not.toBeNull();
    expect(result?.frontmatter.title).toBe("Título de prueba");
    expect(result?.locale).toBe("es");
    expect(result?.id).toBe("01TESTID000000000000000001");
    expect(result?.createdAt).toBe("2026-01");
    expect(result?.updatedAt).toBe("2026-03");
    expect(isValidElement(result?.content)).toBe(true);
  });

  it("permite expresiones JS en props de componentes (p. ej. <Step number={1}>)", async () => {
    const { getLabResource } = await import("./content");
    setIndex([{ id: "1001", slug: "con-step", createdAt: "2026-01", updatedAt: "2026-01" }]);
    setEntry(
      "es",
      "con-step",
      { ...baseFrontmatter, slug: "con-step" },
      '<Step number={1} title="Paso uno">\n\nContenido del paso.\n\n</Step>'
    );

    const result = await getLabResource("es", "con-step");
    const html = renderToStaticMarkup(result!.content);

    expect(html).toContain("Paso uno");
    // Regresión: next-mdx-remote bloquea expresiones JS por defecto (blockJS)
    // y dejaría el número de paso vacío si no se desactiva explícitamente.
    expect(html).toMatch(/lab-step__number"[^>]*>1</);
  });
});
