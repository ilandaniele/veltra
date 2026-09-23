# Setup — pasos que requieren tu cuenta

Todo lo que se puede automatizar ya está hecho. Estos pasos necesitan credenciales,
pago o acceso a tu registrador, así que los tenés que hacer vos. Ninguno es bloqueante:
el contacto ya se agenda por Calendly (widget embebido en `#contacto`), no depende de
un formulario propio.

## 0. `design/` — sacarlo de lo publicado (pendiente, recomendado antes de lanzar)

`design/Veltra.html` y `design/tweaks-panel.jsx` están commiteados y por eso GitHub Pages
los sirve igual que cualquier otro archivo del repo — `robots.txt` los desindexa de
buscadores, pero **no** bloquea el acceso directo por URL
(`https://ilandaniele.github.io/veltra/design/Veltra.html` responde 200). Ese HTML es un
export viejo con copy ya corregida en el sitio real: dice "cargado en el core" y "Filtra
fraude" y describe infraestructura "self-hosted" — afirmaciones que `CLAUDE.md` marca
explícitamente como incorrectas (ver su sección 8). Si alguien de una aseguradora lo
encuentra, contradice lo que ya se le prometió por escrito.

Antes de lanzar formalmente: sacar `design/` del tracking de git (`git rm -r --cached
design/` + commit) o al menos purgar las frases desactualizadas de `Veltra.html`. No lo
hice solo porque no sé si querés conservar esos archivos como referencia en otro lado.

---

## 1. Cloudflare — activar los security headers reales (~15 min, gratis)

**El problema:** GitHub Pages no permite mandar headers HTTP propios.

Estado real medido sobre el sitio en vivo (2026-08-07):

| Header | Estado hoy |
|---|---|
| `Strict-Transport-Security` | ✅ **Ya está** — lo sirve `github.io` (`max-age=31556952`) |
| `Content-Security-Policy` | ✅ Cubierto vía `<meta>` |
| `X-Content-Type-Options` | ✅ Cubierto vía `<meta>` |
| `Referrer-Policy` | ✅ Cubierto vía `<meta>` |
| `X-Frame-Options` / `frame-ancestors` | ❌ **Faltan** — no hay protección anti-clickjacking |
| `Permissions-Policy` | ❌ Falta |
| `Cross-Origin-Opener-Policy` | ❌ Falta |

O sea: el hueco real es **clickjacking** (que alguien embeba el sitio en un iframe para
engañar visitantes) más dos headers de defensa en profundidad. No es urgente para una
landing sin login ni datos sensibles, pero es gratis de arreglar.
El archivo [`_headers`](_headers) ya tiene la configuración completa esperando.

Tenés dos caminos:

### Opción A — Cloudflare Pages (recomendado: lee `_headers` solo)

1. Creá cuenta en https://dash.cloudflare.com.
2. **Workers & Pages → Create → Pages → Connect to Git** → autorizá GitHub → elegí `veltra`.
3. Build settings: **Framework preset: None**, build command **vacío**, output directory **`/`**.
4. Deploy. Cloudflare aplica [`_headers`](_headers) automáticamente.

### Opción B — Cloudflare como proxy delante de GitHub Pages

Sirve solo si ya tenés dominio propio (paso 2). Los headers se agregan con una
**Transform Rule → Modify Response Header**, copiando los valores de [`_headers`](_headers).

**Verificación (cualquiera de las dos):**

```bash
curl -sI https://TU-DOMINIO/ | grep -i "strict-transport\|x-frame\|permissions-policy"
```

O pegá la URL en https://securityheaders.com — deberías pasar de **D** a **A**.

---

## 2. Dominio propio (~10 min + costo del dominio)

1. Comprá el dominio. Cloudflare Registrar lo vende **a precio de costo** (sin markup ni
   renovación inflada) y es lo más barato para `.com`. Para `.io`, Porkbun suele ganar.
2. En el repo, creá un archivo `CNAME` (sin extensión) en la raíz con **solo** el dominio:

   ```
   veltra.com.ar
   ```

   > ⚠️ Un `CNAME` mal escrito rompe el sitio. Por eso no lo dejé creado.

3. DNS en tu registrador:

   | Tipo | Nombre | Valor |
   |---|---|---|
   | CNAME | `www` | `ilandaniele.github.io` |
   | A | `@` | `185.199.108.153` |
   | A | `@` | `185.199.109.153` |
   | A | `@` | `185.199.110.153` |
   | A | `@` | `185.199.111.153` |

4. GitHub → repo → **Settings → Pages → Custom domain** → tu dominio → **Enforce HTTPS**.
   El certificado lo emite GitHub vía Let's Encrypt, no hay que gestionar nada.

5. Después de migrar, actualizá las URLs absolutas en:
   - [`index.html`](index.html) → `og:url` y `<link rel="canonical">`
   - [`sitemap.xml`](sitemap.xml) → `<loc>`
   - [`robots.txt`](robots.txt) → línea `Sitemap:`

---

## Qué NO hace falta

El sitio es **estático**: no hay backend, base de datos, login ni servidor. Por eso no
aplican Row Level Security, CORS, rate limiting en origen, sanitización SQL, validación
de tokens, variables de entorno ni hardening de VPS/SSH. No hay superficie donde apliquen.

El agendamiento lo maneja Calendly (rate limiting, spam y validación de disponibilidad
son responsabilidad suya, no nuestra).
