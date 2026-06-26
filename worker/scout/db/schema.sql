-- FSports Scout Intelligence — esquema D1 (Fase 1)
-- Aplicar con:
--   npx wrangler d1 execute fsports-scout-db --file=worker/scout/db/schema.sql --local
--   npx wrangler d1 execute fsports-scout-db --file=worker/scout/db/schema.sql --remote

-- Perfiles de jugador pre-procesados desde StatsBomb Open Data.
-- Un perfil = un jugador en UNA competición (la muestra). per90_json y
-- percentiles_json guardan las métricas ya normalizadas (clave -> número).
CREATE TABLE IF NOT EXISTS players (
  id               TEXT PRIMARY KEY,        -- comp: "statsbomb:<comp>:<season>:<pid>" · agg: "statsbomb:agg:<pid>"
  source           TEXT NOT NULL,           -- 'statsbomb'
  kind             TEXT NOT NULL DEFAULT 'comp', -- 'comp' (una competición) | 'agg' (histórico)
  player_key       TEXT NOT NULL,           -- id del jugador en la fuente (agrupa sus muestras)
  player_id        TEXT NOT NULL,           -- = player_key (compat)
  player_name      TEXT NOT NULL,
  team_name        TEXT,
  competition_name TEXT,                    -- agg: "Histórico"
  season_name      TEXT,                    -- agg: "N competiciones"
  position         TEXT,                    -- posición (en español) más frecuente
  position_group   TEXT,                    -- GK | DEF | MID | FWD (para percentiles)
  nationality      TEXT,                    -- país del jugador (de lineups)
  age              INTEGER,                  -- edad (cruce con plantel Mundial 2026; NULL si no matchea)
  minutes          REAL NOT NULL DEFAULT 0,
  matches          INTEGER NOT NULL DEFAULT 0,
  per90_json       TEXT NOT NULL,           -- { metricKey: valuePer90 }
  percentiles_json TEXT NOT NULL,           -- comp: vs misma competición · agg: vs pool de todas
  updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_players_name ON players (player_name);
CREATE INDEX IF NOT EXISTS idx_players_group ON players (position_group);
CREATE INDEX IF NOT EXISTS idx_players_nat ON players (nationality);
CREATE INDEX IF NOT EXISTS idx_players_kind ON players (kind);
CREATE INDEX IF NOT EXISTS idx_players_key ON players (player_key);

-- Informes generados (cache + URL pública compartible /r/:id).
CREATE TABLE IF NOT EXISTS reports (
  id           TEXT PRIMARY KEY,            -- uuid, también la URL pública
  player_id    TEXT NOT NULL,               -- players.id
  player_name  TEXT NOT NULL,
  locale       TEXT NOT NULL,               -- 'es' | 'en'
  content      TEXT NOT NULL,               -- informe en markdown
  metrics_json TEXT,                        -- métricas/percentiles usados
  is_public    INTEGER NOT NULL DEFAULT 1,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_reports_player ON reports (player_id, locale);

-- Señal de uso real (para decidir si/cuándo conviene monetizar). Liviano a
-- propósito: un evento por acción clave, sin datos personales.
CREATE TABLE IF NOT EXISTS events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  type       TEXT NOT NULL,             -- 'search' | 'profile_view' | 'report_new' | 'report_cached'
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_events_type_date ON events (type, created_at);
