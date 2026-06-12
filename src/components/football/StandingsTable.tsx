import { ChevronRight } from 'lucide-react';
import type { StandingGroup } from '../../lib/types';
import { Flag } from '../ui/Flag';
import styles from './StandingsTable.module.css';

interface StandingsTableProps {
  standings: StandingGroup[];
  /** Muestra la referencia de colores de clasificación debajo de cada grupo */
  conLeyenda?: boolean;
  /** Si se pasa, el título del grupo es clickeable (abre el detalle del grupo) */
  onSelectGroup?: (grupo: string) => void;
  /** Si se pasa, el nombre del equipo es clickeable (abre el detalle del país) */
  onSelectPais?: (nombre: string) => void;
}

/** Clase de zona de clasificación según la posición (Mundial: 1-2 clasifican,
 *  3 puede clasificar como mejor tercero). */
function zona(pos: number): string {
  if (pos <= 2) return styles.clasifica;
  if (pos === 3) return styles.posible;
  return '';
}

/** Tablas de posiciones por grupo, con stats completas y zonas de clasificación. */
export function StandingsTable({
  standings,
  conLeyenda = true,
  onSelectGroup,
  onSelectPais,
}: StandingsTableProps) {
  return (
    <div className={styles.contenedor}>
      {standings.map((grupo) => (
        <section key={grupo.grupo} className={styles.grupo}>
          {onSelectGroup ? (
            <button
              type="button"
              className={`${styles.titulo} ${styles.tituloBtn} texture`}
              onClick={() => onSelectGroup(grupo.grupo)}
            >
              <span className="kicker">Grupo {grupo.grupo}</span>
              <span className={styles.verMas}>
                Ver grupo <ChevronRight size={13} aria-hidden="true" />
              </span>
            </button>
          ) : (
            <h3 className={`${styles.titulo} texture`}>
              <span className="kicker">Grupo {grupo.grupo}</span>
            </h3>
          )}
          <div className={styles.scroll}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th className={styles.colPos} scope="col" aria-label="Posición">#</th>
                  <th className={styles.colEquipo} scope="col">Equipo</th>
                  <th scope="col" title="Puntos">PTS</th>
                  <th scope="col" title="Partidos jugados">PJ</th>
                  <th scope="col" title="Ganados">G</th>
                  <th scope="col" title="Empatados">E</th>
                  <th scope="col" title="Perdidos">P</th>
                  <th scope="col" title="Goles a favor">GF</th>
                  <th scope="col" title="Goles en contra">GC</th>
                  <th scope="col" title="Diferencia de gol">DIF</th>
                </tr>
              </thead>
              <tbody>
                {grupo.equipos.map((eq) => (
                  <tr key={`${grupo.grupo}-${eq.pos}-${eq.nombre}`}>
                    <td className={`${styles.pos} ${zona(eq.pos)}`}>{eq.pos}</td>
                    <td className={styles.equipoCell}>
                      {onSelectPais ? (
                        <button
                          type="button"
                          className={`${styles.equipo} ${styles.equipoBtn}`}
                          onClick={() => onSelectPais(eq.nombre)}
                        >
                          <Flag code={eq.code} title={eq.nombre} />
                          <span className={styles.nombre}>{eq.nombre}</span>
                        </button>
                      ) : (
                        <span className={styles.equipo}>
                          <Flag code={eq.code} title={eq.nombre} />
                          <span className={styles.nombre}>{eq.nombre}</span>
                        </span>
                      )}
                    </td>
                    <td className={`${styles.num} ${styles.pts}`}>{eq.pts}</td>
                    <td className={styles.num}>{eq.pj}</td>
                    <td className={styles.num}>{eq.g}</td>
                    <td className={styles.num}>{eq.e}</td>
                    <td className={styles.num}>{eq.p}</td>
                    <td className={styles.num}>{eq.gf}</td>
                    <td className={styles.num}>{eq.gc}</td>
                    <td className={`${styles.num} ${styles.dif}`}>
                      {eq.dif > 0 ? `+${eq.dif}` : eq.dif}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {conLeyenda && (
            <div className={styles.leyenda}>
              <span>
                <i className={`${styles.punto} ${styles.puntoVerde}`} /> Clasifica
              </span>
              <span>
                <i className={`${styles.punto} ${styles.puntoAzul}`} /> Posible (mejor 3°)
              </span>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
