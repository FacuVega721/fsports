import type { StandingGroup } from '../../lib/types';
import { Flag } from '../ui/Flag';
import styles from './StandingsTable.module.css';

interface StandingsTableProps {
  standings: StandingGroup[];
}

/** Tablas de posiciones por grupo. */
export function StandingsTable({ standings }: StandingsTableProps) {
  return (
    <div className={styles.contenedor}>
      {standings.map((grupo) => (
        <section key={grupo.grupo} className={styles.grupo}>
          <h3 className={`${styles.titulo} texture`}>
            <span className="kicker">Grupo {grupo.grupo}</span>
          </h3>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th className={styles.colPos} scope="col" aria-label="Posición">
                  #
                </th>
                <th className={styles.colEquipo} scope="col">
                  Equipo
                </th>
                <th className={styles.colNum} scope="col" title="Partidos jugados">
                  PJ
                </th>
                <th className={styles.colNum} scope="col" title="Puntos">
                  PTS
                </th>
              </tr>
            </thead>
            <tbody>
              {grupo.equipos.map((equipo) => (
                <tr key={`${grupo.grupo}-${equipo.pos}-${equipo.nombre}`}>
                  <td className={styles.pos}>{equipo.pos}</td>
                  <td>
                    <span className={styles.equipo}>
                      <Flag code={equipo.code} title={equipo.nombre} />
                      <span className={styles.nombre}>{equipo.nombre}</span>
                    </span>
                  </td>
                  <td className={styles.num}>{equipo.pj}</td>
                  <td className={`${styles.num} ${styles.pts}`}>{equipo.pts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}
