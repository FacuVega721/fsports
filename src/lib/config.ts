import type { DataMode } from './types';

/**
 * Configuración central de FSports.
 *
 * DATA_MODE elige de dónde salen los datos:
 *   'manual' -> src/data/manifest.ts (editable a mano, sin internet) — DEFAULT
 *   'api'    -> football-data.org + Jolpica-F1 (requiere token de fútbol)
 *   'demo'   -> datos de ejemplo abundantes para desarrollo y capturas
 *
 * Se puede definir acá o vía la variable de entorno VITE_DATA_MODE en .env.local.
 */
const envMode = import.meta.env.VITE_DATA_MODE;

export const DATA_MODE: DataMode =
  envMode === 'api' || envMode === 'demo' || envMode === 'manual' ? envMode : 'manual';

/** Token de football-data.org (solo para DATA_MODE='api'). */
export const FOOTBALL_DATA_TOKEN: string = import.meta.env.VITE_FOOTBALL_DATA_TOKEN ?? '';

/**
 * URL base de la API de fútbol. Parametrizada para poder apuntar a un proxy
 * (Cloudflare Worker) si football-data.org bloquea CORS desde el navegador.
 */
export const FOOTBALL_API_BASE: string =
  import.meta.env.VITE_FOOTBALL_API_BASE ?? 'https://api.football-data.org/v4';

/** API de F1 (Jolpica, sucesora de Ergast). Sin token, permite CORS. */
export const F1_API_BASE = 'https://api.jolpi.ca/ergast/f1';
