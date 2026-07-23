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
};

beforeEach(() => {
  files.clear();
  dirs.clear();
});

describe("listLabResources", () => {
  it("devuelve recursos publicados ordenados del más reciente al más antiguo", async () => {
    const { listLabResources } = await import("./content");
    setEntry("es", "guia-antigua", { ...baseFrontmatter, slug: "guia-antigua", publishedAt: "2025-01-01" });
    setEntry("es", "guia-reciente", { ...baseFrontmatter, slug: "guia-reciente", publishedAt: "2026-06-01" });

    const result = await listLabResources("es");

    expect(result.map(r => r.slug)).toEqual(["guia-reciente", "guia-antigua"]);
    expect(result[0].locale).toBe("es");
  });

  it("excluye recursos marcados como draft", async () => {
    const { listLabResources } = await import("./content");
    setEntry("es", "borrador", { ...baseFrontmatter, slug: "borrador", publishedAt: "2026-01-01", draft: true });
    setEntry("es", "publicado", { ...baseFrontmatter, slug: "publicado", publishedAt: "2026-01-02" });

    const result = await listLabResources("es");

    expect(result.map(r => r.slug)).toEqual(["publicado"]);
  });

  it("devuelve lista vacía si no existe el directorio del locale", async () => {
    const { listLabResources } = await import("./content");
    const result = await listLabResources("en");
    expect(result).toEqual([]);
  });

  it("lanza si el frontmatter no cumple el schema", async () => {
    const { listLabResources } = await import("./content");
    setEntry("es", "invalida", {
      description: "Falta title",
      type: "tutorial",
      slug: "invalida",
      level: "intro",
      tags: ["x"],
      publishedAt: "2026-01-01",
    });

    await expect(listLabResources("es")).rejects.toThrow(/Frontmatter inválido/);
  });

  it("lanza si el slug del frontmatter no coincide con el nombre de archivo", async () => {
    const { listLabResources } = await import("./content");
    setEntry("es", "archivo-real", { ...baseFrontmatter, slug: "otro-slug", publishedAt: "2026-01-01" });

    await expect(listLabResources("es")).rejects.toThrow(/no coincide con el nombre de archivo/);
  });
});

describe("getLabIndexForNav", () => {
  it("limita el número de resultados para el flyout del rail", async () => {
    const { getLabIndexForNav } = await import("./content");
    for (let i = 0; i < 6; i += 1) {
      setEntry("es", `entrada-${i}`, {
        ...baseFrontmatter,
        slug: `entrada-${i}`,
        publishedAt: `2026-01-0${i + 1}`,
      });
    }

    const result = await getLabIndexForNav("es", 3);

    expect(result).toHaveLength(3);
  });
});

describe("getLabResource", () => {
  it("devuelve null si el slug no existe", async () => {
    const { getLabResource } = await import("./content");
    const result = await getLabResource("es", "no-existe");
    expect(result).toBeNull();
  });

  it("devuelve null si el recurso es draft", async () => {
    const { getLabResource } = await import("./content");
    setEntry("es", "borrador", { ...baseFrontmatter, slug: "borrador", publishedAt: "2026-01-01", draft: true });

    const result = await getLabResource("es", "borrador");

    expect(result).toBeNull();
  });

  it("compila el MDX y devuelve frontmatter + contenido React", async () => {
    const { getLabResource } = await import("./content");
    setEntry("es", "entrada-completa", { ...baseFrontmatter, slug: "entrada-completa", publishedAt: "2026-01-01" }, "## Hola\n\nContenido de ejemplo.");

    const result = await getLabResource("es", "entrada-completa");

    expect(result).not.toBeNull();
    expect(result?.frontmatter.title).toBe("Título de prueba");
    expect(result?.locale).toBe("es");
    expect(isValidElement(result?.content)).toBe(true);
  });

  it("permite expresiones JS en props de componentes (p. ej. <Step number={1}>)", async () => {
    const { getLabResource } = await import("./content");
    setEntry(
      "es",
      "con-step",
      { ...baseFrontmatter, slug: "con-step", publishedAt: "2026-01-01" },
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
