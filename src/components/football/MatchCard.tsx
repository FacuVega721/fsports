import type { CSSProperties } from 'react';
import { useState } from 'react';
import { ChevronDown, Tv } from 'lucide-react';
import { CANALES } from '../../data/sedes';
import { useMatchDetail } from '../../hooks/useData';
import { DATA_MODE } from '../../lib/config';
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
  /** Si se pasa, los nombres de los equipos abren el detalle del país */
  onSelectPais?: (nombre: string) => void;
}

export function MatchCard({ match, index = 0, onSelectGroup, onSelectPais }: MatchCardProps) {
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

  const conEquiposDefinidos = match.local !== 'Por definir' && match.visitante !== 'Por definir';
  const [verDetalle, setVerDetalle] = useState(false);
  const detalle = useMatchDetail(verDetalle ? match.id : null);

  const renderNombre = (nombre: string) => {
    if (onSelectPais && nombre && nombre !== 'Por definir') {
      return (
        <button
          type="button"
          className={`${styles.nombre} ${styles.nombreBtn}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelectPais(nombre);
          }}
        >
          {nombre}
        </button>
      );
    }
    return <span className={styles.nombre}>{nombre}</span>;
  };

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
          {renderNombre(match.local)}
          {conMarcador && (
            <span className={enJuego ? `${styles.goles} ${styles.golesVivo}` : styles.goles}>
              {match.golesLocal ?? '-'}
            </span>
          )}
        </div>
        <div className={styles.fila}>
          <Flag code={match.visitanteCode} title={match.visitante} />
          {renderNombre(match.visitante)}
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

      {DATA_MODE === 'api' && conEquiposDefinidos && (
        <details
          className={styles.detalle}
          onClick={(e) => e.stopPropagation()}
          onToggle={(e) => setVerDetalle(e.currentTarget.open)}
        >
          <summary className={styles.detalleResumen}>
            <span className="kicker">Árbitro e historial</span>
            <ChevronDown size={14} className={styles.chevron} aria-hidden="true" />
          </summary>
          <div className={styles.detalleContenido}>
            {detalle.isPending ? (
              <p className={styles.detalleVacio}>Cargando…</p>
            ) : (
              <>
                {detalle.data?.arbitro && (
                  <p className={styles.arbitro}>
                    Árbitro: <strong>{detalle.data.arbitro}</strong>
                  </p>
                )}
                {detalle.data?.resumen && (
                  <p className={styles.h2hResumen}>
                    Últimos {detalle.data.resumen.partidos} enfrentamientos: {match.local}{' '}
                    ganó {detalle.data.resumen.victoriasLocal}, empataron{' '}
                    {detalle.data.resumen.empates} y {match.visitante} ganó{' '}
                    {detalle.data.resumen.victoriasVisitante}.
                  </p>
                )}
                {detalle.data && detalle.data.ultimos.length > 0 && (
                  <ul className={styles.h2hLista}>
                    {detalle.data.ultimos.slice(0, 5).map((p, i) => (
                      <li key={i} className={styles.h2hFila}>
                        <span className={styles.h2hFecha}>{p.fecha}</span>
                        <span className={styles.h2hPartido}>
                          {p.local} {p.golesLocal ?? '-'}-{p.golesVisitante ?? '-'} {p.visitante}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </details>
      )}
    </article>
  );
}
