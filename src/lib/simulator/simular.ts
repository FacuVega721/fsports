import type { Match, StandingGroup } from '../types';
import { CONEXIONES, resolverResultado, resolverRonda } from './bracket';
import { armarR32 } from './sorteoR32';
import { calcularStandings } from './standings';
import { mejoresTerceros } from './terceros';
import type { OverridesSim, RankingTerceros, RondasSim } from './types';

export interface SimulacionResultado {
  standings: StandingGroup[];
  terceros: RankingTerceros;
  rondas: RondasSim;
}

/** Orquesta la simulación completa: tablas → mejores terceros → 16avos → ... → final. */
export function simularTorneo(matches: Match[], overrides: OverridesSim): SimulacionResultado {
  const standings = calcularStandings(matches, overrides);
  const terceros = mejoresTerceros(standings);

  const dieciseisavos = armarR32(matches, standings, terceros).map((p) => resolverResultado(p, overrides));
  const octavos = resolverRonda(dieciseisavos, 'octavos', CONEXIONES.octavos, matches, overrides);
  const cuartos = resolverRonda(octavos, 'cuartos', CONEXIONES.cuartos, matches, overrides);
  const semifinal = resolverRonda(cuartos, 'semifinal', CONEXIONES.semifinal, matches, overrides);
  const final = resolverRonda(semifinal, 'final', CONEXIONES.final, matches, overrides);
  const tercer_puesto = resolverRonda(
    semifinal,
    'tercer_puesto',
    CONEXIONES.tercer_puesto,
    matches,
    overrides,
    'perdedor',
  );

  return { standings, terceros, rondas: { dieciseisavos, octavos, cuartos, semifinal, final, tercer_puesto } };
}
