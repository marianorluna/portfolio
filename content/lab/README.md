# Lab · Guía de autoría

El Lab publica tutoriales, guías, checklists, infografías, dashboards y notas (`nota` = blog corto) como MDX bajo este directorio.

## Estructura

```
content/lab/
|- index.json   # Registro central: id + fechas (YYYY-MM)
|- es/          # Español
|- en/          # Inglés
|- README.md
```

Cada entrada es un archivo `{slug}.mdx`. El `slug` del frontmatter **debe coincidir** con el nombre del archivo (sin `.mdx`) y con una fila en `index.json`.

URLs públicas:

- Índice: `/{locale}/lab`
- Entrada: `/{locale}/lab/{slug}`

Ejemplo: `content/lab/es/conectar-revit-2027-cursor.mdx` → `/es/lab/conectar-revit-2027-cursor`.

## Shells por `type`

El formato de página **no es único** para todo el Lab: lo elige `type`.

| `type` | Shell actual |
|--------|----------------|
| `tutorial` / `guia` | Shell tutorial (hero, TOC, kit interactivo) |
| `dashboard` / `infografia` / `checklist` | Article mínimo (shell propio pendiente) |
| `nota` | Article plano (blog corto) |

Un dashboard futuro tendrá otro layout; no hereda el shell tutorial.

## Registro `index.json`

Fuente de verdad de **id** y fechas. Formato:

```json
{
  "entries": [
    {
      "id": "01JXQ8K3M9N2P4R5S6T7V8W9XY",
      "slug": "conectar-revit-2027-cursor",
      "createdAt": "2026-07",
      "updatedAt": "2026-07"
    }
  ]
}
```

Reglas:

- `id`: UID opaco único (ULID/UUID o string numérico). **No** derivarlo del slug.
- `createdAt` / `updatedAt`: solo `YYYY-MM` (mes + año).
- Al actualizar un tutorial, sube `updatedAt` aquí. En card y entrada se muestra **una sola fecha** (la efectiva), con label “Publicado” o “Actualizado”.
- Todo slug publicado en `es/` y `en/` debe existir en el index; si falta o hay `id` duplicado, falla el build/lectura.

## Checklist de publicación

1. Crear el mismo `slug` en `es/` y `en/` (traducción completa del cuerpo).
2. Frontmatter válido (ver plantilla abajo). `slug` = nombre de archivo.
3. Añadir fila en `index.json` con `id` nuevo + fechas.
4. `draft: true` solo mientras editas; quítalo (o pon `false`) para publicar.
5. Usar componentes del kit cuando aporten claridad. Los fences \`\`\` obtienen botón de copiar automáticamente.
6. Comprobar en local: rail Lab → flyout → índice → entrada; filtros `?type=`; 404 con slug inventado.
7. `npm run ci:check` antes de mergear.

## Plantilla de frontmatter

```yaml
---
title: "Título claro y accionable"
description: "Una frase que diga qué aprenderá el lector."
type: tutorial   # tutorial | guia | checklist | infografia | dashboard | nota
slug: mi-entrada-kebab-case
level: intro     # intro | intermedio
tags: ["Revit", "IA"]
coverImage: "/lab/covers/mi-entrada.webp"
# coverAlt: "Descripción breve de la portada"
# size: lg   # sm | md | lg | wide (default: md)
# draft: true
---
```

Las fechas **no** van en el frontmatter: viven en `index.json`.

La portada debe vivir en `public/lab/covers/` (WebP preferible). El índice del Lab es un **bento** image-first: sin `coverImage` el schema falla.

## Componentes MDX (kit opcional)

| Componente | Uso |
|------------|-----|
| `<Section id="...">` | Panel de contenido de un tab del shell tutorial |
| `<Step number={1} title="..." defaultOpen>` | Paso numerado con acordeón |
| `<ReqCard icon="python" title="...">` | Card de requisito |
| `<ToolCard icon="search" title="..." tools={[...]}>` | Card de caso de uso / tools |
| `<CardGrid variant="req\|tool">` | Grid de cards |
| `<Callout variant="tip\|warning\|critical">` | Aviso destacado |
| `<PromptExample label="...">` | Prompt con botón Copiar |
| Fences \`\`\`lang | Bloque de código con botón Copiar |

Iconos `ReqCard` / `ToolCard`: `python`, `cuboid`, `search`, `boxes`, `palette`, `code`.

No uses HTML suelto en `/public` para piezas del Lab: la fuente de verdad es este MDX.

## Relación con el portfolio 3D

El botón **Lab** del rail (entre Formación y Contacto) abre un flyout con las entradas más recientes y un CTA “Abrir el Lab”. Las páginas `/lab` viven fuera de la escena 3D (mismo enfoque que las páginas legales).
