import type { CSSProperties } from 'react';
import { ChevronRight } from 'lucide-react';
import type { RaceCalendar } from '../../lib/types';
import { formatRangoFechas } from '../../lib/time';
import { useHoraLocal } from '../../hooks/useHoraLocal';
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

interface FilaProps {
  race: RaceCalendar;
  index: number;
  destacada: boolean;
  onSelect?: (ronda: number) => void;
}

function FilaCalendario({ race: r, index, destacada, onSelect }: FilaProps) {
  const finalizada = r.estado === 'finalizada';
  const clickable = r.estado !== 'proxima';
  const badge = BADGE[r.estado];
  const horaLocal = useHoraLocal(r.fecha, r.hora);

  return (
    <article
      className={`${styles.fila} ${destacada ? styles.destacada : ''} ${
        clickable ? styles.clickable : ''
      } stagger`}
      style={{ '--i': index } as CSSProperties}
      onClick={clickable ? () => onSelect?.(r.ronda) : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
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
        <span className={styles.fecha}>
          {formatRangoFechas(r.horarios[0]?.fecha ?? r.fecha, horaLocal.fecha)}
        </span>
        {!finalizada && <span className={styles.hora}>{horaLocal.hora}</span>}
      </div>
      <span className={`${styles.badge} ${styles[badge.clase]}`}>{badge.label}</span>
      {clickable && <ChevronRight size={16} className={styles.chevron} aria-hidden="true" />}
    </article>
  );
}

/** Calendario completo de la temporada de F1. */
export function F1Calendar({ races, onSelect }: F1CalendarProps) {
  // El próximo GP a disputarse (primero 'proxima' o 'en_curso')
  const proxRonda = races.find((r) => r.estado !== 'finalizada')?.ronda;

  return (
    <div className={styles.lista}>
      {races.map((r, i) => (
        <FilaCalendario
          key={r.ronda}
          race={r}
          index={i}
          destacada={r.ronda === proxRonda}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
