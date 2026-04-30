# Mariano Luna · Portfolio 3D

Portfolio profesional bilingüe (ES/EN) construido sobre `Next.js` con interfaz 3D interactiva, formulario de contacto endurecido y enfoque de arquitectura limpia en la capa de dominio.

## Objetivo del proyecto

Este repositorio implementa un portfolio personal con foco en:

- Experiencia visual 3D con narrativa de proyectos.
- Internacionalización por rutas (`/es` y `/en`).
- Captación de contacto con validación robusta y mitigación anti-spam.
- Base mantenible para evolucionar contenido, UI y flujo comercial.

## Stack principal

- `Next.js 16` + `React 19`
- `TypeScript` en modo `strict`
- `Three.js` para escena 3D
- `Zod` para validación tipada del payload
- `Resend` para envío de correo
- `Cloudflare Turnstile` para verificación anti-bot
- `Vitest` + `Testing Library` para pruebas
- `ESLint` para calidad estática

## Estructura del repositorio

```
.
|- app/                      # App Router, layout, rutas y API route
|  |- [locale]/              # Páginas localizadas (es/en)
|  |- api/contact/route.ts   # Endpoint de contacto
|- src/
|  |- components/            # UI y escena del portfolio
|  |- lib/contact/           # Dominio y servicios del formulario
|  |- lib/legal/             # Consentimiento y soporte legal
|  |- data/                  # Contenido traducido (JSON)
|  |- i18n/                  # Resolución de locale
|- public/                   # Assets estáticos
```

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

- Metadatos por locale (`/es`, `/en`) con `canonical` y `alternate`.
- Open Graph y Twitter cards configurados.
- `JSON-LD` para entidad personal y página de colección.
- `sitemap` y `robots` en App Router.

## Testing y control de calidad

Recomendado antes de mergear:

```bash
npm run ci:check
```

Para revisar cobertura local:

```bash
npm run test:run
```

## Legal

El proyecto incorpora páginas legales dentro de la aplicación (`aviso legal`, `privacidad` y `cookies`) para contexto España (RGPD/LOPDGDD + LSSI).
La licencia del código es `MIT` (ver `LICENSE`).

## Despliegue

Flujo recomendado:

1. Definir variables de entorno en la plataforma destino.
2. Ejecutar `npm run ci:check`.
3. Generar build con `npm run build`.
4. Arrancar con `npm run start` o desplegar en proveedor compatible con Next.js.
