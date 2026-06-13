import type { Match, StandingGroup } from '../types';
import type { OverridesSim } from './types';

interface Acumulado {
  nombre: string;
  code: string;
  pj: number;
  pts: number;
  g: number;
  e: number;
  p: number;
  gf: number;
  gc: number;
}

/** Resultado a usar para un partido: el override del usuario, o el real si ya se jugó. */
function resultadoEfectivo(
  m: Match,
  overrides: OverridesSim,
): { golesLocal: number; golesVisitante: number } | null {
  const ov = overrides[m.id];
  if (ov) return ov;
  if (m.golesLocal !== null && m.golesVisitante !== null) {
    return { golesLocal: m.golesLocal, golesVisitante: m.golesVisitante };
  }
  return null;
}

/**
 * Orden FIFA: puntos, diferencia de gol, goles a favor y, si quedan exactamente
 * dos equipos empatados, el resultado entre ellos. No se modela fair play ni
 * sorteo (no hay datos de tarjetas): el desempate final es alfabético.
 */
function ordenarEquipos(equipos: Acumulado[], matches: Match[], overrides: OverridesSim): Acumulado[] {
  const comparar = (a: Acumulado, b: Acumulado) =>
    b.pts - a.pts || b.gf - b.gc - (a.gf - a.gc) || b.gf - a.gf;

  const ordenados = [...equipos].sort(comparar);
  const resultado: Acumulado[] = [];
  let i = 0;
  while (i < ordenados.length) {
    let j = i + 1;
    while (j < ordenados.length && comparar(ordenados[i], ordenados[j]) === 0) j++;
    const bloque = ordenados.slice(i, j);
    if (bloque.length === 2) {
      const [a, b] = bloque;
      const enfrentamiento = matches.find(
        (m) =>
          m.fase === 'grupos' &&
          ((m.local === a.nombre && m.visitante === b.nombre) ||
            (m.local === b.nombre && m.visitante === a.nombre)),
      );
      const res = enfrentamiento ? resultadoEfectivo(enfrentamiento, overrides) : null;
      if (res) {
        const aEsLocal = enfrentamiento!.local === a.nombre;
        const golesA = aEsLocal ? res.golesLocal : res.golesVisitante;
        const golesB = aEsLocal ? res.golesVisitante : res.golesLocal;
        if (golesA > golesB) resultado.push(a, b);
        else if (golesB > golesA) resultado.push(b, a);
        else resultado.push(...bloque.sort((x, y) => x.nombre.localeCompare(y.nombre)));
      } else {
        resultado.push(...bloque.sort((x, y) => x.nombre.localeCompare(y.nombre)));
      }
    } else {
      resultado.push(...bloque.sort((x, y) => x.nombre.localeCompare(y.nombre)));
    }
    i = j;
  }
  return resultado;
}

/** Calcula las tablas de posiciones de los 12 grupos, aplicando los overrides del simulador. */
export function calcularStandings(matches: Match[], overrides: OverridesSim): StandingGroup[] {
  const grupos = new Map<string, Map<string, Acumulado>>();

  for (const m of matches) {
    if (m.fase !== 'grupos' || !m.grupo) continue;
    if (!grupos.has(m.grupo)) grupos.set(m.grupo, new Map());
    const tabla = grupos.get(m.grupo)!;
    for (const [nombre, code] of [
      [m.local, m.localCode],
      [m.visitante, m.visitanteCode],
    ] as const) {
      if (!tabla.has(nombre)) {
        tabla.set(nombre, { nombre, code, pj: 0, pts: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0 });
      }
    }

    const res = resultadoEfectivo(m, overrides);
    if (!res) continue;

    const local = tabla.get(m.local)!;
    const visitante = tabla.get(m.visitante)!;
    local.pj++;
    visitante.pj++;
    local.gf += res.golesLocal;
    local.gc += res.golesVisitante;
    visitante.gf += res.golesVisitante;
    visitante.gc += res.golesLocal;
    if (res.golesLocal > res.golesVisitante) {
      local.g++;
      local.pts += 3;
      visitante.p++;
    } else if (res.golesLocal < res.golesVisitante) {
      visitante.g++;
      visitante.pts += 3;
      local.p++;
    } else {
      local.e++;
      visitante.e++;
      local.pts += 1;
      visitante.pts += 1;
    }
  }

  const resultado: StandingGroup[] = [];
  for (const [grupo, tabla] of grupos) {
    const ordenados = ordenarEquipos(Array.from(tabla.values()), matches, overrides);
    resultado.push({
      grupo,
      equipos: ordenados.map((eq, i) => ({
        pos: i + 1,
        nombre: eq.nombre,
        code: eq.code,
        pj: eq.pj,
        pts: eq.pts,
        g: eq.g,
        e: eq.e,
        p: eq.p,
        gf: eq.gf,
        gc: eq.gc,
        dif: eq.gf - eq.gc,
      })),
    });
  }
  return resultado.sort((a, b) => a.grupo.localeCompare(b.grupo));
}
