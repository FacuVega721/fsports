import type { Match, StandingGroup } from '../types';
import type { PartidoSim, RankingTerceros } from './types';

/**
 * Cruces de 16avos del Mundial 2026 (partidos 73 a 88 del fixture oficial):
 * 12 directos (1° o 2° de grupo) + 8 con el mejor de los terceros, según los
 * "pools" de grupos posibles publicados por FIFA para cada cruce.
 *
 * La tabla oficial de asignación final de los 8 mejores terceros a estos
 * pools (495 combinaciones, una por cada conjunto de grupos que aporta
 * terceros) no está transcripta acá. En su lugar, `asignarTerceros` resuelve
 * una asignación propia válida (cada tercero clasificado entra en un pool
 * que lo admite), que puede no coincidir con la tabla oficial en casos
 * ambiguos — se indica como aproximación en la UI.
 */
type SlotDirecto = { tipo: 'directo'; pos: 0 | 1; grupo: string };
type SlotTercero = { tipo: 'tercero'; pool: string[] };
type Slot = SlotDirecto | SlotTercero;

const directo = (pos: 0 | 1, grupo: string): SlotDirecto => ({ tipo: 'directo', pos, grupo });
const tercero = (...pool: string[]): SlotTercero => ({ tipo: 'tercero', pool });

/** Los 16 cruces de 16avos, en el orden de los partidos 73 a 88. */
export const CRUCES_R32: Array<{ local: Slot; visitante: Slot }> = [
  { local: directo(1, 'A'), visitante: directo(1, 'B') }, // 73: 2A vs 2B
  { local: directo(0, 'E'), visitante: tercero('A', 'B', 'C', 'D', 'F') }, // 74: 1E vs 3°(A/B/C/D/F)
  { local: directo(0, 'F'), visitante: directo(1, 'C') }, // 75: 1F vs 2C
  { local: directo(0, 'C'), visitante: directo(1, 'F') }, // 76: 1C vs 2F
  { local: directo(0, 'I'), visitante: tercero('C', 'D', 'F', 'G', 'H') }, // 77: 1I vs 3°(C/D/F/G/H)
  { local: directo(1, 'E'), visitante: directo(1, 'I') }, // 78: 2E vs 2I
  { local: directo(0, 'A'), visitante: tercero('C', 'E', 'F', 'H', 'I') }, // 79: 1A vs 3°(C/E/F/H/I)
  { local: directo(0, 'L'), visitante: tercero('E', 'H', 'I', 'J', 'K') }, // 80: 1L vs 3°(E/H/I/J/K)
  { local: directo(0, 'D'), visitante: tercero('B', 'E', 'F', 'I', 'J') }, // 81: 1D vs 3°(B/E/F/I/J)
  { local: directo(0, 'G'), visitante: tercero('A', 'E', 'H', 'I', 'J') }, // 82: 1G vs 3°(A/E/H/I/J)
  { local: directo(1, 'K'), visitante: directo(1, 'L') }, // 83: 2K vs 2L
  { local: directo(0, 'H'), visitante: directo(1, 'J') }, // 84: 1H vs 2J
  { local: directo(0, 'B'), visitante: tercero('E', 'F', 'G', 'I', 'J') }, // 85: 1B vs 3°(E/F/G/I/J)
  { local: directo(0, 'J'), visitante: directo(1, 'H') }, // 86: 1J vs 2H
  { local: directo(0, 'K'), visitante: tercero('D', 'E', 'I', 'J', 'L') }, // 87: 1K vs 3°(D/E/I/J/L)
  { local: directo(1, 'D'), visitante: directo(1, 'G') }, // 88: 2D vs 2G
];

/** Índices (dentro de CRUCES_R32) de los cruces que reciben un "mejor tercero". */
const SLOTS_TERCERO = [1, 4, 6, 7, 8, 9, 12, 14];

/**
 * Asigna cada grupo clasificado (por su mejor tercero) a uno de los 8 slots
 * de "mejor tercero", respetando el pool de cada slot. Backtracking simple:
 * con 8 elementos y pools de 5 grupos cada uno, siempre hay solución.
 */
function asignarTerceros(pools: string[][], grupos: string[]): (string | null)[] {
  const asignacion: (string | null)[] = new Array(pools.length).fill(null);
  const usados = new Set<string>();

  function backtrack(i: number): boolean {
    if (i === pools.length) return true;
    for (const g of grupos) {
      if (usados.has(g) || !pools[i].includes(g)) continue;
      usados.add(g);
      asignacion[i] = g;
      if (backtrack(i + 1)) return true;
      usados.delete(g);
      asignacion[i] = null;
    }
    return false;
  }

  backtrack(0);
  return asignacion;
}

function ordenarPorFecha(a: Match, b: Match) {
  return a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora);
}

/** Arma los 16 partidos de 16avos a partir de las tablas de grupos y los mejores terceros. */
export function armarR32(
  matches: Match[],
  standings: StandingGroup[],
  terceros: RankingTerceros,
): PartidoSim[] {
  const shells = matches.filter((m) => m.fase === 'dieciseisavos').sort(ordenarPorFecha);
  const porGrupo = new Map(standings.map((g) => [g.grupo, g.equipos]));

  const asignacion = asignarTerceros(
    SLOTS_TERCERO.map((i) => (CRUCES_R32[i].visitante as SlotTercero).pool),
    terceros.clasificados.map((t) => t.grupo),
  );

  function resolverSlot(slot: Slot, slotIdx: number): { nombre: string; code: string } {
    if (slot.tipo === 'directo') {
      const equipo = porGrupo.get(slot.grupo)?.[slot.pos];
      return equipo
        ? { nombre: equipo.nombre, code: equipo.code }
        : { nombre: 'Por definir', code: '' };
    }
    const grupoAsignado = asignacion[SLOTS_TERCERO.indexOf(slotIdx)];
    const equipo = terceros.clasificados.find((t) => t.grupo === grupoAsignado);
    return equipo ? { nombre: equipo.nombre, code: equipo.code } : { nombre: 'Por definir', code: '' };
  }

  return CRUCES_R32.map((cruce, i) => {
    const shell = shells[i];
    const local = resolverSlot(cruce.local, i);
    const visitante = resolverSlot(cruce.visitante, i);
    return {
      id: shell?.id ?? `r32-${i}`,
      fase: 'dieciseisavos',
      local: local.nombre,
      localCode: local.code,
      visitante: visitante.nombre,
      visitanteCode: visitante.code,
      golesLocal: null,
      golesVisitante: null,
      penalesLocal: null,
      penalesVisitante: null,
      ganador: null,
      definido: true,
      real: false,
    };
  });
}
