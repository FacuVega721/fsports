import type { Match, StandingGroup } from '../../lib/types';
import type { OverridesSim, RankingTerceros, ResultadoSim } from '../../lib/simulator/types';
import { Flag } from '../ui/Flag';
import { SimuladorMatchInput } from './SimuladorMatchInput';
import { StandingsTable } from './StandingsTable';
import styles from './SimuladorGrupos.module.css';

interface SimuladorGruposProps {
  matches: Match[];
  standings: StandingGroup[];
  terceros: RankingTerceros;
  overrides: OverridesSim;
  onChange: (matchId: string, resultado: ResultadoSim | null) => void;
}

/** Tabla de los 12 terceros puestos: los 8 mejores clasifican a 16avos. */
function RankingTercerosTable({ terceros }: { terceros: RankingTerceros }) {
  const filas = [
    ...terceros.clasificados.map((t) => ({ ...t, clasifica: true })),
    ...terceros.descartados.map((t) => ({ ...t, clasifica: false })),
  ];

  return (
    <section className={styles.terceros}>
      <h3 className="kicker">Mejores terceros (8 de 12 clasifican)</h3>
      <div className={styles.scroll}>
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th className={styles.colPos} scope="col">#</th>
              <th scope="col">Equipo</th>
              <th scope="col">Grupo</th>
              <th scope="col" title="Puntos">PTS</th>
              <th scope="col" title="Diferencia de gol">DIF</th>
              <th scope="col" title="Goles a favor">GF</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((t) => (
              <tr key={`${t.grupo}-${t.nombre}`} className={t.clasifica ? styles.clasifica : styles.eliminado}>
                <td className={styles.colPos}>{t.pos}</td>
                <td className={styles.equipoCell}>
                  <Flag code={t.code} title={t.nombre} />
                  <span>{t.nombre}</span>
                </td>
                <td className={styles.colGrupo}>{t.grupo}</td>
                <td className={styles.num}>{t.pts}</td>
                <td className={styles.num}>{t.dif > 0 ? `+${t.dif}` : t.dif}</td>
                <td className={styles.num}>{t.gf}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ordenarPartidos(a: Match, b: Match) {
  return (a.jornada ?? 0) - (b.jornada ?? 0) || a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora);
}

/** Fase de grupos del simulador: partidos editables por grupo + tabla y ranking de terceros. */
export function SimuladorGrupos({ matches, standings, terceros, overrides, onChange }: SimuladorGruposProps) {
  return (
    <div className={styles.contenedor}>
      <RankingTercerosTable terceros={terceros} />
      <div className={styles.grid}>
        {standings.map((tabla) => {
          const partidos = matches
            .filter((m) => m.fase === 'grupos' && m.grupo === tabla.grupo)
            .sort(ordenarPartidos);
          return (
            <section key={tabla.grupo} className={styles.grupo}>
              <h3 className={`${styles.titulo} texture`}>
                <span className="kicker">Grupo {tabla.grupo}</span>
              </h3>
              <div className={styles.partidos}>
                {partidos.map((m) => (
                  <SimuladorMatchInput
                    key={m.id}
                    partido={{
                      id: m.id,
                      local: m.local,
                      localCode: m.localCode,
                      visitante: m.visitante,
                      visitanteCode: m.visitanteCode,
                      golesLocal: m.golesLocal,
                      golesVisitante: m.golesVisitante,
                      real: m.estado === 'finalizado',
                      definido: m.local !== 'Por definir' && m.visitante !== 'Por definir',
                    }}
                    override={overrides[m.id]}
                    onChange={(resultado) => onChange(m.id, resultado)}
                  />
                ))}
              </div>
              <StandingsTable standings={[tabla]} conLeyenda={false} />
            </section>
          );
        })}
      </div>
    </div>
  );
}
