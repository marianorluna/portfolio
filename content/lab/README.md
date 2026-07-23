# Lab · Guía de autoría

El Lab publica tutoriales, guías, checklists, infografías, dashboards y notas (`nota` = blog corto) como MDX bajo este directorio.

## Estructura

```
content/lab/
|- es/   # Español
|- en/   # Inglés
|- README.md
```

Cada entrada es un archivo `{slug}.mdx`. El `slug` del frontmatter **debe coincidir** con el nombre del archivo (sin `.mdx`).

URLs públicas:

- Índice: `/{locale}/lab`
- Entrada: `/{locale}/lab/{slug}`

Ejemplo: `content/lab/es/conectar-revit-2027-cursor.mdx` → `/es/lab/conectar-revit-2027-cursor`.

## Checklist de publicación

1. Crear el mismo `slug` en `es/` y `en/` (traducción completa del cuerpo).
2. Frontmatter válido (ver plantilla abajo). `slug` = nombre de archivo.
3. `draft: true` solo mientras editas; quítalo (o pon `false`) para publicar.
4. Usar componentes del Lab cuando aporten claridad (`Step`, `Callout`, `PromptExample`). Los fences \`\`\` obtienen botón de copiar automáticamente.
5. Comprobar en local: rail Lab → flyout → índice → entrada; filtros `?type=`; 404 con slug inventado.
6. `npm run ci:check` antes de mergear.

## Plantilla de frontmatter

```yaml
---
title: "Título claro y accionable"
description: "Una frase que diga qué aprenderá el lector."
type: tutorial   # tutorial | guia | checklist | infografia | dashboard | nota
slug: mi-entrada-kebab-case
level: intro     # intro | intermedio
tags: ["Revit", "IA"]
publishedAt: "2026-07-23"
# draft: true
---
```

## Componentes MDX disponibles

| Componente | Uso |
|------------|-----|
| `<Step number={1} title="...">...</Step>` | Paso numerado de un tutorial |
| `<Callout variant="tip\|warning\|critical">...</Callout>` | Aviso destacado |
| `<PromptExample label="Prompt de ejemplo">...</PromptExample>` | Caja de prompt para copiar/adaptar |
| Fences \`\`\`lang | Bloque de código con botón Copiar |

No uses HTML suelto en `/public` para piezas del Lab: la fuente de verdad es este MDX.

## Relación con el portfolio 3D

El botón **Lab** del rail (entre Formación y Contacto) abre un flyout con las entradas más recientes y un CTA “Abrir el Lab”. Las páginas `/lab` viven fuera de la escena 3D (mismo enfoque que las páginas legales).
