import type { Scorer } from '../../lib/types';
import { EmptyState } from '../ui/EmptyState';
import { Flag } from '../ui/Flag';
import styles from './Goleadores.module.css';

interface GoleadoresProps {
  scorers: Scorer[];
  /** Mostrar el encabezado de sección */
  conTitulo?: boolean;
}

/** Tabla de goleadores del torneo, ordenada como la devuelve la API (por goles). */
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
          <span className="kicker">Goleadores</span>
        </header>
      )}
      <div className={styles.scroll}>
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th className={styles.colPos} scope="col">#</th>
              <th className={styles.colJug} scope="col">Jugador</th>
              <th className={styles.colNum} scope="col" title="Partidos jugados">PJ</th>
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
                <td className={`${styles.num} ${styles.destacado}`}>
                  {s.goles}
                  {s.penales > 0 && <span className={styles.pen}>{s.penales} de penal</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** Tabla de asistencias: la API gratuita no tiene un endpoint dedicado, así que
 *  se arma a partir de los goleadores que además dieron asistencias (puede no
 *  incluir a jugadores con asistencias pero sin goles convertidos). */
export function Asistencias({ scorers, conTitulo = true }: GoleadoresProps) {
  const asistentes = scorers
    .filter((s) => s.asistencias > 0)
    .sort((a, b) => b.asistencias - a.asistencias || b.goles - a.goles)
    .map((s, i) => ({ ...s, pos: i + 1 }));

  if (asistentes.length === 0) {
    return (
      <EmptyState
        titulo="Todavía no hay asistencias"
        detalle="Cuando se registren asistencias entre los goleadores, la tabla aparece acá."
      />
    );
  }

  return (
    <section className={styles.seccion}>
      {conTitulo && (
        <header className={`${styles.header} texture`}>
          <span className="kicker">Asistencias</span>
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
            </tr>
          </thead>
          <tbody>
            {asistentes.map((s) => (
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
                <td className={`${styles.num} ${styles.destacado}`}>{s.asistencias}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={styles.aviso}>
        Solo incluye asistencias de jugadores que también convirtieron goles: la API gratuita no
        tiene un listado de asistencias independiente.
      </p>
    </section>
  );
}
