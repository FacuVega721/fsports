/**
 * Tipos normalizados de FSports.
 *
 * Esta es la "moneda común" de toda la app: los tres modos de datos
 * (manual, api, demo) convierten su fuente a ESTOS tipos, y los
 * componentes de UI solo conocen estos tipos. Nunca consumen la forma
 * cruda de una API ni del manifest.
 */

export type DataMode = 'manual' | 'api' | 'demo';

export type EstadoPartido = 'programado' | 'en_vivo' | 'entretiempo' | 'finalizado';

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
  /** Ciudad sede del partido (vacío si no hay dato) */
  ciudad: string;
  /** Canales de TV (claves; vacío si no hay dato) — ver src/data/sedes.ts */
  tv: string[];
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

/** Posición de un jugador, ya traducida al español. */
export type Posicion = 'Arquero' | 'Defensor' | 'Mediocampista' | 'Delantero' | 'Otro';

/** Un jugador del plantel. */
export interface Player {
  nombre: string;
  posicion: Posicion;
  /** Edad en años (calculada desde la fecha de nacimiento), o null si no hay dato */
  edad: number | null;
  nacionalidad: string;
}

/** Una selección con su plantel completo (jugadores + DT) para el detalle de país. */
export interface TeamFull extends Team {
  squad: Player[];
  /** Nombre del director técnico, o '' si no hay dato */
  dt: string;
}

/** Una fila de la tabla de posiciones (con stats completas estilo Promiedos). */
export interface StandingRow {
  pos: number;
  nombre: string;
  code: string;
  pj: number; // partidos jugados
  pts: number; // puntos
  g: number; // ganados
  e: number; // empatados
  p: number; // perdidos
  gf: number; // goles a favor
  gc: number; // goles en contra
  dif: number; // diferencia de gol
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

/* ─────────────── F1: calendario, resultados y equipos ─────────────── */

export type EstadoCarrera = 'finalizada' | 'en_curso' | 'proxima';

/** Una carrera del calendario de la temporada. */
export interface RaceCalendar {
  ronda: number;
  gp: string;
  /** Código ISO del país del GP, para la bandera */
  code: string;
  circuito: string;
  ciudad: string;
  /** YYYY-MM-DD en UTC-3 */
  fecha: string;
  /** HH:MM en UTC-3 */
  hora: string;
  estado: EstadoCarrera;
  esSprint: boolean;
}

export type ResultadoEstado = 'ok' | 'dnf' | 'dns' | 'dsq' | 'nc';

/** Una fila del resultado de una carrera. */
export interface RaceResultRow {
  /** Posición final, o null si no terminó/clasificó */
  pos: number | null;
  /** Texto a mostrar en la columna posición ("1", "DNF", "DNS"...) */
  posTexto: string;
  piloto: string;
  /** Código de 3 letras del piloto (VER, HAM...) */
  code: string;
  equipo: string;
  /** Posición de largada */
  grilla: number | null;
  vueltas: number | null;
  /** Tiempo, diferencia o motivo ("2:23:31.243", "+6.271", "Abandono") */
  tiempo: string;
  estado: ResultadoEstado;
  puntos: number;
}

/** Detalle completo de una carrera (pole, podio, clasificación, vuelta rápida). */
export interface RaceFull {
  ronda: number;
  gp: string;
  code: string;
  circuito: string;
  ciudad: string;
  fecha: string;
  pole: { piloto: string; equipo: string; tiempo: string } | null;
  vueltaRapida: { piloto: string; tiempo: string } | null;
  resultados: RaceResultRow[];
  /** Clasificación de la carrera Sprint (solo en fines de semana con Sprint), o null */
  sprint: RaceResultRow[] | null;
}

/** Un piloto dentro del detalle de un equipo. */
export interface F1DriverInfo {
  nombre: string;
  /** Código de 3 letras (VER) */
  code: string;
  numero: string;
  /** Código ISO de 2 letras de la nacionalidad, para la bandera */
  nacionalidadCode: string;
  nacionalidad: string;
  edad: number | null;
  puntos: number;
}

/** Un equipo (escudería) con su detalle. */
export interface F1Team {
  id: string;
  nombre: string;
  /** Código ISO de 2 letras de la nacionalidad del equipo */
  nacionalidadCode: string;
  nacionalidad: string;
  pos: number;
  puntos: number;
  wikipedia: string;
  pilotos: F1DriverInfo[];
  /** Reseña breve editable (la API no la provee); '' si no hay */
  historial: string;
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
  getTeams(): Promise<TeamFull[]>;
  getF1Last(): Promise<LastRace | null>;
  getF1Next(): Promise<NextRace | null>;
  getF1Drivers(): Promise<DriverStanding[]>;
  getF1Constructors(): Promise<ConstructorStanding[]>;
  /** Calendario completo de la temporada */
  getF1Calendar(): Promise<RaceCalendar[]>;
  /** Detalle de una carrera por ronda (resultados, pole, etc.) */
  getF1Race(ronda: number): Promise<RaceFull | null>;
  /** Equipos con su detalle (pilotos, puntos, etc.) */
  getF1Teams(): Promise<F1Team[]>;
}
