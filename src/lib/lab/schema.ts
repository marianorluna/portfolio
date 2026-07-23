import { z } from "zod";
import { LAB_CARD_SIZES, LAB_RESOURCE_LEVELS, LAB_RESOURCE_TYPES } from "@/types/lab";

/** kebab-case: minúsculas, dígitos y guiones simples, sin bordes en guion. */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** Mes calendario `YYYY-MM` (sin día ni hora). */
const YEAR_MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
/** Ruta pública absoluta que empieza por `/`. */
const PUBLIC_PATH_PATTERN = /^\/[a-zA-Z0-9._\-/]+$/;

export const labFrontmatterSchema = z.object({
  title: z.string().min(1, "title es obligatorio"),
  description: z.string().min(1, "description es obligatorio"),
  type: z.enum(LAB_RESOURCE_TYPES),
  slug: z.string().regex(SLUG_PATTERN, "slug debe ser kebab-case (ej. mi-entrada)"),
  level: z.enum(LAB_RESOURCE_LEVELS),
  tags: z.array(z.string().min(1)).min(1, "tags debe tener al menos un elemento"),
  coverImage: z
    .string()
    .regex(PUBLIC_PATH_PATTERN, "coverImage debe ser una ruta pública (ej. /lab/covers/entrada.webp)"),
  coverAlt: z.string().min(1).optional(),
  size: z.enum(LAB_CARD_SIZES).optional(),
  draft: z.boolean().optional(),
});

export type LabFrontmatterParseResult = z.infer<typeof labFrontmatterSchema>;

const labIndexEntrySchema = z
  .object({
    id: z.string().min(1, "id es obligatorio"),
    slug: z.string().regex(SLUG_PATTERN, "slug debe ser kebab-case"),
    createdAt: z.string().regex(YEAR_MONTH_PATTERN, "createdAt debe ser YYYY-MM"),
    updatedAt: z.string().regex(YEAR_MONTH_PATTERN, "updatedAt debe ser YYYY-MM"),
  })
  .refine((entry) => entry.updatedAt >= entry.createdAt, {
    message: "updatedAt no puede ser anterior a createdAt",
    path: ["updatedAt"],
  });

export const labIndexSchema = z.object({
  entries: z
    .array(labIndexEntrySchema)
    .min(0)
    .superRefine((entries, ctx) => {
      const seenIds = new Set<string>();
      const seenSlugs = new Set<string>();
      for (let i = 0; i < entries.length; i += 1) {
        const entry = entries[i];
        if (seenIds.has(entry.id)) {
          ctx.addIssue({
            code: "custom",
            message: `id duplicado: "${entry.id}"`,
            path: [i, "id"],
          });
        }
        seenIds.add(entry.id);
        if (seenSlugs.has(entry.slug)) {
          ctx.addIssue({
            code: "custom",
            message: `slug duplicado en index: "${entry.slug}"`,
            path: [i, "slug"],
          });
        }
        seenSlugs.add(entry.slug);
      }
    }),
});

export type LabIndexParseResult = z.infer<typeof labIndexSchema>;
export type LabIndexEntryParseResult = z.infer<typeof labIndexEntrySchema>;
