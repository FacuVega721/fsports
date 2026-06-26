/**
 * Sub-app de FSports Scout Intelligence, montada bajo /api/scout/* en el
 * Worker principal (ver worker/index.ts). Aislada en su propio router Hono
 * para no tocar el proxy/admin/SEO del sitio de fútbol/F1.
 */
import { Hono, type Context } from 'hono';
import { StatsBombSource } from './data/statsbomb';
import { profileToPromptInput } from './format';
import { generateScoutingReport } from './claude';

export interface ScoutEnv {
  DB: D1Database;
  KV: KVNamespace;
  ANTHROPIC_API_KEY: string;
}

const scoutApp = new Hono<{ Bindings: ScoutEnv }>().basePath('/api/scout');

// Señal de uso real (búsquedas, perfiles vistos, informes nuevos/cacheados),
// para decidir si/cuándo conviene monetizar. No bloquea la respuesta al
// usuario: se escribe en segundo plano vía waitUntil.
function logEvent(c: Context<{ Bindings: ScoutEnv }>, type: string): void {
  const p = c.env.DB.prepare('INSERT INTO events (type) VALUES (?)').bind(type).run().catch(() => {});
  try {
    c.executionCtx.waitUntil(p);
  } catch {
    /* sin executionCtx disponible (ej. en tests): no se espera, no rompe nada */
  }
}

scoutApp.get('/health', (c) => c.json({ ok: true }));

// Búsqueda de jugadores por nombre + filtros (posición, nacionalidad).
scoutApp.get('/search', async (c) => {
  const q = c.req.query('q')?.trim() ?? '';
  const positionGroup = c.req.query('group')?.trim() || undefined;
  const nationality = c.req.query('nat')?.trim() || undefined;
  // Sin texto ni filtros devuelve todos (para el dropdown de jugadores del MVP).
  const source = new StatsBombSource(c.env.DB);
  const players = await source.searchPlayers(q, { positionGroup, nationality });
  logEvent(c, 'search');
  return c.json({ players });
});

// Valores para poblar el filtro de nacionalidad.
scoutApp.get('/nationalities', async (c) => {
  const source = new StatsBombSource(c.env.DB);
  return c.json({ nationalities: await source.listNationalities() });
});

// Muestras disponibles de un jugador (histórico + cada competición).
scoutApp.get('/samples', async (c) => {
  const key = c.req.query('key')?.trim();
  if (!key) return c.json({ samples: [] });
  const source = new StatsBombSource(c.env.DB);
  return c.json({ samples: await source.listSamples(key) });
});

// Perfil de métricas + percentiles de una muestra, sin pasar por Claude
// (gratis: solo lectura de D1). Para ver el panel de stats sin gastar crédito.
scoutApp.get('/profile', async (c) => {
  const id = c.req.query('id')?.trim();
  if (!id) return c.json({ error: 'id requerido' }, 400);
  const source = new StatsBombSource(c.env.DB);
  const profile = await source.getPlayerProfile(id);
  if (!profile) return c.json({ error: 'jugador no encontrado' }, 404);
  logEvent(c, 'profile_view');
  return c.json({ profile });
});

interface ReportBody {
  playerId?: string;
  locale?: string;
}

// Genera (o devuelve cacheado) el informe de scouting de un jugador.
scoutApp.post('/report', async (c) => {
  let body: ReportBody = {};
  try {
    body = await c.req.json<ReportBody>();
  } catch {
    /* body vacío */
  }
  const playerId = body.playerId?.trim();
  const locale = body.locale === 'en' ? 'en' : 'es';
  if (!playerId) return c.json({ error: 'playerId requerido' }, 400);

  // El perfil (métricas + percentiles) se devuelve siempre, para los gráficos.
  const source = new StatsBombSource(c.env.DB);
  const profile = await source.getPlayerProfile(playerId);
  if (!profile) return c.json({ error: 'jugador no encontrado' }, 404);

  // Cache: si ya existe un informe del mismo jugador+idioma, reusar el texto.
  const cached = await c.env.DB.prepare(
    `SELECT id, content FROM reports WHERE player_id = ? AND locale = ? ORDER BY created_at DESC LIMIT 1`,
  )
    .bind(playerId, locale)
    .first<{ id: string; content: string }>();
  if (cached) {
    logEvent(c, 'report_cached');
    return c.json({ id: cached.id, content: cached.content, profile, cached: true });
  }

  if (!c.env.ANTHROPIC_API_KEY) {
    return c.json({ error: 'ANTHROPIC_API_KEY no configurada' }, 503);
  }

  let content: string;
  try {
    content = await generateScoutingReport(c.env, profileToPromptInput(profile, locale));
  } catch (err) {
    return c.json({ error: 'fallo al generar el informe', detail: String(err) }, 502);
  }

  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    `INSERT INTO reports (id, player_id, player_name, locale, content, metrics_json)
     VALUES (?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      playerId,
      profile.name,
      locale,
      content,
      JSON.stringify({ per90: profile.per90, percentiles: profile.percentiles }),
    )
    .run();

  logEvent(c, 'report_new');
  return c.json({ id, content, profile, cached: false });
});

// Informe guardado (público y compartible): /api/scout/r/:id
scoutApp.get('/r/:id', async (c) => {
  const id = c.req.param('id');
  const row = await c.env.DB.prepare(
    `SELECT id, player_id, player_name, locale, content, created_at FROM reports WHERE id = ? AND is_public = 1`,
  )
    .bind(id)
    .first<{ id: string; player_id: string; player_name: string; locale: string; content: string; created_at: string }>();
  if (!row) return c.json({ error: 'informe no encontrado' }, 404);

  // Adjuntar el perfil del jugador (métricas) para los gráficos de la página pública.
  const source = new StatsBombSource(c.env.DB);
  const profile = await source.getPlayerProfile(row.player_id);
  return c.json({ ...row, profile });
});

export default scoutApp;
