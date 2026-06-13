import type { StandingGroup } from '../types';
import type { RankingTerceros, TerceroRanking } from './types';

/**
 * Rankea los 12 terceros puestos (mismo criterio que las tablas de grupo, sin
 * head-to-head porque son de grupos distintos) y devuelve los 8 mejores
 * (clasifican a 16avos) y los 4 que quedan afuera.
 */
export function mejoresTerceros(standings: StandingGroup[]): RankingTerceros {
  const terceros: TerceroRanking[] = standings
    .map((g) => {
      const eq = g.equipos[2];
      return eq ? { ...eq, grupo: g.grupo } : null;
    })
    .filter((x): x is TerceroRanking => x !== null);

  const ordenados = [...terceros].sort(
    (a, b) => b.pts - a.pts || b.dif - a.dif || b.gf - a.gf || a.nombre.localeCompare(b.nombre),
  );

  return {
    clasificados: ordenados.slice(0, 8).map((eq, i) => ({ ...eq, pos: i + 1 })),
    descartados: ordenados.slice(8).map((eq, i) => ({ ...eq, pos: i + 9 })),
  };
}
