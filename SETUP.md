# Setup — pasos que requieren tu cuenta

Todo lo que se puede automatizar ya está hecho. Estos tres pasos necesitan credenciales,
pago o acceso a tu registrador, así que los tenés que hacer vos.

Están ordenados por impacto. El 1 es el único **bloqueante**.

---

## 1. Formspree — activar el formulario (BLOQUEANTE, ~5 min, gratis)

Hoy el formulario **no envía nada a un servidor**: mientras `FORM_ID` sea el placeholder,
cae a un `mailto:` que abre el cliente de correo del visitante. Eso pierde leads (mucha
gente no tiene cliente de mail configurado).

1. Creá una cuenta en https://formspree.io (plan free: 50 envíos/mes).
2. **New Form** → nombre "Veltra contacto" → email de destino.
3. Copiá el ID del form. Es el string final de la URL que te dan:
   `https://formspree.io/f/`**`xpzvgkda`** ← eso.
4. Abrí [`assets/main.js`](assets/main.js), línea ~38, y reemplazá:

   ```js
   var FORM_ID='YOUR_FORMSPREE_ID';   // ← antes
   var FORM_ID='xpzvgkda';            // ← después (tu ID real)
   ```

5. En Formspree → **Settings → Restrict to Domain**, agregá tu dominio
   (`ilandaniele.github.io`, y el dominio propio cuando lo tengas). Sin esto, cualquiera
   puede spamear tu form desde otro sitio.
6. `git add assets/main.js && git commit -m "Set Formspree form ID" && git push`

**Verificación:** entrá al sitio, mandá el form. Tenés que ver el mensaje de gracias
(no que se abra el mail) y que llegue el correo.

> El honeypot `_gotcha` ya está puesto: Formspree descarta automáticamente los envíos
> donde ese campo viene lleno, que es lo que hacen los bots.

---

## 2. Cloudflare — activar los security headers reales (~15 min, gratis)

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

Sirve solo si ya tenés dominio propio (paso 3). Los headers se agregan con una
**Transform Rule → Modify Response Header**, copiando los valores de [`_headers`](_headers).

**Verificación (cualquiera de las dos):**

```bash
curl -sI https://TU-DOMINIO/ | grep -i "strict-transport\|x-frame\|permissions-policy"
```

O pegá la URL en https://securityheaders.com — deberías pasar de **D** a **A**.

---

## 3. Dominio propio (~10 min + costo del dominio)

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
   - Formspree → domain allowlist (paso 1.5)

---

## Qué NO hace falta

El sitio es **estático**: no hay backend, base de datos, login ni servidor. Por eso no
aplican Row Level Security, CORS, rate limiting en origen, sanitización SQL, validación
de tokens, variables de entorno ni hardening de VPS/SSH. No hay superficie donde apliquen.

El rate limiting del formulario lo maneja Formspree (50/mes en free).
