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

/** Extrae resultados reales de partidos de eliminatoria para usarlos como overrides en la proyección. */
export function overridesReales(matches: Match[]): OverridesSim {
  const ov: OverridesSim = {};
  for (const m of matches) {
    if (m.fase !== 'grupos' && m.estado === 'finalizado'
        && m.golesLocal !== null && m.golesVisitante !== null) {
      ov[m.id] = { golesLocal: m.golesLocal, golesVisitante: m.golesVisitante };
    }
  }
  return ov;
}

/** Marca como real cada partido del cuadro que ya tiene resultado oficial. */
export function marcarReales(rondas: RondasSim, matches: Match[]): RondasSim {
  const jugados = new Set(
    matches
      .filter(m => m.fase !== 'grupos' && m.estado === 'finalizado')
      .map(m => m.id),
  );
  function marcar(ps: RondasSim['dieciseisavos']): RondasSim['dieciseisavos'] {
    return ps.map(p => (jugados.has(p.id) ? { ...p, real: true } : p));
  }
  return {
    dieciseisavos: marcar(rondas.dieciseisavos),
    octavos: marcar(rondas.octavos),
    cuartos: marcar(rondas.cuartos),
    semifinal: marcar(rondas.semifinal),
    final: marcar(rondas.final),
    tercer_puesto: marcar(rondas.tercer_puesto),
  };
}
