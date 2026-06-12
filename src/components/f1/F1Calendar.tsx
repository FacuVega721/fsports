import type { CSSProperties } from 'react';
import { ChevronRight } from 'lucide-react';
import type { RaceCalendar } from '../../lib/types';
import { formatFecha } from '../../lib/time';
import { Flag } from '../ui/Flag';
import styles from './F1Calendar.module.css';

interface F1CalendarProps {
  races: RaceCalendar[];
  /** Al hacer clic en un GP finalizado (abre su resultado) */
  onSelect?: (ronda: number) => void;
}

const BADGE: Record<RaceCalendar['estado'], { label: string; clase: string }> = {
  finalizada: { label: 'Finalizada', clase: 'fin' },
  en_curso: { label: 'En curso', clase: 'vivo' },
  proxima: { label: 'Próxima', clase: 'prox' },
};

/** Calendario completo de la temporada de F1. */
export function F1Calendar({ races, onSelect }: F1CalendarProps) {
  // El próximo GP a disputarse (primero 'proxima' o 'en_curso')
  const proxRonda = races.find((r) => r.estado !== 'finalizada')?.ronda;

  return (
    <div className={styles.lista}>
      {races.map((r, i) => {
        const finalizada = r.estado === 'finalizada';
        const destacada = r.ronda === proxRonda;
        const badge = BADGE[r.estado];
        return (
          <article
            key={r.ronda}
            className={`${styles.fila} ${destacada ? styles.destacada : ''} ${
              finalizada ? styles.clickable : ''
            } stagger`}
            style={{ '--i': i } as CSSProperties}
            onClick={finalizada ? () => onSelect?.(r.ronda) : undefined}
            role={finalizada ? 'button' : undefined}
            tabIndex={finalizada ? 0 : undefined}
            onKeyDown={
              finalizada
                ? (e) => (e.key === 'Enter' || e.key === ' ') && onSelect?.(r.ronda)
                : undefined
            }
          >
            <span className={styles.ronda}>R{r.ronda}</span>
            <div className={styles.centro}>
              <span className={styles.gp}>
                <Flag code={r.code} title={r.gp} />
                {r.gp}
                {r.esSprint && <span className={styles.sprint}>SPRINT</span>}
              </span>
              <span className={styles.circuito}>
                {[r.circuito, r.ciudad].filter(Boolean).join(' · ')}
              </span>
            </div>
            <div className={styles.derecha}>
              <span className={styles.fecha}>{r.fecha ? formatFecha(r.fecha) : '—'}</span>
              <span className={styles.hora}>{r.hora}</span>
            </div>
            <span className={`${styles.badge} ${styles[badge.clase]}`}>{badge.label}</span>
            {finalizada && (
              <ChevronRight size={16} className={styles.chevron} aria-hidden="true" />
            )}
          </article>
        );
      })}
    </div>
  );
}
