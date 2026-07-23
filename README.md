# Mariano Luna · Portfolio 3D

Portfolio profesional bilingüe (ES/EN) construido sobre `Next.js` con interfaz 3D interactiva, URLs compartibles por proyecto, formulario de contacto endurecido y enfoque de arquitectura limpia en la capa de dominio.

## Objetivo del proyecto

Este repositorio implementa un portfolio personal con foco en:

- Experiencia visual 3D con narrativa de proyectos y hotspots por planta.
- Internacionalización por rutas (`/es` y `/en`) con segmentos localizados.
- Deep linking a proyectos concretos (`/es/proyectos/:slug`, `/en/projects/:slug`).
- Captación de contacto y reservas (Cal.com) con validación robusta y mitigación anti-spam.
- **Lab**: hub de recursos (tutoriales, guías, checklists, infografías, dashboards y notas) en MDX.
- Base mantenible para evolucionar contenido, UI y flujo comercial.

## Stack principal

- `Next.js 16` + `React 19`
- `TypeScript` en modo `strict`
- `Three.js` para escena 3D
- `Zod` para validación tipada del payload
- `Resend` para envío de correo
- `Cloudflare Turnstile` para verificación anti-bot
- `@calcom/embed-react` para reservas embebidas
- `lucide-react` para iconografía UI
- `next-mdx-remote` + `gray-matter` para el Lab (MDX con frontmatter)
- `Vitest` + `Testing Library` para pruebas
- `ESLint` para calidad estática

## Estructura del repositorio

```
.
|- app/                           # App Router, layout, rutas y API route
|  |- [locale]/                   # Páginas localizadas (es/en)
|  |  |- page.tsx                 # Home con escena 3D
|  |  |- proyectos/[slug]/        # Deep link ES → proyecto concreto
|  |  |- projects/[slug]/         # Deep link EN → proyecto concreto
|  |  |- lab/                     # Índice Lab
|  |  |- lab/[slug]/             # Entrada Lab (MDX)
|  |  |- legal/                   # Aviso legal, privacidad, cookies
|  |  |- [...slug]/              # Catch-all → 404 localizado
|  |- api/contact/route.ts        # Endpoint de contacto
|  |- sitemap.ts                  # Sitemap (home, legal, lab, proyectos)
|  |- robots.ts
|- content/lab/                   # Fuente de verdad MDX del Lab (es/ + en/)
|- middleware.ts                  # Resolución de locale → cabecera x-site-locale
|- src/
|  |- components/                 # UI, escena 3D, Lab, SEO, legal, errores
|  |- config/                     # SEO, tema, scripts de bootstrap
|  |- lib/contact/                # Dominio y servicios del formulario
|  |- lib/lab/                    # Loader MDX, schema Zod, índice para el rail
|  |- lib/legal/                  # Consentimiento y soporte legal
|  |- data/                       # Contenido traducido (data-es.json, data-en.json)
|  |- i18n/                       # Locale, Lab copy, segmentos de URL
|  |- utils/                      # Escena 3D, hotspots, helpers de proyecto
|  |- types/                      # Tipos compartidos (portfolio + lab)
|- public/                        # Assets estáticos (incl. og-social-preview.png)
```

## Rutas principales

| Ruta | Descripción |
|------|-------------|
| `/` | Redirige a `/es` |
| `/es`, `/en` | Home con escena 3D interactiva |
| `/es/proyectos/:slug` | Proyecto concreto (ES); abre la escena en ese hotspot |
| `/en/projects/:slug` | Proyecto concreto (EN); misma lógica |
| `/es/lab`, `/en/lab` | Índice del Lab (filtros por `?type=`) |
| `/es/lab/:slug`, `/en/lab/:slug` | Entrada del Lab |
| `/es/legal/*`, `/en/legal/*` | Páginas legales |
| `/api/contact` | POST del formulario de contacto |

Los `slug` de proyecto coinciden con el campo `id` en `src/data/data-*.json` (p. ej. `control-manager`, `ribbon-revit`, `visor-ifc`).

Los `slug` del Lab coinciden con el nombre de archivo en `content/lab/{locale}/` (p. ej. `conectar-revit-2027-cursor`).

## Requisitos previos

- `Node.js` 20 o superior
- `npm` 10 o superior

## Primer arranque

```bash
npm install
cp .env.example .env.local
npm run dev
```

Aplicación en desarrollo:

- [http://localhost:3000/es](http://localhost:3000/es)
- [http://localhost:3000/en](http://localhost:3000/en)
- [http://localhost:3000/es/proyectos/control-manager](http://localhost:3000/es/proyectos/control-manager)
- [http://localhost:3000/en/projects/control-manager](http://localhost:3000/en/projects/control-manager)
- [http://localhost:3000/es/lab](http://localhost:3000/es/lab)
- [http://localhost:3000/es/lab/conectar-revit-2027-cursor](http://localhost:3000/es/lab/conectar-revit-2027-cursor)

## Variables de entorno

Variables definidas en `.env.example`:

- `RESEND_API_KEY`: API key de Resend.
- `CONTACT_TO`: destino de los correos de contacto.
- `CONTACT_FROM`: remitente mostrado en el correo.
- `CONTACT_RATE_LIMIT_MAX_PER_MINUTE`: límite por IP.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: clave pública de Turnstile.
- `TURNSTILE_SECRET_KEY`: clave secreta de Turnstile (solo servidor).

Si falta alguna variable crítica, el endpoint responde con error de configuración (`503`) para evitar comportamiento ambiguo.

## Scripts disponibles

- `npm run dev`: entorno local.
- `npm run dev:local`: expone host `0.0.0.0` en puerto `3000`.
- `npm run build`: build de producción.
- `npm run start`: servidor sobre build generado.
- `npm run lint`: análisis estático.
- `npm run typecheck`: chequeo de tipos sin emitir.
- `npm run test`: tests en modo watch.
- `npm run test:run`: tests con coverage.
- `npm run ci:check`: `lint` + `typecheck` + `test:run`.

## Escena 3D y proyectos

- La escena (`PortfolioScene`) renderiza un edificio navegable por plantas con hotspots vinculados a proyectos (`src/utils/floor-project-hotspots.ts`).
- Al seleccionar un proyecto, la URL se sincroniza con el segmento localizado (`proyectos` / `projects`).
- Las rutas con `slug` cargan la escena con `initialProjectId` y abren directamente el inspector del proyecto.
- `PortfolioSceneLoadGate` gestiona la carga progresiva de la escena antes de mostrar la UI.
- Los embeds de demo (YouTube, Cal.com) respetan el consentimiento de cookies de terceros.

## Lab (recursos MDX)

El Lab no es un blog clásico: es un hub de piezas útiles tipadas (`tutorial`, `guia`, `checklist`, `infografia`, `dashboard`, `nota`). Las notas cubren el rol de “blog” sin una sección aparte.

### Acceso desde la UI 3D

Orden del rail: **Proyectos → Formación → Lab → Contacto → Citas**.

El botón Lab abre un flyout con las entradas más recientes (desde `getLabIndexForNav`) y un CTA a `/{locale}/lab`. Al seguir un enlace se sale de la escena 3D hacia páginas de contenido (mismo patrón visual que legal).

### Pipeline de contenido

1. Autoría en `content/lab/{locale}/{slug}.mdx` (frontmatter YAML + cuerpo MDX).
2. Validación con Zod en `src/lib/lab/schema.ts`.
3. Compilación RSC con `next-mdx-remote` (`compileMDX`) y componentes en `src/components/lab/`.
4. Rutas en `app/[locale]/lab/` con metadata y JSON-LD; sitemap incluye índice y cada entrada.

Guía de autoría y checklist de publicación: [`content/lab/README.md`](content/lab/README.md).

## Arquitectura (contacto)

El flujo de contacto está separado por contratos (ports) para desacoplar dominio e infraestructura:

- `app/api/contact/route.ts` orquesta y delega dependencias.
- `src/lib/contact/contact-service.ts` concentra reglas de negocio.
- `src/lib/contact/ports.ts` define interfaces de entrada/salida.
- Adaptadores concretos:
  - Turnstile (`verify-turnstile.ts`)
  - Email (`send-contact-email.ts`)
  - Rate limit (`rate-limit.ts`)

Este enfoque facilita testeo, sustitución de proveedores y evolución incremental sin mezclar lógica de dominio con transporte HTTP.

## Seguridad y hardening

Configuraciones activas relevantes:

- Cabeceras de seguridad globales en `next.config.ts`.
- Política CSP en modo `Report-Only` para iterar sin romper UX.
- Validación de input con `Zod` y mapa de errores de campo.
- Honeypot (`company`) para bots básicos.
- Verificación Turnstile previa al envío de correo.
- Respuestas `Cache-Control: no-store` en el endpoint de contacto.

## SEO e internacionalización

La configuración SEO está centralizada en `src/config/site-seo.ts`:

- Metadatos por locale con `canonical` y `alternate` (`hreflang`).
- Open Graph y Twitter cards en home, proyectos, Lab y páginas legales.
- Imagen social por defecto (`/images/og-social-preview.png`) compartida en todas las URLs; título y descripción varían por página.
- `JSON-LD`:
  - `Person` y `WebSite` en el layout raíz.
  - `CollectionPage` en la home.
  - `CreativeWork` en cada página de proyecto.
  - `TechArticle` / `Article` en cada entrada del Lab.
- `sitemap.ts` incluye home, legal, **Lab (índice + entradas)** y **todas las URLs de proyectos** por locale.
- `robots.ts` en App Router.
- `middleware.ts` resuelve el locale desde el pathname e inyecta `x-site-locale` para uso en servidor.

## Testing y control de calidad

Recomendado antes de mergear:

```bash
npm run ci:check
```

Para revisar cobertura local:

```bash
npm run test:run
```

Vitest usa `pool: "vmThreads"` (ver `vitest.config.ts`) por compatibilidad en Windows con Vitest 4 / Vite 8. El widget Turnstile se sustituye en tests vía alias a `src/test/mocks/turnstile.tsx`.

## Legal

El proyecto incorpora páginas legales dentro de la aplicación (`aviso legal`, `privacidad` y `cookies`) para contexto España (RGPD/LOPDGDD + LSSI).
La licencia del código es `MIT` (ver `LICENSE`).

## Despliegue

Flujo recomendado:

1. Definir variables de entorno en la plataforma destino.
2. Ejecutar `npm run ci:check`.
3. Generar build con `npm run build`.
4. Arrancar con `npm run start` o desplegar en proveedor compatible con Next.js.
