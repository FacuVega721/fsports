import { CalendarDays, Clock, MapPin } from 'lucide-react';
import type { NextRace } from '../../lib/types';
import { diasHasta, formatFecha } from '../../lib/time';
import { Flag } from '../ui/Flag';
import styles from './NextRaceCard.module.css';

interface NextRaceCardProps {
  race: NextRace;
}

/** Próximo GP, con fecha y hora en horario argentino (UTC-3). */
export function NextRaceCard({ race }: NextRaceCardProps) {
  const dias = race.fecha ? diasHasta(race.fecha) : null;
  const cuenta =
    dias === null || dias < 0
      ? ''
      : dias === 0
        ? '¡Es hoy!'
        : dias === 1
          ? 'Falta 1 día'
          : `Faltan ${dias} días`;

  return (
    <section className={`${styles.card} texture`} aria-label={`Próxima carrera: ${race.gp}`}>
      <div className={styles.cabecera}>
        <span className="kicker">Próximo GP</span>
        {cuenta && <span className={styles.cuenta}>{cuenta}</span>}
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
        <div className={styles.finde}>
          <span className="kicker">Fin de semana (hora ARG)</span>
          <ul className={styles.sesiones}>
            {race.horarios.map((s) => (
              <li key={s.tipo} className={s.tipo === 'Carrera' ? styles.principal : undefined}>
                <span className={styles.sesionTipo}>{s.tipo}</span>
                <span className={styles.sesionFecha}>{formatFecha(s.fecha)}</span>
                <span className={styles.sesionHora}>{s.hora}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
