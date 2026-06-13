import type { FasePartido, Match } from '../types';
import type { OverridesSim, PartidoSim } from './types';

/** Pares de índices de la ronda anterior que se enfrentan en cada ronda siguiente. */
export const CONEXIONES: Record<
  'octavos' | 'cuartos' | 'semifinal' | 'final' | 'tercer_puesto',
  Array<[number, number]>
> = {
  octavos: [
    [1, 4],
    [0, 2],
    [3, 5],
    [6, 7],
    [10, 11],
    [8, 9],
    [13, 15],
    [12, 14],
  ],
  cuartos: [
    [0, 1],
    [2, 3],
    [4, 5],
    [6, 7],
  ],
  semifinal: [
    [0, 1],
    [2, 3],
  ],
  final: [[0, 1]],
  tercer_puesto: [[0, 1]],
};

function ordenarPorFecha(a: Match, b: Match) {
  return a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora);
}

/** Aplica el resultado (override) a un partido simulado y determina el ganador. */
export function resolverResultado(p: PartidoSim, overrides: OverridesSim): PartidoSim {
  const ov = overrides[p.id];
  const golesLocal = ov?.golesLocal ?? p.golesLocal;
  const golesVisitante = ov?.golesVisitante ?? p.golesVisitante;
  const penalesLocal = ov?.penalesLocal ?? null;
  const penalesVisitante = ov?.penalesVisitante ?? null;

  let ganador: 'local' | 'visitante' | null = null;
  if (golesLocal !== null && golesVisitante !== null) {
    if (golesLocal > golesVisitante) ganador = 'local';
    else if (golesVisitante > golesLocal) ganador = 'visitante';
    else if (penalesLocal !== null && penalesVisitante !== null && penalesLocal !== penalesVisitante) {
      ganador = penalesLocal > penalesVisitante ? 'local' : 'visitante';
    }
  }

  return { ...p, golesLocal, golesVisitante, penalesLocal, penalesVisitante, ganador };
}

/** Equipo ganador (o perdedor) de un partido ya resuelto, o null si todavía no se sabe. */
function lado(p: PartidoSim, quien: 'ganador' | 'perdedor'): { nombre: string; code: string } | null {
  if (!p.ganador) return null;
  const localGana = p.ganador === 'local';
  const usarLocal = quien === 'ganador' ? localGana : !localGana;
  return usarLocal
    ? { nombre: p.local, code: p.localCode }
    : { nombre: p.visitante, code: p.visitanteCode };
}

/**
 * Resuelve una ronda eliminatoria a partir de los ganadores (o perdedores,
 * para el partido por el 3er puesto) de la ronda anterior.
 */
export function resolverRonda(
  previa: PartidoSim[],
  fase: FasePartido,
  pares: Array<[number, number]>,
  matches: Match[],
  overrides: OverridesSim,
  quien: 'ganador' | 'perdedor' = 'ganador',
): PartidoSim[] {
  const shells = matches.filter((m) => m.fase === fase).sort(ordenarPorFecha);

  return pares.map(([i, j], idx) => {
    const shell = shells[idx];
    const local = lado(previa[i], quien);
    const visitante = lado(previa[j], quien);
    const base: PartidoSim = {
      id: shell?.id ?? `${fase}-${idx}`,
      fase,
      local: local?.nombre ?? 'Por definir',
      localCode: local?.code ?? '',
      visitante: visitante?.nombre ?? 'Por definir',
      visitanteCode: visitante?.code ?? '',
      golesLocal: null,
      golesVisitante: null,
      penalesLocal: null,
      penalesVisitante: null,
      ganador: null,
      definido: local !== null && visitante !== null,
      real: false,
    };
    return base.definido ? resolverResultado(base, overrides) : base;
  });
}
