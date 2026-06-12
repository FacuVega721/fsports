import type { CSSProperties } from 'react';
import { Tv } from 'lucide-react';
import { CANALES } from '../../data/sedes';
import { postFinal } from '../../lib/social';
import type { Match } from '../../lib/types';
import { CopyButton } from '../ui/CopyButton';
import { Flag } from '../ui/Flag';
import { LiveDot } from '../ui/LiveDot';
import styles from './MatchCard.module.css';

interface MatchCardProps {
  match: Match;
  /** Índice para la animación de entrada en cascada */
  index?: number;
  /** Si se pasa y el partido tiene grupo, la tarjeta abre el detalle del grupo */
  onSelectGroup?: (grupo: string) => void;
}

export function MatchCard({ match, index = 0, onSelectGroup }: MatchCardProps) {
  const enVivo = match.estado === 'en_vivo';
  const entretiempo = match.estado === 'entretiempo';
  const finalizado = match.estado === 'finalizado';
  const enJuego = enVivo || entretiempo; // partido en curso (encendido)
  const conMarcador = enJuego || finalizado;

  const clickable = !!onSelectGroup && !!match.grupo;
  const claseCard = [
    styles.card,
    enJuego ? styles.cardVivo : '',
    clickable ? styles.clickable : '',
  ]
    .filter(Boolean)
    .join(' ');

  const sede = [match.estadio, match.ciudad].filter(Boolean).join(', ');
  const meta = [match.grupo ? `Grupo ${match.grupo}` : '', sede]
    .filter(Boolean)
    .join(' · ');

  return (
    <article
      className={`${claseCard} stagger`}
      style={{ '--i': index } as CSSProperties}
      onClick={clickable ? () => onSelectGroup!(match.grupo) : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => (e.key === 'Enter' || e.key === ' ') && onSelectGroup!(match.grupo)
          : undefined
      }
    >
      <div className={styles.estado}>
        {enVivo ? (
          <>
            <span className={styles.vivoLabel}>
              <LiveDot />
              VIVO
            </span>
            <span className={styles.minuto}>{match.minuto !== null ? `${match.minuto}’` : ''}</span>
          </>
        ) : entretiempo ? (
          <span className={styles.entretiempo} title="Entretiempo">
            ENT
          </span>
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
            <span className={enJuego ? `${styles.goles} ${styles.golesVivo}` : styles.goles}>
              {match.golesLocal ?? '-'}
            </span>
          )}
        </div>
        <div className={styles.fila}>
          <Flag code={match.visitanteCode} title={match.visitante} />
          <span className={styles.nombre}>{match.visitante}</span>
          {conMarcador && (
            <span className={enJuego ? `${styles.goles} ${styles.golesVivo}` : styles.goles}>
              {match.golesVisitante ?? '-'}
            </span>
          )}
        </div>
      </div>

      {(meta || finalizado) && (
        <div className={styles.metaRow}>
          {meta && <p className={styles.meta}>{meta}</p>}
          {finalizado && (
            <span onClick={(e) => e.stopPropagation()}>
              <CopyButton iconOnly text={postFinal(match)} label="Copiar resultado para X" />
            </span>
          )}
        </div>
      )}

      {match.tv.length > 0 && (
        <div className={styles.tv}>
          <Tv size={12} aria-hidden="true" className={styles.tvIcon} />
          <span className={styles.tvLabel}>Ver en</span>
          {match.tv.map((c) => (
            <span key={c} className={styles.canal}>
              {CANALES[c] ?? c}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
