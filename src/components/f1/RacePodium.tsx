import type { CSSProperties } from 'react';
import type { LastRace } from '../../lib/types';
import { Flag } from '../ui/Flag';
import styles from './RacePodium.module.css';

interface RacePodiumProps {
  race: LastRace;
}

/** Última carrera: podio 1-2-3 destacado + tabla con el resto. */
export function RacePodium({ race }: RacePodiumProps) {
  const podio = race.resultados.filter((r) => r.pos >= 1 && r.pos <= 3);
  const resto = race.resultados.filter((r) => r.pos > 3);
  // Orden visual del podio: 2 — 1 — 3 (el ganador al centro y más alto)
  const ordenVisual = [2, 1, 3]
    .map((pos) => podio.find((r) => r.pos === pos))
    .filter((r): r is NonNullable<typeof r> => r !== undefined);

  const clasePuesto: Record<number, string> = {
    1: styles.oro,
    2: styles.plata,
    3: styles.bronce,
  };

  return (
    <section className={styles.seccion} aria-label={`Resultados de ${race.gp}`}>
      <header className={`${styles.header} texture`}>
        <span className="kicker">Última carrera</span>
        <h2 className={styles.gp}>
          <Flag code={race.code} title={race.gp} />
          {race.gp}
        </h2>
        {race.circuito && <p className={styles.circuito}>{race.circuito}</p>}
      </header>

      {ordenVisual.length > 0 && (
        <div className={styles.podio}>
          {ordenVisual.map((r, i) => (
            <div
              key={r.pos}
              className={`${styles.cajon} ${clasePuesto[r.pos] ?? ''} stagger`}
              style={{ '--i': i } as CSSProperties}
            >
              <span className={styles.posicion}>{r.pos}</span>
              <span className={styles.piloto}>{r.piloto}</span>
              <span className={styles.equipo}>{r.equipo}</span>
              <span className={styles.tiempo}>{r.tiempo}</span>
            </div>
          ))}
        </div>
      )}

      {resto.length > 0 && (
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th scope="col" aria-label="Posición">#</th>
              <th scope="col">Piloto</th>
              <th scope="col" className={styles.colDerecha}>Tiempo</th>
            </tr>
          </thead>
          <tbody>
            {resto.map((r) => (
              <tr key={r.pos}>
                <td className={styles.tablaPos}>{r.pos}</td>
                <td>
                  <span className={styles.tablaPiloto}>{r.piloto}</span>
                  {r.equipo && <span className={styles.tablaEquipo}> · {r.equipo}</span>}
                </td>
                <td className={styles.tablaTiempo}>{r.tiempo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
