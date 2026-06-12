# Veltra

Landing page de **Veltra** — empleados digitales especializados por industria. El primer agente es **ClaimMix**, un analista de siniestros con IA para aseguradoras que recibe, valida, filtra y carga cada caso de punta a punta.

🌐 **Sitio en vivo:** https://ilandaniele.github.io/veltra/

## Estructura

- [`index.html`](index.html) — sitio de producción (página única, HTML/CSS/JS vanilla, sin dependencias ni build)
- [`design/`](design/) — export original de Claude Design (incluye el panel de tweaks de desarrollo)

## Desarrollo local

No requiere build. Abrí `index.html` en el navegador, o serví la carpeta:

```sh
npx serve .
```

## Deploy

Se publica automáticamente con **GitHub Pages** desde la rama `main`. Cada push a `main` actualiza el sitio.
