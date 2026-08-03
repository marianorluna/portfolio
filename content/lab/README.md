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
| `tutorial` | Shell tutorial (hero, TOC, kit interactivo) |
| `dashboard` / `infografia` / `checklist` | Article mínimo (shell propio pendiente) |
| `nota` | Shell de lectura (tipografía amena, imagen destacada, barra de progreso, subir). Enlaces a fichas `/proyectos|projects/` abren en pestaña nueva |

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
type: tutorial   # tutorial | checklist | infografia | dashboard | nota
slug: mi-entrada-kebab-case
level: intro     # intro | intermedio
# durationMinutes: 20   # opcional; minutos con requisitos ya instalados
tags: ["Revit", "IA"]
coverImage: "/lab/covers/mi-entrada-grid.webp"
# coverAlt: "Descripción breve de la card"
heroImage: "/lab/covers/mi-entrada-portada.webp"
# heroAlt: "Descripción breve del hero"
# size: lg   # sm | md | lg | wide (default: md)
# draft: true
---
```

Las fechas **no** van en el frontmatter: viven en `index.json`.

## Imágenes (2 por entrada + capturas)

### Covers / hero

Viven en `public/lab/covers/` como **WebP**. Convención de nombres:

| Sufijo | Frontmatter | Ratio | Uso |
|--------|-------------|-------|-----|
| `{slug}-portada.webp` | `heroImage` | **16:9** (~1920×1080) | Hero de la entrada **y** card del bento en celdas anchas |
| `{slug}-grid.webp` | `coverImage` | **1:1** (~1600×1600 o 2048×2048) | Card del bento en celdas ~cuadradas; safe zone centrada |

- `coverImage` (**obligatorio**): sin ella el schema falla. Siempre el asset `-grid`.
- `heroImage` (recomendado): portada del hero (tutoriales) o **imagen destacada** bajo el título (notas). Si falta, el hero/featured queda sin imagen y el bento usa solo `-grid`.
- **Notas (`type: nota`):** el shell de lectura muestra `heroImage` como featured post bajo el meta. En el cuerpo puedes insertar `<Figure>` en cualquier párrafo (inicio o medio), igual que en tutoriales.
- **Selección inteligente en el bento:** si hay `heroImage`, la card muestra `-grid` cuando el aspect ratio de la celda es &lt; 4/3 (1 columna / fill compacto) y `-portada` cuando es ≥ 4/3 (span 2 columnas, filtro con pocas cards, filas a ancho completo en móvil).
- Sujeto y safe zone **centrados**: el bento hace `object-fit: cover` y recorta bordes según la celda.

### Capturas de pasos (screenshots)

Viven en `public/lab/screenshots/{slug}/` como **WebP**. En el MDX, dentro de cada `<Step>`:

```mdx
<Figure
  src="/lab/screenshots/{slug}/03-pyrevit-routes.webp"
  alt="Descripción accesible"
  caption="Pie opcional bajo la imagen"
/>
```

Orden recomendado: instrucción → `<Figure>` → `Callout` / código. Si el archivo aún no existe, `Figure` muestra un hueco con el nombre esperado.

## Componentes MDX (kit opcional)

| Componente | Uso |
|------------|-----|
| `<Section id="...">` | Panel de contenido de un tab del shell tutorial |
| `<Step number={1} title="..." defaultOpen>` | Paso numerado con acordeón |
| `<Figure src="..." alt="..." caption="...">` | Captura o imagen editorial (pasos o cuerpo de notas) |
| `<Highlight>` | Párrafo importante con recuadro suave (notas) |
| `<PullQuote>` | Cita / frase clave con borde izquierdo accent (notas) |
| `<IntroCard icon="book" title="...">` | Card a ancho completo (intro de sección) |
| `<ReqCard icon="python" title="...">` | Card de requisito |
| `<ToolCard icon="search" title="..." tools={[...]}>` | Card de caso de uso / tools |
| `<CardGrid variant="req\|tool">` | Grid de cards |
| `<Callout variant="tip\|warning\|critical">` | Aviso destacado |
| `<PromptExample label="...">` | Prompt con botón Copiar |
| Fences \`\`\`lang | Bloque de código con botón Copiar |

Iconos `IntroCard` / `ReqCard` / `ToolCard`: `python`, `cuboid`, `search`, `boxes`, `palette`, `code`, `sparkles`, `book`.

No uses HTML suelto en `/public` para piezas del Lab: la fuente de verdad es este MDX.

## Copy e i18n

Dos capas de contenido + infra de locale:

| Capa | Ubicación | Qué contiene |
|------|-----------|--------------|
| UI del Lab (+ resto del sitio) | `src/data/data-{es,en}.json` → `lab.ui` | Flyout del portfolio 3D, índice, filtros, labels, TOC del shell tutorial |
| Contenido editorial | `content/lab/{locale}/*.mdx` + `index.json` | Títulos, descripciones y cuerpo de cada entrada |
| Locale / URLs | `src/i18n/` | Resolución de idioma y segmentos de ruta (no copy) |

Cualquier texto nuevo de la UI del Lab (CTAs, filtros, mensajes vacíos, tabs del shell, pie de feedback de tutoriales, botón subir en notas) va en `lab.ui` de los JSON del portfolio. El rail solo guarda datos estructurales del botón (`id`, `label`, `icon`).

Los tutoriales renderizan automáticamente `LabTutorialContactNote` al final del contenido (enlace a `/{locale}/contacto` + correo de `ui.contactSocial`). Copy: `tutorialContactLead`, `tutorialContactFormLabel`, `tutorialContactOr`.

Las notas (`type: nota`) montan `LabReadingChrome` (barra de progreso + subir) y muestran tiempo de lectura estimado a partir del cuerpo MDX. Copy: `scrollToTopLabel`, `readingTimeLabel`.

## Relación con el portfolio 3D

El botón **Lab** del rail (entre Formación y Contacto) abre un flyout con las entradas más recientes y un CTA “Abrir el Lab”. La descripción del flyout y del índice provienen de `lab.ui.indexDescription` en los JSON. Las páginas `/lab` viven fuera de la escena 3D (mismo enfoque que las páginas legales).
