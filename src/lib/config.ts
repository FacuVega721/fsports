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

/**
 * URL base de la API de fútbol. Por defecto apunta al proxy de mismo origen
 * (/api/football), que evita el bloqueo de CORS de football-data.org y agrega
 * el token del lado del servidor (dev server de Vite o Worker en producción).
 * El token NO se usa en el cliente.
 */
export const FOOTBALL_API_BASE: string =
  import.meta.env.VITE_FOOTBALL_API_BASE ?? '/api/football';

/** API de F1 (Jolpica, sucesora de Ergast). Sin token, permite CORS. */
export const F1_API_BASE = 'https://api.jolpi.ca/ergast/f1';
