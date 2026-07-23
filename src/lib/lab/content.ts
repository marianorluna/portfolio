import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import type { Locale } from "@/types/portfolio";
import type { LabFrontmatter, LabResource, LabResourceSummary } from "@/types/lab";
import { labMdxComponents } from "@/components/lab/mdx-components";
import { labFrontmatterSchema } from "./schema";

const CONTENT_ROOT = path.join(process.cwd(), "content", "lab");
/** Número de entradas recientes que se muestran en el flyout del rail. */
const DEFAULT_NAV_LIMIT = 4;

type RawEntry = { frontmatter: LabFrontmatter; body: string; filePath: string };

function entryFilePath(locale: Locale, slug: string): string {
  return path.join(CONTENT_ROOT, locale, `${slug}.mdx`);
}

/** Lee y valida un `.mdx` de disco. Devuelve `null` si el archivo no existe. */
async function readEntryFile(locale: Locale, slug: string): Promise<RawEntry | null> {
  const filePath = entryFilePath(locale, slug);
  let raw: string;
  try {
    raw = await readFile(filePath, "utf8");
  } catch {
    return null;
  }

  const { data, content } = matter(raw);
  const parsed = labFrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(
      `Frontmatter inválido en ${filePath}: ${parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; ")}`
    );
  }
  if (parsed.data.slug !== slug) {
    throw new Error(
      `El slug del frontmatter ("${parsed.data.slug}") no coincide con el nombre de archivo ("${slug}") en ${filePath}`
    );
  }

  return { frontmatter: parsed.data, body: content, filePath };
}

/** Slugs de todos los archivos `.mdx` presentes en disco para un locale (incluye drafts). */
async function readSlugsFromDisk(locale: Locale): Promise<string[]> {
  const dir = path.join(CONTENT_ROOT, locale);
  let files: string[];
  try {
    files = await readdir(dir);
  } catch {
    return [];
  }
  return files.filter(f => f.endsWith(".mdx")).map(f => f.replace(/\.mdx$/, ""));
}

/** Lista de recursos publicados (sin `draft`), ordenados del más reciente al más antiguo. */
export async function listLabResources(locale: Locale): Promise<LabResourceSummary[]> {
  const slugs = await readSlugsFromDisk(locale);
  const entries = await Promise.all(slugs.map(slug => readEntryFile(locale, slug)));
  return entries
    .filter((entry): entry is RawEntry => entry != null && !entry.frontmatter.draft)
    .map(entry => ({ ...entry.frontmatter, locale }))
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : a.publishedAt > b.publishedAt ? -1 : 0));
}

/** Subconjunto reciente para el flyout del rail (Navbar), sin exponer todo el índice. */
export async function getLabIndexForNav(
  locale: Locale,
  limit: number = DEFAULT_NAV_LIMIT
): Promise<LabResourceSummary[]> {
  const all = await listLabResources(locale);
  return all.slice(0, limit);
}

/** Recurso completo (frontmatter + MDX compilado). `null` si no existe o es `draft`. */
export async function getLabResource(locale: Locale, slug: string): Promise<LabResource | null> {
  const entry = await readEntryFile(locale, slug);
  if (entry == null || entry.frontmatter.draft) return null;

  const { content } = await compileMDX({
    source: entry.body,
    components: labMdxComponents,
    options: {
      parseFrontmatter: false,
      // Contenido de confianza (archivos locales versionados, no user-generated):
      // se necesitan expresiones JS para props como `number={1}` en <Step>.
      // `blockDangerousJS` (default true) sigue bloqueando eval/Function/process.
      blockJS: false,
    },
  });

  return { frontmatter: entry.frontmatter, locale, content };
}
