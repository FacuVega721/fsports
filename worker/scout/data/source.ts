/**
 * Interfaz común de fuente de datos (ver docs/scout/PROJECT_SPEC.md §4).
 * Permite enchufar StatsBomb (Fase 1) o API-Football (Fase 4) sin reescribir
 * el resto: el endpoint de informes solo conoce esta interfaz.
 */

export interface PlayerSummary {
  id: string;
  playerKey: string;
  name: string;
  team: string;
  position: string;
  nationality: string;
  age: number | null;
  competition: string;
  season: string;
}

/** Una muestra disponible de un jugador (histórico o una competición). */
export interface PlayerSample {
  id: string;
  kind: 'comp' | 'agg';
  competition: string;
  season: string;
  minutes: number;
  matches: number;
}

export interface SearchFilters {
  positionGroup?: string; // GK | DEF | MID | FWD
  nationality?: string;
}

export interface PlayerProfile extends PlayerSummary {
  kind: 'comp' | 'agg';
  positionGroup: string;
  minutes: number;
  matches: number;
  /** Métricas por 90' { clave: valor }. */
  per90: Record<string, number>;
  /** Percentil 0-100 vs su grupo de posición { clave: pct }. */
  percentiles: Record<string, number>;
}

export interface DataSource {
  searchPlayers(query: string, filters?: SearchFilters): Promise<PlayerSummary[]>;
  getPlayerProfile(id: string): Promise<PlayerProfile | null>;
  /** Muestras disponibles de un jugador (histórico + cada competición). */
  listSamples(playerKey: string): Promise<PlayerSample[]>;
  /** Valores disponibles para poblar los filtros (nacionalidades presentes). */
  listNationalities(): Promise<string[]>;
}
