# SETUP.md — Guía de arranque antes de abrir Claude Code

> Esta guía es para vos (el humano), no para Claude Code. Es lo que conviene
> tener listo ANTES de empezar a programar, para no frenarte a mitad de camino.

---

## 1. Cuentas y accesos que necesitás

### Ya tenés
- ✅ Cuenta de **Cloudflare** (con `oficialfsports.com`).
- ✅ **Claude Code** instalado y funcionando.

### Tenés que conseguir / verificar

| Qué | Para qué | Cuándo | Costo |
|-----|----------|--------|-------|
| **API key de Claude** (Claude Platform) | Que el producto genere informes en producción | Fase 1 | Pago por uso (~centavos/informe) |
| **Node.js** instalado (v18+) | Correr Wrangler y el build | Fase 1 | Gratis |
| **Wrangler** (`npm i -g wrangler`) | CLI de Cloudflare | Fase 1 | Gratis |
| Cuenta de **Stripe** | Cobrar suscripciones | Fase 2 | Comisión por transacción |
| **Google OAuth** (Cloud Console) | Login con Google | Fase 2 | Gratis |
| Cuenta de **API-Football** (RapidAPI) | Datos de ligas LATAM | Fase 4 | ~10–50 USD/mes |

> **Importante:** la API key de Claude (para el producto) es DISTINTA de Claude
> Code (para programar). La key la generás en el Claude Platform y se carga como
> secret en el Worker. Es lo que tu app usa para llamar a la IA.

> **Sobre el costo de la API (HTML no la reemplaza):** el HTML es la *interfaz*
> (lo que el usuario ve, servido gratis por Cloudflare). La API de Claude es el
> *cocinero* que lee los datos del jugador y redacta el informe. El informe con
> IA ES el producto: es lo que justifica la suscripción. Sin IA te queda una
> página de estadísticas, que ya existe gratis en muchos lados. El costo es
> mínimo (~0,003 USD por informe, margen >95%) y se reduce aún más cacheando
> informes ya generados (previsto en el spec). No es un costo a evitar: es el
> insumo más barato y más valioso del negocio.

---

## 2. Pasos previos concretos (en orden)

> Varios de estos pasos los puede ejecutar **Claude Code** (vos aprobás cada
> comando, igual que cuando hiciste la web). Pero los que tocan tus credenciales,
> tu identidad o tu tarjeta los tenés que hacer **vos**: Claude Code no puede
> iniciar sesión ni manejar claves por seguridad. Abajo está marcado quién hace
> cada cosa.

| # | Paso | Quién |
|---|------|-------|
| 1 | Instalar Node.js (si no lo tenés): https://nodejs.org (versión LTS) | Vos (o Claude Code si ya tenés Node) |
| 2 | Instalar Wrangler: `npm install -g wrangler` | Claude Code (vos aprobás) |
| 3 | Autenticar con Cloudflare: `wrangler login` | **Vos** — abre el navegador y autorizás con tu cuenta |
| 4 | Generar la API key de Claude en el Claude Platform | **Vos** — está ligada a tu cuenta y pago |
| 5 | Crear una carpeta vacía para el repo y abrir Claude Code ahí | Vos |
| 6 | Copiar los 4 archivos `.md` a la raíz del repo | Vos |

**Los 4 archivos a copiar a la raíz:**
- `CLAUDE.md` (lo lee Claude Code automáticamente)
- `PROJECT_SPEC.md` (la especificación completa)
- `PROMPT.md` (el prompt maestro)
- `SETUP.md` (esta guía, como referencia)

> La carga de la API key como secret (`wrangler secret put ANTHROPIC_API_KEY`)
> la dispara Claude Code, pero cuando pida pegar la key, la pegás **vos en la
> terminal**. Nunca pegues la API key en el chat de Claude Code.

---

## 3. Recursos de Cloudflare a crear

Estos los puede crear **Claude Code** durante la Fase 1 (vos aprobás cada
comando). No hace falta que los corras a mano; están acá solo para que sepas qué
se está creando y por qué:

```bash
# Base de datos D1
wrangler d1 create fsports-scout-db

# Bucket R2 para los PDFs
wrangler r2 bucket create fsports-scout-pdfs

# Namespace KV para sesiones y cache
wrangler kv namespace create fsports-scout-kv
```

Cada comando devuelve un ID que va en el `wrangler.toml`. Claude Code se encarga
de configurarlo. (Estos comandos no tocan credenciales ni tarjeta, así que los
puede ejecutar sin problema una vez que vos hiciste el `wrangler login`.)

---

## 4. El primer mensaje a Claude Code

Una vez que tengas los 4 archivos en la raíz y Wrangler autenticado, abrí Claude
Code y mandale esto:

> Leé `CLAUDE.md` y `PROJECT_SPEC.md`. Estamos en la Fase 1. Empezá por el
> "primer paso": inicializá el proyecto base (Worker + Hono + Vite/React +
> Tailwind + Wrangler) con `wrangler.toml` declarando los bindings D1, R2 y KV,
> creá el endpoint `GET /api/health`, y escribí el script de ingesta que procese
> el perfil de UN jugador de StatsBomb Open Data. Mostrame el resultado antes de
> avanzar.
>
> Importante: antes de ejecutar cualquier comando que requiera mis credenciales,
> cuentas o tarjeta (login a Cloudflare, generar o cargar la API key, etc.),
> frená y explicame en pasos simples qué tengo que hacer yo. No asumas que algo
> ya está configurado: si necesitás un dato o una credencial, pedímela primero.

A partir de ahí, Claude Code tiene todo el contexto para trabajar.

> **Qué esperar:** Claude Code no va a recitar esta guía paso a paso — va a
> empezar a trabajar y proponerte comandos que vos aprobás, igual que con la web.
> Cuando llegue a un paso manual (los marcados como "Vos" en la sección 2) va a
> frenar y guiarte. Si en algún momento asume algo que no hiciste, decíselo
> directamente: por ejemplo "todavía no generé la API key, guiame".

---

## 5. Orden mental para no perderte

```
Fase 1  →  ¿El informe se ve profesional?   →  publicá en redes, medí uso
   │
   ▼ (solo si la gente lo usa)
Fase 2  →  ¿La gente paga?                   →  primeros 10 clientes
   │
   ▼ (solo si convierte)
Fase 3  →  similares + comparador            →  plan Pro + primeros Ads
   │
   ▼ (solo si CAC < LTV)
Fase 4  →  LATAM + plan Club                 →  escalar
```

**La regla de oro:** no pasés de fase sin cumplir el entregable de la actual.
Cada flecha es un punto de decisión con datos, no con suposiciones.

---

## 6. Qué NO hacer al arrancar (errores comunes)

- ❌ Construir login y pagos antes de validar que el informe es bueno.
- ❌ Invertir en Ads antes de tener conversión orgánica.
- ❌ Cargar 50 ligas antes de que UNA funcione bien.
- ❌ Exponer la API key de Claude en el frontend.
- ❌ Perfeccionar el diseño antes de validar el producto.

El objetivo de las primeras semanas es UNA cosa: que un informe de jugador real
se vea tan bien que vos mismo lo compartirías en @oficialfsports.

---

## 7. Archivos del proyecto (resumen)

| Archivo | Para quién | Contenido |
|---------|-----------|-----------|
| `CLAUDE.md` | Claude Code | Guía operativa, reglas, estado, primer paso |
| `PROJECT_SPEC.md` | Claude Code | Especificación completa: stack, datos, fases |
| `PROMPT.md` | Vos + Claude Code | Prompt maestro de informes, cómo iterarlo |
| `SETUP.md` | Vos | Esta guía: accesos, pasos previos, orden |
| `Plan_Estrategico_FSports.docx` | Vos | El plan de negocio completo (referencia) |
