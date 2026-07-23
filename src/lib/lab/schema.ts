import { z } from "zod";
import { LAB_RESOURCE_LEVELS, LAB_RESOURCE_TYPES } from "@/types/lab";

/** kebab-case: minúsculas, dígitos y guiones simples, sin bordes en guion. */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const labFrontmatterSchema = z.object({
  title: z.string().min(1, "title es obligatorio"),
  description: z.string().min(1, "description es obligatorio"),
  type: z.enum(LAB_RESOURCE_TYPES),
  slug: z.string().regex(SLUG_PATTERN, "slug debe ser kebab-case (ej. mi-entrada)"),
  level: z.enum(LAB_RESOURCE_LEVELS),
  tags: z.array(z.string().min(1)).min(1, "tags debe tener al menos un elemento"),
  publishedAt: z.string().regex(ISO_DATE_PATTERN, "publishedAt debe tener formato YYYY-MM-DD"),
  draft: z.boolean().optional(),
});

export type LabFrontmatterParseResult = z.infer<typeof labFrontmatterSchema>;
