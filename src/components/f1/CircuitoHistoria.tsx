import { CalendarDays, Route, RotateCcw, Ruler, Timer, Trophy } from 'lucide-react';
import type { CircuitoHistoria as CircuitoHistoriaInfo, PalmaresCircuito } from '../../lib/types';
import styles from './CircuitoHistoria.module.css';

interface CircuitoHistoriaPanelProps {
  historia: CircuitoHistoriaInfo | null | undefined;
  palmares?: PalmaresCircuito | null;
}

/** Ganadores históricos del circuito, del más reciente al más antiguo (en vivo, vía Jolpica). */
function PalmaresLista({ palmares }: { palmares: PalmaresCircuito }) {
  // Algunos años tuvieron dos GP en el mismo circuito (ej. Austria 2021: GP de Austria + GP de Estiria).
  // En esos casos mostramos el nombre de la carrera para distinguirlos.
  const porAnio = new Map<number, number>();
  for (const g of palmares.ganadores) porAnio.set(g.anio, (porAnio.get(g.anio) ?? 0) + 1);

  return (
    <div className={styles.palmares}>
      <div className={styles.palmaresHeader}>
        <Trophy size={14} className={styles.icono} aria-hidden="true" />
        <span className={styles.palmaresTitulo}>Ganadores anteriores</span>
        <span className={styles.palmaresCount}>{palmares.ediciones} ediciones</span>
      </div>
      <div className={styles.palmaresScroll}>
        {palmares.ganadores.map((g, i) => (
          <div key={`${g.anio}-${i}`} className={styles.palmaresFila}>
            <span className={styles.palmaresAnio}>
              {g.anio}
              {(porAnio.get(g.anio) ?? 0) > 1 && (
                <span className={styles.palmaresGp}>{g.gp.replace(/^GP de(l)? /, '')}</span>
              )}
            </span>
            <span className={styles.palmaresPiloto}>{g.piloto}</span>
            <span className={styles.palmaresEquipo}>{g.equipo}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Datos históricos del circuito: longitud, vueltas, récord, curiosidades y palmarés. */
export function CircuitoHistoriaPanel({ historia, palmares }: CircuitoHistoriaPanelProps) {
  if (!historia && !palmares) {
    return <p className={styles.vacio}>Todavía no tenemos datos históricos de este circuito.</p>;
  }

  return (
    <div className={styles.panel}>
      {historia && (
        <>
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
          <ul className={styles.curiosidades}>
            {historia.datos.map((d, i) => (
              <li key={i} className={styles.curiosidad}>{d}</li>
            ))}
          </ul>
        </>
      )}
      {palmares && palmares.ganadores.length > 0 && <PalmaresLista palmares={palmares} />}
    </div>
  );
}
