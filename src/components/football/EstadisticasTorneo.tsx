import { useMemo } from 'react';
import type { Match, StandingGroup, TeamFull } from '../../lib/types';
import { Flag } from '../ui/Flag';
import styles from './EstadisticasTorneo.module.css';

type VistaEstadisticas = 'resumen' | 'ranking' | 'planteles';

interface Props {
  matches: Match[];
  standings: StandingGroup[];
  teams: TeamFull[];
  vista: VistaEstadisticas;
}

/* ── Sub-componente: tabla de ranking compacta ── */
interface FilaRanking { nombre: string; code: string; val: number }

function MiniTabla({ titulo, col, filas, verde }: {
  titulo: string;
  col: string;
  filas: FilaRanking[];
  verde?: boolean;
}) {
  return (
    <div>
      <p className={styles.miniTitulo}>{titulo}</p>
      <div className={styles.scroll}>
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th className={styles.thPos} scope="col">#</th>
              <th className={styles.thEq} scope="col">Selección</th>
              <th className={styles.thStat} scope="col">{col}</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f, i) => (
              <tr key={f.nombre}>
                <td className={styles.pos}>{i + 1}</td>
                <td>
                  <span className={styles.equipoFila}>
                    <Flag code={f.code} title={f.nombre} />
                    <span>{f.nombre}</span>
                  </span>
                </td>
                <td className={verde ? styles.numVerde : styles.num}>{f.val}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Componente principal ── */
export function EstadisticasTorneo({ matches, standings, teams, vista }: Props) {
  /* Partidos ya disputados con marcador válido */
  const finalizados = useMemo(
    () => matches.filter(m => m.estado === 'finalizado' && m.golesLocal !== null && m.golesVisitante !== null),
    [matches]
  );

  /* 1 — Resumen del torneo */
  const resumen = useMemo(() => {
    if (finalizados.length === 0) return null;
    const golesTotal = finalizados.reduce((s, m) => s + (m.golesLocal ?? 0) + (m.golesVisitante ?? 0), 0);
    const goleada = finalizados.reduce((b, m) =>
      Math.abs((m.golesLocal ?? 0) - (m.golesVisitante ?? 0)) >
      Math.abs((b.golesLocal ?? 0) - (b.golesVisitante ?? 0)) ? m : b
    );
    const masGoles = finalizados.reduce((b, m) =>
      (m.golesLocal ?? 0) + (m.golesVisitante ?? 0) >
      (b.golesLocal ?? 0) + (b.golesVisitante ?? 0) ? m : b
    );
    let porteriasEnCero = 0;
    for (const m of finalizados) {
      if ((m.golesVisitante ?? 1) === 0) porteriasEnCero++;
      if ((m.golesLocal ?? 1) === 0) porteriasEnCero++;
    }
    return {
      golesTotal,
      promedio: golesTotal / finalizados.length,
      jugados: finalizados.length,
      total: matches.length,
      porteriasEnCero,
      goleada,
      masGoles,
    };
  }, [finalizados, matches.length]);

  /* 2 — Ranking de selecciones */
  const ranking = useMemo(() => {
    const todas = standings.flatMap(g => g.equipos).filter(e => e.pj > 0);
    if (todas.length === 0) return null;

    const cs = new Map<string, number>();
    for (const m of finalizados) {
      if ((m.golesVisitante ?? 1) === 0) cs.set(m.local, (cs.get(m.local) ?? 0) + 1);
      if ((m.golesLocal ?? 1) === 0) cs.set(m.visitante, (cs.get(m.visitante) ?? 0) + 1);
    }

    const ataques = [...todas]
      .sort((a, b) => b.gf - a.gf || a.gc - b.gc)
      .slice(0, 8)
      .map(e => ({ nombre: e.nombre, code: e.code, val: e.gf }));

    const defensas = [...todas]
      .sort((a, b) => a.gc - b.gc || b.gf - a.gf)
      .slice(0, 8)
      .map(e => ({ nombre: e.nombre, code: e.code, val: e.gc }));

    const porterias = [...todas]
      .map(e => ({ nombre: e.nombre, code: e.code, val: cs.get(e.nombre) ?? 0 }))
      .filter(e => e.val > 0)
      .sort((a, b) => b.val - a.val)
      .slice(0, 8);

    return { ataques, defensas, porterias };
  }, [standings, finalizados]);

  /* 3 — Estadísticas de planteles */
  const planteles = useMemo(() => {
    const porEquipo = teams
      .map(t => {
        const edades = t.squad.map(p => p.edad).filter((e): e is number => e !== null);
        const media = edades.length ? edades.reduce((a, b) => a + b, 0) / edades.length : 0;
        return { nombre: t.nombre, code: t.code, grupo: t.grupo, media, n: edades.length };
      })
      .filter(t => t.n >= 10)
      .sort((a, b) => a.media - b.media);

    const todosJug = teams.flatMap(t =>
      t.squad
        .filter(p => p.edad !== null)
        .map(p => ({ nombre: p.nombre, edad: p.edad as number, equipo: t.nombre, code: t.code }))
    );
    const masJoven    = todosJug.length ? todosJug.reduce((b, p) => p.edad < b.edad ? p : b) : null;
    const masVeterano = todosJug.length ? todosJug.reduce((b, p) => p.edad > b.edad ? p : b) : null;

    return { porEquipo, masJoven, masVeterano };
  }, [teams]);

  if (vista === 'resumen' && !resumen) return null;
  if (vista === 'ranking' && !ranking) return null;
  if (vista === 'planteles' && planteles.porEquipo.length === 0) return null;

  return (
    <div className={styles.raiz}>

      {/* ── 1. Resumen del torneo ── */}
      {vista === 'resumen' && resumen && (
        <section className={styles.seccion}>
          <header className={`${styles.header} texture`}>
            <span className="kicker">Resumen del torneo</span>
          </header>
          <div className={styles.cuerpo}>
            <div className={styles.statsGrid}>
              <div className={styles.stat}>
                <span className={styles.statNum}>{resumen.golesTotal}</span>
                <span className={styles.statLabel}>Goles totales</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNum}>{resumen.promedio.toFixed(2)}</span>
                <span className={styles.statLabel}>Por partido</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNum}>
                  {resumen.jugados}
                  <span className={styles.statSub}> / {resumen.total}</span>
                </span>
                <span className={styles.statLabel}>Partidos jugados</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNum}>{resumen.porteriasEnCero}</span>
                <span className={styles.statLabel}>Vallas invictas</span>
              </div>
            </div>
            <div className={styles.highlights}>
              <div className={styles.highlight}>
                <span className={styles.hlTitulo}>Goleada más grande</span>
                <div className={styles.hlPartido}>
                  <span className={styles.hlTeam}>
                    <Flag code={resumen.goleada.localCode} title={resumen.goleada.local} />
                    {resumen.goleada.local}
                  </span>
                  <span className={styles.hlScore}>
                    {resumen.goleada.golesLocal}–{resumen.goleada.golesVisitante}
                  </span>
                  <span className={styles.hlTeam}>
                    <Flag code={resumen.goleada.visitanteCode} title={resumen.goleada.visitante} />
                    {resumen.goleada.visitante}
                  </span>
                </div>
              </div>
              <div className={styles.highlight}>
                <span className={styles.hlTitulo}>Más goles en un partido</span>
                <div className={styles.hlPartido}>
                  <span className={styles.hlTeam}>
                    <Flag code={resumen.masGoles.localCode} title={resumen.masGoles.local} />
                    {resumen.masGoles.local}
                  </span>
                  <span className={styles.hlScore}>
                    {resumen.masGoles.golesLocal}–{resumen.masGoles.golesVisitante}
                  </span>
                  <span className={styles.hlTeam}>
                    <Flag code={resumen.masGoles.visitanteCode} title={resumen.masGoles.visitante} />
                    {resumen.masGoles.visitante}
                  </span>
                </div>
                <span className={styles.hlSub}>
                  {(resumen.masGoles.golesLocal ?? 0) + (resumen.masGoles.golesVisitante ?? 0)} goles en total
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 2. Ranking de selecciones ── */}
      {vista === 'ranking' && ranking && (
        <section className={styles.seccion}>
          <header className={`${styles.header} texture`}>
            <span className="kicker">Ranking de selecciones</span>
          </header>
          <div className={styles.cuerpo}>
            <div className={styles.rankingGrid}>
              <MiniTabla titulo="Mejores ataques" col="GF" filas={ranking.ataques} />
              <MiniTabla titulo="Mejores defensas" col="GC" filas={ranking.defensas} verde />
              {ranking.porterias.length > 0 && (
                <MiniTabla titulo="Vallas invictas" col="CS" filas={ranking.porterias} verde />
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── 3. Estadísticas de planteles ── */}
      {vista === 'planteles' && planteles.porEquipo.length > 0 && (
        <section className={styles.seccion}>
          <header className={`${styles.header} texture`}>
            <span className="kicker">Estadísticas de planteles</span>
          </header>
          <div className={styles.cuerpo}>
            <div className={styles.highlights}>
              {planteles.masJoven && (
                <div className={styles.highlight}>
                  <span className={styles.hlTitulo}>Jugador más joven</span>
                  <span className={styles.hlTeam}>
                    <Flag code={planteles.masJoven.code} title={planteles.masJoven.equipo} />
                    <strong>{planteles.masJoven.nombre}</strong>
                  </span>
                  <span className={styles.hlSub}>
                    {planteles.masJoven.edad} años · {planteles.masJoven.equipo}
                  </span>
                </div>
              )}
              {planteles.masVeterano && (
                <div className={styles.highlight}>
                  <span className={styles.hlTitulo}>Jugador más veterano</span>
                  <span className={styles.hlTeam}>
                    <Flag code={planteles.masVeterano.code} title={planteles.masVeterano.equipo} />
                    <strong>{planteles.masVeterano.nombre}</strong>
                  </span>
                  <span className={styles.hlSub}>
                    {planteles.masVeterano.edad} años · {planteles.masVeterano.equipo}
                  </span>
                </div>
              )}
            </div>
            <div className={styles.scroll}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th className={styles.thPos} scope="col">#</th>
                    <th className={styles.thEq} scope="col">Selección</th>
                    <th className={styles.thStat} scope="col">Grupo</th>
                    <th className={styles.thStat} scope="col">Edad prom.</th>
                  </tr>
                </thead>
                <tbody>
                  {planteles.porEquipo.map((t, i) => (
                    <tr key={t.nombre}>
                      <td className={styles.pos}>{i + 1}</td>
                      <td>
                        <span className={styles.equipoFila}>
                          <Flag code={t.code} title={t.nombre} />
                          <span>{t.nombre}</span>
                        </span>
                      </td>
                      <td className={styles.centro}>{t.grupo}</td>
                      <td className={styles.num}>{t.media.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
