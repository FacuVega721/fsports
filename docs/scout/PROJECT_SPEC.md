# FSports Scout Intelligence — Especificación del proyecto

> Documento maestro para Claude Code. Es la fuente de verdad del proyecto.
> Léelo completo antes de generar código. Construye por fases, no todo de una vez.

---

## 0. Contexto y objetivo

Construimos **FSports Scout Intelligence**: una plataforma web SaaS que genera
**informes de scouting de jugadores de fútbol con IA** a partir de datos abiertos.

El usuario ingresa el nombre de un jugador y recibe, en segundos, un informe
profesional en lenguaje natural (fortalezas, debilidades, contexto táctico,
recomendación de uso) en español o inglés. Se monetiza con suscripción mensual.

**Marca base existente:** `@oficialfsports` / `oficialfsports.com` (ya en Cloudflare).
**Subdominio objetivo del producto:** `scout.oficialfsports.com`.

### Principios de construcción (IMPORTANTE)

1. **Construir por fases.** No generes el producto completo de golpe. Sigue el
   orden de la sección 6. Cada fase tiene un entregable funcional.
2. **El informe es el producto.** La calidad del output de la IA es lo más
   importante. El prompt maestro (sección 5) es el activo central.
3. **Empezar simple.** Fase 1 no tiene login ni pagos. Solo el informe.
4. **Stack 100% Cloudflare** para no salir del ecosistema que ya usa el dueño.
5. **Costo inicial casi cero.** Todo debe correr en el free tier al arrancar.

---

## 1. Stack técnico

| Capa | Tecnología | Notas |
|------|-----------|-------|
| Runtime / API | **Cloudflare Workers** + **Hono** | Framework liviano, tipado, portable |
| Frontend | **React + Vite + Tailwind** servido por Workers/Pages | SPA simple |
| Base de datos | **Cloudflare D1** (SQLite) | Usuarios, informes, suscripciones |
| Almacenamiento | **Cloudflare R2** | PDFs generados |
| Cache / sesiones | **Cloudflare KV** | Sesiones, rate limiting, cache de datos |
| Auth | **better-auth** (con adaptador D1) | Email + Google. Re-instanciar por request |
| IA | **Claude API** (`claude-sonnet-4-6`) | Genera los informes |
| Pagos | **Stripe** (Checkout + Customer Portal) | Suscripciones |
| Datos (Fase 1) | **StatsBomb Open Data** | Gratis, JSON en GitHub |
| Datos (escala) | **API-Football** (RapidAPI) | Ligas LATAM, plan de pago |
| Dev tooling | **Wrangler** | CLI de Cloudflare |

### Gotchas conocidos del stack (tenerlos en cuenta)

- **Workers son stateless por request.** El objeto de `better-auth` debe
  re-instanciarse en cada request (exportar una factory, no un singleton). El
  binding de D1 cambia por invocación.
- **D1 es SQLite, no Postgres.** Sin stored procedures, sin full-text search
  nativo (FTS5), máximo 10 GB por DB. Para este producto alcanza de sobra.
- **Las env vars del frontend se compilan en build.** No uses Secrets de
  Cloudflare para variables que necesita el cliente; úsalas solo en el Worker.
- **Claude API key SIEMPRE en el backend (Worker).** Nunca exponerla al cliente.

---

## 2. Arquitectura

```
Cliente (React SPA)
   │  fetch /api/*
   ▼
Cloudflare Worker (Hono)
   ├── /api/report        → genera informe de jugador
   ├── /api/search        → busca jugadores
   ├── /api/similar       → jugadores similares (Fase 3)
   ├── /api/compare       → comparar A vs B (Fase 3)
   ├── /api/auth/*        → better-auth (Fase 2)
   ├── /api/billing/*     → Stripe (Fase 2)
   └── /api/export/pdf    → genera y guarda PDF (Fase 2)
        │
        ├──► D1   (usuarios, informes, suscripciones, límites de uso)
        ├──► R2   (PDFs)
        ├──► KV   (sesiones, rate limit, cache de datos de jugadores)
        ├──► Claude API (generación de texto)
        └──► StatsBomb Open / API-Football (datos)
```

### Flujo de un informe (camino crítico)

1. Cliente pide `/api/report?player=<id|nombre>`.
2. Worker valida el plan del usuario y su límite mensual de informes.
3. Worker obtiene datos del jugador (cache KV → si no, fuente de datos).
4. Worker **normaliza métricas**: por 90 min y percentiles por posición.
5. Worker arma el prompt (sección 5) y llama a Claude API.
6. Worker guarda el informe en D1 y lo devuelve al cliente.
7. (Fase 2) El usuario puede exportar a PDF → se genera y guarda en R2.

---

## 3. Modelo de datos (D1)

```sql
-- Usuarios
CREATE TABLE users (
  id            TEXT PRIMARY KEY,         -- uuid
  email         TEXT UNIQUE NOT NULL,
  name          TEXT,
  locale        TEXT DEFAULT 'es',        -- 'es' | 'en'
  plan          TEXT DEFAULT 'free',      -- 'free' | 'scout' | 'pro' | 'club'
  stripe_customer_id TEXT,
  created_at    TEXT DEFAULT (datetime('now'))
);

-- Suscripciones (espejo de Stripe)
CREATE TABLE subscriptions (
  id                 TEXT PRIMARY KEY,
  user_id            TEXT NOT NULL REFERENCES users(id),
  stripe_sub_id      TEXT UNIQUE,
  plan               TEXT NOT NULL,
  status             TEXT NOT NULL,       -- 'active' | 'canceled' | 'past_due'
  current_period_end TEXT,
  created_at         TEXT DEFAULT (datetime('now'))
);

-- Informes generados
CREATE TABLE reports (
  id          TEXT PRIMARY KEY,          -- uuid (también es la URL pública)
  user_id     TEXT REFERENCES users(id), -- null si fue anónimo (Fase 1)
  player_id   TEXT NOT NULL,
  player_name TEXT NOT NULL,
  locale      TEXT NOT NULL,
  content     TEXT NOT NULL,             -- el informe en markdown
  metrics_json TEXT,                     -- métricas normalizadas usadas
  pdf_key     TEXT,                      -- key en R2 si se exportó
  is_public   INTEGER DEFAULT 1,
  created_at  TEXT DEFAULT (datetime('now'))
);

-- Conteo de uso mensual (para límites por plan)
CREATE TABLE usage (
  user_id   TEXT NOT NULL REFERENCES users(id),
  month     TEXT NOT NULL,               -- 'YYYY-MM'
  reports   INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, month)
);

-- Lista de seguimiento de jugadores (Fase 3+)
CREATE TABLE watchlist (
  user_id    TEXT NOT NULL REFERENCES users(id),
  player_id  TEXT NOT NULL,
  player_name TEXT,
  added_at   TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, player_id)
);
```

### Límites por plan (validar en el Worker antes de generar)

| Plan | Informes/mes | Export PDF | Comparador | Similares | Seguimiento |
|------|-------------|-----------|-----------|-----------|-------------|
| free | 3 | ❌ | ❌ | ❌ | ❌ |
| scout | 50 | ✅ | ✅ | ❌ | ❌ |
| pro | ilimitado | ✅ | ✅ | ✅ | ✅ |
| club | ilimitado | ✅ | ✅ | ✅ | ✅ (multiusuario) |

---

## 4. Datos de jugadores

### Fase 1 — StatsBomb Open Data (gratis)

- Repo: `https://github.com/statsbomb/open-data`
- Estructura: `competitions.json` → `matches/` → `events/` y `lineups/`.
- Eventos por partido: pases, tiros, duelos, presiones, etc., geolocalizados.
- Cubre competiciones seleccionadas (Champions, La Liga, mundiales, femenino).
- **Estrategia:** pre-procesar los eventos para construir un **perfil agregado
  por jugador** (totales y por-90 de cada métrica) y guardarlo. No llames a la
  fuente cruda en cada request: cachéalo (KV o una tabla `players` en D1).

### Métricas a calcular y normalizar

Por cada jugador, agregar a partir de los eventos:

- **Ofensivas:** goles, xG, tiros, asistencias, xA, pases clave, regates
  completados, toques en el área.
- **Construcción:** pases intentados/completados, % acierto, pases progresivos,
  pases largos, distancia de pase.
- **Defensivas:** entradas, intercepciones, recuperaciones, presiones, duelos
  aéreos ganados, despejes.
- **Disciplina/uso:** minutos jugados, faltas, tarjetas.

Para cada métrica calcular: **valor por 90 minutos** y **percentil vs jugadores
de la misma posición** (esto es lo que hace que el informe sea comparable).

### Fase 4 — API-Football (de pago, para LATAM)

- Cubre 700+ ligas incluyendo Liga Argentina, Brasileirão, Liga MX.
- Plan ~10–50 USD/mes. Misma capa de normalización; solo cambia el adaptador.
- **Diseñar la capa de datos con una interfaz común** (`DataSource`) para poder
  enchufar StatsBomb o API-Football sin reescribir el resto.

```typescript
interface DataSource {
  searchPlayers(query: string): Promise<PlayerSummary[]>;
  getPlayerProfile(playerId: string): Promise<PlayerProfile>; // métricas normalizadas
}
```

---

## 5. Prompt maestro de generación de informes (EL ACTIVO CENTRAL)

> Este prompt es lo más importante del producto. Itéralo hasta que el informe
> "suene a scout real", no a un volcado de estadísticas. Guárdalo versionado.

### Estructura del system prompt

```
Eres un scout de fútbol profesional con 20 años de experiencia evaluando
jugadores para clubes. Escribes informes claros, honestos y útiles para
directores deportivos y entrenadores. Tu análisis combina los datos con
contexto táctico real del juego.

Reglas:
- Escribe en {locale} (español o inglés) con tono profesional pero legible.
- Basa TODO en las métricas provistas. No inventes datos que no estén.
- Cuando una métrica esté en un percentil alto o bajo para su posición,
  interprétala en términos futbolísticos, no solo numéricos.
- Sé honesto sobre las debilidades. Un informe que solo elogia no sirve.
- Estructura el informe en secciones claras (ver formato abajo).
- Termina con una recomendación concreta de uso/encaje táctico.
- Longitud: 350–550 palabras. Conciso y denso en valor.

Formato de salida (markdown):
## {nombre del jugador}
**Posición · Edad · Club · Liga**

### Resumen
(2–3 frases que capturen el perfil del jugador)

### Fortalezas
(3–4 puntos, cada uno apoyado en una métrica concreta y su lectura táctica)

### Debilidades / áreas de mejora
(2–3 puntos honestos)

### Perfil táctico
(En qué sistema y rol rinde mejor; con qué tipo de equipo encaja)

### Recomendación
(Para quién es útil este jugador y en qué contexto fichar­lo tiene sentido)
```

### User prompt (lo que arma el Worker)

```
Genera un informe de scouting para el siguiente jugador.

Jugador: {player_name}
Posición: {position}
Edad: {age} · Club: {club} · Liga: {league}
Minutos jugados: {minutes}

Métricas (valor por 90' y percentil vs su posición):
{tabla de métricas normalizadas}

Idioma del informe: {locale}
```

### Parámetros de la llamada

- Modelo: `claude-sonnet-4-6`
- `max_tokens`: ~1500
- Temperatura: media-baja (consistencia con algo de naturalidad).
- Cachear el informe en D1: si se vuelve a pedir el mismo jugador+locale en
  poco tiempo, servir el guardado para ahorrar costo.

---

## 6. Plan de construcción por fases

> Construye en este orden. No empieces una fase sin terminar la anterior.

### FASE 1 — MVP del informe (sin login, sin pagos)

**Objetivo:** una URL pública donde se ingresa un jugador y sale un informe.

- [ ] Inicializar proyecto: Worker + Hono + Vite/React + Tailwind + Wrangler.
- [ ] Configurar `wrangler.toml` con bindings D1, R2, KV (aunque no se usen aún).
- [ ] Script de ingesta: descargar StatsBomb Open Data y construir perfiles de
      jugador (métricas agregadas y normalizadas). Guardar en D1 tabla `players`.
- [ ] Capa `DataSource` con implementación `StatsBombSource`.
- [ ] Endpoint `POST /api/report`: recibe player_id + locale, arma prompt,
      llama a Claude API, guarda en `reports`, devuelve markdown.
- [ ] Endpoint `GET /api/search?q=`: autocompletado de nombres de jugadores.
- [ ] Frontend: buscador + render del informe en markdown + selector de idioma.
- [ ] Página pública `GET /r/:id`: muestra un informe guardado (compartible).
- [ ] Deploy a `scout.oficialfsports.com`.

**Entregable:** generar informes reales de 10–20 jugadores conocidos y que se
vean profesionales. Publicarlo en redes para medir uso.

---

### FASE 2 — Monetización (login + suscripción + PDF)

**Objetivo:** convertir el MVP en negocio. Primeros clientes que pagan.

- [ ] Integrar **better-auth** con adaptador D1 (email + Google). Factory por
      request (recordar: Workers stateless).
- [ ] Tablas `users`, `subscriptions`, `usage`. Asociar informes a usuarios.
- [ ] Middleware de límites: validar plan y uso mensual antes de generar.
- [ ] Integrar **Stripe**: Checkout para plan Scout, webhook para actualizar
      `subscriptions`, Customer Portal para gestión.
- [ ] Endpoint `POST /api/export/pdf`: renderiza el informe a PDF con branding
      de FSports, lo guarda en R2, devuelve URL. (Usar generación HTML→PDF).
- [ ] URL única y compartible por informe (ya existe `/r/:id`, asegurar branding).
- [ ] Páginas: pricing, cuenta/suscripción, onboarding.
- [ ] Emails transaccionales básicos (bienvenida, confirmación de pago).

**Entregable:** sistema de cobro funcionando. Primeros 10 pagos. Lanzar con
"oferta de fundadores" (precio reducido de por vida para los primeros 50–100).

---

### FASE 3 — Diferenciación (similares + comparador)

**Objetivo:** lo que ningún competidor tiene en español. Habilita plan Pro.

- [ ] Construir vector de métricas por jugador (perfil estadístico normalizado).
- [ ] Endpoint `POST /api/similar`: dado un jugador + filtros (edad, liga,
      posición), devolver los N más parecidos por distancia entre vectores.
      Claude explica por qué cada uno encaja.
- [ ] Endpoint `POST /api/compare`: dos jugadores → radar de percentiles +
      análisis narrativo de Claude ("para presión alta, A; para construcción, B").
- [ ] Frontend: pantalla de búsqueda por perfil + pantalla de comparación con
      radar chart.
- [ ] Activar plan Pro (39–49 USD) que desbloquea estas funciones + seguimiento.
- [ ] Tabla y UI de `watchlist`.

**Entregable:** plan Pro activo, primeros 5 suscriptores Pro.

---

### FASE 4 — Escala y mercado LATAM

**Objetivo:** ligas donde el dueño tiene ventaja cultural + plan Club.

- [ ] Implementar `ApiFootballSource` cumpliendo la interfaz `DataSource`.
- [ ] Incorporar Liga Argentina, Brasileirão, Liga MX.
- [ ] Adaptar prompts/métricas al contexto sudamericano.
- [ ] Plan **Club**: multiusuario, dashboard compartido (roles, invitaciones).
- [ ] Programa de referidos/afiliados.
- [ ] (Opcional) API pública para periodistas con API keys.

**Entregable:** 3+ ligas LATAM cubiertas, primer cliente Club.

---

## 7. Estructura de carpetas sugerida

```
fsports-scout/
├── wrangler.toml
├── package.json
├── src/
│   ├── index.ts              # entrypoint del Worker (Hono app)
│   ├── routes/
│   │   ├── report.ts
│   │   ├── search.ts
│   │   ├── similar.ts        # Fase 3
│   │   ├── compare.ts        # Fase 3
│   │   ├── auth.ts           # Fase 2
│   │   ├── billing.ts        # Fase 2
│   │   └── export.ts         # Fase 2
│   ├── data/
│   │   ├── source.ts         # interfaz DataSource
│   │   ├── statsbomb.ts      # StatsBombSource
│   │   └── apifootball.ts    # Fase 4
│   ├── ai/
│   │   ├── prompt.ts         # prompt maestro (versionado)
│   │   └── claude.ts         # cliente de Claude API
│   ├── lib/
│   │   ├── metrics.ts        # normalización por-90 y percentiles
│   │   ├── limits.ts         # validación de plan y uso
│   │   └── pdf.ts            # generación de PDF (Fase 2)
│   └── db/
│       ├── schema.sql
│       └── queries.ts
├── scripts/
│   └── ingest-statsbomb.ts   # pre-procesa datos a perfiles de jugador
└── web/                      # frontend React + Vite
    ├── index.html
    └── src/
        ├── App.tsx
        ├── pages/
        └── components/
```

---

## 8. Variables de entorno / secrets

Configurar con `wrangler secret put`:

- `ANTHROPIC_API_KEY` — clave de Claude API (solo backend).
- `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET` — Fase 2.
- `BETTER_AUTH_SECRET` — Fase 2.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — login Google, Fase 2.
- `APIFOOTBALL_KEY` — Fase 4.

Bindings en `wrangler.toml`: `DB` (D1), `BUCKET` (R2), `KV`.

---

## 9. Definición de "terminado" para el MVP (Fase 1)

El MVP está listo cuando:

1. Se puede buscar un jugador por nombre y obtener un informe en < 10 segundos.
2. El informe se ve profesional y "suena a scout" en español e inglés.
3. Cada informe tiene una URL pública compartible con branding de FSports.
4. Está desplegado en `scout.oficialfsports.com`.
5. El costo por informe es de centavos y la infraestructura corre en free tier.

---

## 10. Primer paso concreto para Claude Code

> Empieza aquí. No generes todo el proyecto de una vez.

1. Inicializa el proyecto base (Worker + Hono + Vite/React + Tailwind + Wrangler)
   con un `wrangler.toml` que declare los bindings D1, R2 y KV.
2. Crea el endpoint `GET /api/health` que devuelva `{ ok: true }` para verificar
   que el deploy funciona.
3. Escribe el `scripts/ingest-statsbomb.ts` que descargue UNA competición de
   StatsBomb Open Data y construya el perfil de UN jugador (métricas por-90).
   Imprime el resultado por consola.
4. Una vez que veamos un perfil de jugador real bien normalizado, seguimos con
   el prompt maestro y el endpoint `/api/report`.

Construye el paso 1 al 3 y muéstrame el resultado antes de avanzar.
