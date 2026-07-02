import { tierColor } from '../../lib/scout/tiers';
import type { PlayerProfile } from './MetricsPanel';
import styles from './ComparacionPanel.module.css';

/** Métricas y etiquetas, en el mismo orden/idioma que MetricsPanel. */
const METRICAS: [string, string][] = [
  ['goals', 'Goles'],
  ['xg', 'xG'],
  ['shots', 'Tiros'],
  ['assists', 'Asistencias'],
  ['xa', 'xA'],
  ['keyPasses', 'Pases clave'],
  ['dribblesCompleted', 'Regates'],
  ['passesCompleted', 'Pases completados'],
  ['passAccuracy', '% acierto de pase'],
  ['progressivePassesProxy', 'Pases largos'],
  ['tackles', 'Entradas'],
  ['interceptions', 'Intercepciones'],
  ['recoveries', 'Recuperaciones'],
  ['pressures', 'Presiones'],
  ['clearances', 'Despejes'],
];

interface ComparacionPanelProps {
  base: PlayerProfile;
  rival: PlayerProfile;
}

/**
 * Compara los percentiles de dos jugadores: barra coloreada del jugador base +
 * marcador (línea plata) con el percentil del rival. Solo usa dato real.
 */
export function ComparacionPanel({ base, rival }: ComparacionPanelProps) {
  const filas = METRICAS.filter(
    ([k]) => base.percentiles[k] !== undefined && rival.percentiles[k] !== undefined,
  );

  return (
    <section className={styles.panel}>
      <div className={styles.leyenda}>
        <span className={styles.leyBase}>
          <span className={styles.swatchBase} aria-hidden="true" />
          {base.name}
        </span>
        <span className={styles.leyRival}>
          <span className={styles.swatchRival} aria-hidden="true" />
          {rival.name}
        </span>
      </div>

      <ul className={styles.filas}>
        {filas.map(([key, label]) => {
          const propio = base.percentiles[key];
          const rivalPct = rival.percentiles[key];
          return (
            <li key={key} className={styles.fila}>
              <span className={styles.etiqueta}>{label}</span>
              <div className={styles.barra}>
                <div
                  className={styles.relleno}
                  style={{ width: `${propio}%`, background: tierColor(propio) }}
                />
                <div
                  className={styles.marcadorRival}
                  style={{ left: `${rivalPct}%` }}
                  title={`${rival.name}: ${rivalPct}`}
                />
              </div>
              <span className={styles.valBase}>{propio}</span>
              <span className={styles.valRival}>{rivalPct}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
