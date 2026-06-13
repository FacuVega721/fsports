import { CalendarDays, ChevronDown, Clock, MapPin } from 'lucide-react';
import type { NextRace } from '../../lib/types';
import { diasHasta, enRango, formatFecha } from '../../lib/time';
import { Flag } from '../ui/Flag';
import styles from './NextRaceCard.module.css';

interface NextRaceCardProps {
  race: NextRace;
}

/** Próximo GP, con fecha y hora en horario argentino (UTC-3). */
export function NextRaceCard({ race }: NextRaceCardProps) {
  const dias = race.fecha ? diasHasta(race.fecha) : null;
  const inicioFinde = race.horarios?.[0]?.fecha ?? race.fecha;
  const enCurso = !!race.fecha && enRango(inicioFinde, race.fecha);
  const cuenta = enCurso
    ? 'En curso'
    : dias === null || dias < 0
      ? ''
      : dias === 0
        ? '¡Es hoy!'
        : dias === 1
          ? 'Falta 1 día'
          : `Faltan ${dias} días`;

  return (
    <section
      className={`${styles.card} ${enCurso ? styles.cardVivo : ''} texture`}
      aria-label={`Próxima carrera: ${race.gp}`}
    >
      <div className={styles.cabecera}>
        <span className="kicker">{enCurso ? 'GP en curso' : 'Próximo GP'}</span>
        {cuenta && (
          <span className={`${styles.cuenta} ${enCurso ? styles.cuentaVivo : ''}`}>{cuenta}</span>
        )}
      </div>
      <h2 className={styles.gp}>
        <Flag code={race.code} title={race.gp} />
        {race.gp}
      </h2>
      <ul className={styles.datos}>
        {race.circuito && (
          <li>
            <MapPin size={14} aria-hidden="true" />
            {race.circuito}
          </li>
        )}
        {race.fecha && (
          <li>
            <CalendarDays size={14} aria-hidden="true" />
            {formatFecha(race.fecha)}
          </li>
        )}
        <li>
          <Clock size={14} aria-hidden="true" />
          <span className={styles.hora}>{race.hora}</span>
          <span className={styles.tz}>hora ARG</span>
        </li>
      </ul>
      {race.horarios && race.horarios.length > 0 && (
        <details className={styles.finde}>
          <summary className={styles.findeResumen}>
            <span className="kicker">Fin de semana (hora ARG)</span>
            <ChevronDown size={15} className={styles.chevron} aria-hidden="true" />
          </summary>
          <ul className={styles.sesiones}>
            {race.horarios.map((s) => (
              <li key={s.tipo} className={s.tipo === 'Carrera' ? styles.principal : undefined}>
                <span className={styles.sesionTipo}>{s.tipo}</span>
                <span className={styles.sesionFecha}>{formatFecha(s.fecha)}</span>
                <span className={styles.sesionHora}>{s.hora}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
