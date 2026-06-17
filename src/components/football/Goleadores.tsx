import type { Scorer } from '../../lib/types';
import { EmptyState } from '../ui/EmptyState';
import { Flag } from '../ui/Flag';
import styles from './Goleadores.module.css';

interface GoleadoresProps {
  scorers: Scorer[];
  conTitulo?: boolean;
}

/** Tabla combinada de goleadores y asistencias del torneo. */
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
          <span className="kicker">Goleadores y Asistencias</span>
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
              <th className={styles.colNum} scope="col" title="Asistencias">Asis</th>
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
                <td className={styles.num}>
                  <span className={styles.destacado}>
                    {s.goles}
                    {s.penales > 0 && <span className={styles.pen}>{s.penales} de penal</span>}
                  </span>
                </td>
                <td className={styles.num}>{s.asistencias > 0 ? s.asistencias : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={styles.aviso}>
        Asistencias solo disponibles para jugadores que también convirtieron goles (limitación de la API gratuita).
      </p>
    </section>
  );
}
