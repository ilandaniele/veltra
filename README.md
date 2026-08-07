# Veltra

Landing page de **Veltra** — empleados digitales especializados por industria. El primer agente es **ClaimMix**, un analista de siniestros con IA para aseguradoras que recibe, valida, filtra y carga cada caso de punta a punta.

🌐 **Sitio en vivo:** https://ilandaniele.github.io/veltra/

> ⚠️ **El formulario de contacto todavía no envía nada.** Falta poner el ID de Formspree.
> Ver [`SETUP.md`](SETUP.md) — es un paso de 5 minutos y es lo único bloqueante.

## Estructura

| Archivo | Qué es |
|---|---|
| [`index.html`](index.html) | Markup + CSS. Página única, sin build ni dependencias. |
| [`assets/main.js`](assets/main.js) | Toda la interactividad. **Externalizado a propósito** (ver abajo). |
| [`_headers`](_headers) | Security headers HTTP. Solo se aplican en Cloudflare Pages / Netlify. |
| [`robots.txt`](robots.txt) · [`sitemap.xml`](sitemap.xml) | SEO. |
| [`SETUP.md`](SETUP.md) | Los 3 pasos que requieren tu cuenta (Formspree, Cloudflare, dominio). |
| [`design/`](design/) | Export original de Claude Design. Referencia, **no se publica**. |

### Por qué el JS está en un archivo aparte

La CSP usa `script-src 'self'` **sin `'unsafe-inline'`**, que es la principal defensa
contra XSS disponible en un sitio estático. Eso solo funciona si no hay ni un `<script>`
inline en el HTML.

> **Si volvés a meter JavaScript inline en `index.html`, el navegador lo bloquea y la
> página deja de funcionar.** Todo el JS va en `assets/main.js`.

## Desarrollo local

No requiere build, pero **sí requiere servirlo por HTTP** — abrir el archivo con
`file://` hace que la CSP bloquee `assets/main.js`.

```sh
npx serve .
```

## Deploy

Automático con **GitHub Pages** desde la rama `main`. Cada push actualiza el sitio.

> **Ojo:** este repo se edita desde varias sesiones. Hacé siempre `git fetch` y revisá
> `git log main..origin/main` antes de pushear. Nunca `--force`.

### Limitación de GitHub Pages

GitHub Pages **no puede mandar headers HTTP personalizados**. La CSP y `nosniff` van como
`<meta>`, pero `Strict-Transport-Security`, `X-Frame-Options`, `Permissions-Policy` y
`frame-ancestors` **solo existen como headers reales** — hoy no están activos.
[`_headers`](_headers) ya los tiene configurados; se activan al mover el hosting a
Cloudflare Pages o Netlify. Pasos en [`SETUP.md`](SETUP.md).
