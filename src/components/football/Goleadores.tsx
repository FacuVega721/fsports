import type { Scorer } from '../../lib/types';
import { EmptyState } from '../ui/EmptyState';
import { Flag } from '../ui/Flag';
import styles from './Goleadores.module.css';

interface GoleadoresProps {
  scorers: Scorer[];
  /** Mostrar el encabezado de sección */
  conTitulo?: boolean;
}

/** Tabla de goleadores y asistencias del torneo. */
export function Goleadores({ scorers, conTitulo = true }: GoleadoresProps) {
  if (scorers.length === 0) {
    return (
      <EmptyState
        titulo="Todavía no hay goleadores"
        detalle="Cuando empiecen a convertirse goles, la tabla de artilleros aparece acá."
      />
    );
  }

  return (
    <section className={styles.seccion}>
      {conTitulo && (
        <header className={`${styles.header} texture`}>
          <span className="kicker">Goleadores y asistencias</span>
        </header>
      )}
      <div className={styles.scroll}>
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th className={styles.colPos} scope="col">#</th>
              <th className={styles.colJug} scope="col">Jugador</th>
              <th className={styles.colNum} scope="col" title="Partidos jugados">PJ</th>
              <th className={styles.colNum} scope="col" title="Asistencias">Asis</th>
              <th className={styles.colNum} scope="col" title="Goles">Goles</th>
            </tr>
          </thead>
          <tbody>
            {scorers.map((s) => (
              <tr key={`${s.pos}-${s.jugador}`}>
                <td className={styles.pos}>{s.pos}</td>
                <td>
                  <span className={styles.jugador}>
                    <Flag code={s.equipoCode} title={s.equipo} />
                    <span className={styles.nombre}>
                      {s.jugador}
                      <span className={styles.equipo}>{s.equipo}</span>
                    </span>
                  </span>
                </td>
                <td className={styles.num}>{s.partidos}</td>
                <td className={styles.num}>{s.asistencias}</td>
                <td className={`${styles.num} ${styles.goles}`}>
                  {s.goles}
                  {s.penales > 0 && <span className={styles.pen}> ({s.penales}p)</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
