/**
 * Tipos normalizados de FSports.
 *
 * Esta es la "moneda común" de toda la app: los tres modos de datos
 * (manual, api, demo) convierten su fuente a ESTOS tipos, y los
 * componentes de UI solo conocen estos tipos. Nunca consumen la forma
 * cruda de una API ni del manifest.
 */

export type DataMode = 'manual' | 'api' | 'demo';

export type EstadoPartido = 'programado' | 'en_vivo' | 'finalizado';

/**
 * Fase del torneo. 'grupos' es la fase de grupos; el resto son rondas
 * eliminatorias del Mundial 2026 (que arranca en dieciseisavos por tener
 * 48 selecciones).
 */
export type FasePartido =
  | 'grupos'
  | 'dieciseisavos' // 32 equipos
  | 'octavos' // 16 equipos
  | 'cuartos' // 8 equipos
  | 'semifinal' // 4 equipos
  | 'tercer_puesto'
  | 'final';

/** Un partido de fútbol, ya normalizado y con horario en UTC-3 (Argentina). */
export interface Match {
  id: string;
  /** Fecha en formato YYYY-MM-DD, ya en UTC-3 */
  fecha: string;
  /** Hora en formato HH:MM, ya en UTC-3 */
  hora: string;
  estado: EstadoPartido;
  local: string;
  /** Código ISO de 2 letras del país (ar, br, mx...) para la bandera */
  localCode: string;
  golesLocal: number | null;
  visitante: string;
  visitanteCode: string;
  golesVisitante: number | null;
  /** Grupo del Mundial ("A", "B"...) o vacío si no aplica */
  grupo: string;
  /** Fase del torneo (grupos por defecto, o ronda eliminatoria) */
  fase: FasePartido;
  estadio: string;
  /** Minuto de juego, solo si está en vivo */
  minuto: number | null;
}

/** Una selección participante (para la sección PAÍSES). */
export interface Team {
  nombre: string;
  /** Código ISO de 2 letras (o subdivisión: gb-eng) para la bandera */
  code: string;
  /** Grupo al que pertenece ("A", "B"...) */
  grupo: string;
}

/** Una fila de la tabla de posiciones. */
export interface StandingRow {
  pos: number;
  nombre: string;
  code: string;
  pj: number;
  pts: number;
}

/** Tabla de posiciones de un grupo. */
export interface StandingGroup {
  grupo: string;
  equipos: StandingRow[];
}

/** Un resultado individual de una carrera de F1. */
export interface RaceResult {
  pos: number;
  piloto: string;
  equipo: string;
  /** Tiempo de carrera o diferencia ("1:33:24.567", "+5.123", "+1 vuelta") */
  tiempo: string;
}

/** La última carrera disputada, con todos sus resultados (el podio son los primeros 3). */
export interface LastRace {
  gp: string;
  /** Código ISO del país del GP, para la bandera */
  code: string;
  circuito: string;
  resultados: RaceResult[];
}

/** La próxima carrera del calendario, con horario en UTC-3. */
export interface NextRace {
  gp: string;
  code: string;
  circuito: string;
  /** YYYY-MM-DD en UTC-3 */
  fecha: string;
  /** HH:MM en UTC-3 */
  hora: string;
}

/** Una fila del campeonato de pilotos. */
export interface DriverStanding {
  pos: number;
  nombre: string;
  pts: number;
  equipo: string;
}

/** Una fila del campeonato de constructores. */
export interface ConstructorStanding {
  pos: number;
  nombre: string;
  pts: number;
}

/**
 * Contrato que cumplen los tres modos de datos.
 * Cambiar DATA_MODE intercambia la implementación, nunca los tipos.
 */
export interface DataSource {
  /** Nombre de la competición de fútbol (para el banner) */
  futbolTitulo: string;
  /** Temporada de F1 (para el banner) */
  f1Temporada: string;
  getMatches(): Promise<Match[]>;
  getStandings(): Promise<StandingGroup[]>;
  getF1Last(): Promise<LastRace | null>;
  getF1Next(): Promise<NextRace | null>;
  getF1Drivers(): Promise<DriverStanding[]>;
  getF1Constructors(): Promise<ConstructorStanding[]>;
}
