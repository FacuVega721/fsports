import type { CSSProperties } from 'react';
import type { Match } from '../../lib/types';
import { Flag } from '../ui/Flag';
import { LiveDot } from '../ui/LiveDot';
import styles from './MatchCard.module.css';

interface MatchCardProps {
  match: Match;
  /** Índice para la animación de entrada en cascada */
  index?: number;
}

export function MatchCard({ match, index = 0 }: MatchCardProps) {
  const enVivo = match.estado === 'en_vivo';
  const finalizado = match.estado === 'finalizado';
  const conMarcador = enVivo || finalizado;

  const claseCard = enVivo ? `${styles.card} ${styles.cardVivo}` : styles.card;

  const meta = [match.grupo ? `Grupo ${match.grupo}` : '', match.estadio]
    .filter(Boolean)
    .join(' · ');

  return (
    <article className={`${claseCard} stagger`} style={{ '--i': index } as CSSProperties}>
      <div className={styles.estado}>
        {enVivo ? (
          <>
            <span className={styles.vivoLabel}>
              <LiveDot />
              VIVO
            </span>
            <span className={styles.minuto}>{match.minuto !== null ? `${match.minuto}’` : ''}</span>
          </>
        ) : finalizado ? (
          <span className={styles.fin}>FIN</span>
        ) : (
          <span className={styles.hora}>{match.hora}</span>
        )}
      </div>

      <div className={styles.equipos}>
        <div className={styles.fila}>
          <Flag code={match.localCode} title={match.local} />
          <span className={styles.nombre}>{match.local}</span>
          {conMarcador && (
            <span className={enVivo ? `${styles.goles} ${styles.golesVivo}` : styles.goles}>
              {match.golesLocal ?? '-'}
            </span>
          )}
        </div>
        <div className={styles.fila}>
          <Flag code={match.visitanteCode} title={match.visitante} />
          <span className={styles.nombre}>{match.visitante}</span>
          {conMarcador && (
            <span className={enVivo ? `${styles.goles} ${styles.golesVivo}` : styles.goles}>
              {match.golesVisitante ?? '-'}
            </span>
          )}
        </div>
      </div>

      {meta && <p className={styles.meta}>{meta}</p>}
    </article>
  );
}
