import { CalendarDays, Route, RotateCcw, Ruler, Timer } from 'lucide-react';
import type { CircuitoHistoria as CircuitoHistoriaInfo } from '../../lib/types';
import styles from './CircuitoHistoria.module.css';

interface CircuitoHistoriaPanelProps {
  historia: CircuitoHistoriaInfo | null | undefined;
}

/** Datos históricos del circuito: longitud, vueltas, récord y un dato curioso. Cargados a mano (la API no los provee). */
export function CircuitoHistoriaPanel({ historia }: CircuitoHistoriaPanelProps) {
  if (!historia) {
    return <p className={styles.vacio}>Todavía no tenemos datos históricos de este circuito.</p>;
  }

  return (
    <div className={styles.panel}>
      <div className={styles.grid}>
        <div className={styles.dato}>
          <Ruler size={15} className={styles.icono} aria-hidden="true" />
          <div>
            <span className={styles.label}>Longitud</span>
            <span className={styles.valor}>{historia.longitudKm} km</span>
          </div>
        </div>
        <div className={styles.dato}>
          <RotateCcw size={15} className={styles.icono} aria-hidden="true" />
          <div>
            <span className={styles.label}>Vueltas</span>
            <span className={styles.valor}>{historia.vueltas}</span>
          </div>
        </div>
        <div className={styles.dato}>
          <Route size={15} className={styles.icono} aria-hidden="true" />
          <div>
            <span className={styles.label}>Distancia total</span>
            <span className={styles.valor}>{historia.distanciaKm} km</span>
          </div>
        </div>
        <div className={styles.dato}>
          <CalendarDays size={15} className={styles.icono} aria-hidden="true" />
          <div>
            <span className={styles.label}>En el calendario desde</span>
            <span className={styles.valor}>{historia.inaugurado}</span>
          </div>
        </div>
        {historia.recordVuelta && (
          <div className={styles.dato}>
            <Timer size={15} className={styles.icono} aria-hidden="true" />
            <div>
              <span className={styles.label}>Récord de vuelta</span>
              <span className={styles.valor}>
                {historia.recordVuelta.piloto}{' '}
                <span className={styles.recordTiempo}>{historia.recordVuelta.tiempo}</span>
                {' '}({historia.recordVuelta.anio})
              </span>
            </div>
          </div>
        )}
      </div>
      <p className={styles.curiosidad}>{historia.dato}</p>
    </div>
  );
}
