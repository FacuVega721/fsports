import { useEffect } from 'react';
import { CalendarDays, MapPin, X } from 'lucide-react';
import type { RaceCalendar } from '../../lib/types';
import { formatFecha, formatRangoFechas } from '../../lib/time';
import { useF1CircuitHistoria } from '../../hooks/useData';
import { CircuitoHistoriaPanel } from './CircuitoHistoria';
import { SesionFila } from './NextRaceCard';
import { Flag } from '../ui/Flag';
import styles from './NextRaceCard.module.css';

interface CircuitDetailModalProps {
  race: RaceCalendar;
  onClose: () => void;
}

/** Detalle de un GP futuro del calendario (más allá del próximo inmediato): horario + Historia del circuito. */
export function CircuitDetailModal({ race, onClose }: CircuitDetailModalProps) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const query = useF1CircuitHistoria(race.circuitId || null);
  const inicioFinde = race.horarios[0]?.fecha ?? race.fecha;
  const finFinde = race.horarios[race.horarios.length - 1]?.fecha ?? race.fecha;
  const rango = race.horarios.length > 0
    ? formatRangoFechas(inicioFinde, finFinde)
    : formatFecha(race.fecha);

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Detalle ${race.gp}`}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalCabecera}>
          <div className={styles.modalTitulo}>
            <Flag code={race.code} title={race.gp} />
            <div>
              <span className="kicker">Round {race.ronda}</span>
              <h2 className={styles.modalGp}>{race.gp}</h2>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className={styles.modalMeta}>
          <span><MapPin size={12} aria-hidden="true" /> {race.circuito}</span>
          <span><CalendarDays size={12} aria-hidden="true" /> {rango}</span>
        </div>

        {race.horarios.length > 0 && (
          <ul className={styles.modalSesiones}>
            {race.horarios.map((s) => (
              <SesionFila key={s.tipo} sesion={s} />
            ))}
          </ul>
        )}

        <div className={styles.modalHistoria}>
          <span className="kicker">Historia del circuito</span>
          {query.isPending ? (
            <p className={styles.modalCargando}>Cargando…</p>
          ) : (
            <CircuitoHistoriaPanel
              historia={query.data?.historiaCircuito}
              palmares={query.data?.palmares}
            />
          )}
        </div>
      </div>
    </div>
  );
}
