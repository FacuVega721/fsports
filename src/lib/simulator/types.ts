/** Tipos propios del simulador de resultados del Mundial. No se mezclan con lib/types.ts. */

import type { FasePartido, StandingRow } from '../types';

/** Resultado hipotético que el usuario ingresó para un partido. */
export interface ResultadoSim {
  golesLocal: number;
  golesVisitante: number;
  /** Penales, solo si el partido de eliminatoria terminó empatado. */
  penalesLocal?: number;
  penalesVisitante?: number;
}

/** Resultados hipotéticos por id de partido. */
export type OverridesSim = Record<string, ResultadoSim>;

/** Un tercer puesto, con su grupo de origen, para el ranking de mejores terceros. */
export interface TerceroRanking extends StandingRow {
  grupo: string;
}

/** Ranking de los 12 terceros: los 8 que clasifican y los 4 que quedan afuera. */
export interface RankingTerceros {
  clasificados: TerceroRanking[];
  descartados: TerceroRanking[];
}

/** Vista mínima de un partido para los inputs del simulador (grupos o eliminatoria). */
export interface MatchSimVista {
  id: string;
  local: string;
  localCode: string;
  visitante: string;
  visitanteCode: string;
  golesLocal: number | null;
  golesVisitante: number | null;
  /** Resultado real (ya jugado), no editable. */
  real: boolean;
  /** Si ambos equipos ya están determinados (no "Por definir"). */
  definido: boolean;
  /** Ganador (solo eliminatoria); ausente/null en partidos de grupos o sin definir. */
  ganador?: 'local' | 'visitante' | null;
}

/** Un partido de eliminatoria simulado, encadenado ronda a ronda a partir de 16avos. */
export interface PartidoSim extends MatchSimVista {
  fase: FasePartido;
  penalesLocal: number | null;
  penalesVisitante: number | null;
  ganador: 'local' | 'visitante' | null;
}

/** El cuadro completo de eliminatoria simulado. */
export interface RondasSim {
  dieciseisavos: PartidoSim[];
  octavos: PartidoSim[];
  cuartos: PartidoSim[];
  semifinal: PartidoSim[];
  tercer_puesto: PartidoSim[];
  final: PartidoSim[];
}
