import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Flag } from '../ui/Flag';
import { LiveDot } from '../ui/LiveDot';
import { SkeletonCard } from '../ui/SkeletonCard';
import { TerminoAyuda } from '../ui/TerminoAyuda';
import { useMatchDetail } from '../../hooks/useData';
import { useHoraLocal } from '../../hooks/useHoraLocal';
import { formatFecha } from '../../lib/time';
import type { EventoPartido, MatchDetail } from '../../lib/types';
import styles from './MatchModal.module.css';

interface MatchModalProps {
  matchId: string;
  onClose: () => void;
}

function metaModal(m: MatchDetail): string {
  const partes: string[] = [];
  if (m.grupo) partes.push(`Grupo ${m.grupo}`);
  else {
    const fases: Record<string, string> = {
      octavos: 'Octavos de final',
      cuartos: 'Cuartos de final',
      semifinal: 'Semifinal',
      tercer_puesto: 'Tercer puesto',
      final: 'Final',
    };
    if (m.fase !== 'grupos') partes.push(fases[m.fase] ?? m.fase);
  }
  if (m.jornada) partes.push(`Partido ${m.jornada}`);
  if (m.estadio) partes.push(m.estadio);
  return partes.join(' · ');
}

function BadgeEstado({ match: m }: { match: MatchDetail }) {
  if (m.estado === 'en_vivo') {
    return (
      <span className={styles.badgeVivo}>
        <LiveDot />
        <TerminoAyuda texto="Partido en vivo">VIVO</TerminoAyuda> {m.minuto != null ? `${m.minuto}'` : ''}
      </span>
    );
  }
  if (m.estado === 'entretiempo') {
    return <span className={styles.badgeEt}><TerminoAyuda texto="Entretiempo">ET</TerminoAyuda></span>;
  }
  if (m.estado === 'finalizado') {
    return <span className={styles.badgeFin}><TerminoAyuda texto="Partido finalizado">FIN</TerminoAyuda></span>;
  }
  return null;
}

function FilaIncidencia({ ev }: { ev: EventoPartido }) {
  const esLocal = ev.equipo === 'local';
  const icono = ev.tipo === 'gol' ? '⚽' : '🟥';
  return (
    <div className={styles.incFila}>
      <div className={styles.incLado}>
        {esLocal && (
          <span className={styles.incTexto}>
            <span className={styles.incNombre}>{ev.jugador}</span>
            <span className={styles.incMin}>{ev.minuto}'</span>
          </span>
        )}
      </div>
      <span className={styles.incIcono}>{icono}</span>
      <div className={`${styles.incLado} ${styles.incRight}`}>
        {!esLocal && (
          <span className={styles.incTexto}>
            <span className={styles.incMin}>{ev.minuto}'</span>
            <span className={styles.incNombre}>{ev.jugador}</span>
          </span>
        )}
      </div>
    </div>
  );
}

function ModalContent({ match: m }: { match: MatchDetail }) {
  const conMarcador = m.estado !== 'programado';
  const horaLocal = useHoraLocal(m.fecha, m.hora);
  const meta = metaModal(m);
  const incidencias = m.eventos.filter(
    (e) => e.tipo === 'gol' || e.tipo === 'tarjeta_roja',
  );

  return (
    <>
      {meta && <p className={styles.meta}>{meta}</p>}

      {/* Score + equipos */}
      <div className={styles.scoreboard}>
        <div className={styles.equipoBloque}>
          <span className={styles.bandera}>
            <Flag code={m.localCode} title={m.local} />
          </span>
          <span className={styles.equipoNombre}>{m.local}</span>
        </div>

        <div className={styles.scoreBloque}>
          {conMarcador ? (
            <span className={m.estado === 'en_vivo' || m.estado === 'entretiempo'
              ? `${styles.score} ${styles.scoreVivo}`
              : styles.score}>
              {m.golesLocal ?? 0} – {m.golesVisitante ?? 0}
            </span>
          ) : (
            <span className={styles.hora}>{horaLocal.hora}</span>
          )}
          <BadgeEstado match={m} />
        </div>

        <div className={styles.equipoBloque}>
          <span className={styles.bandera}>
            <Flag code={m.visitanteCode} title={m.visitante} />
          </span>
          <span className={styles.equipoNombre}>{m.visitante}</span>
        </div>
      </div>

      {/* Info extra: ciudad, TV, árbitro */}
      {(m.ciudad || m.tv.length > 0 || m.arbitro) && (
        <div className={styles.infoExtra}>
          {m.ciudad && (
            <span className={styles.infoChip}>
              <span className={styles.infoLabel}>Sede</span>
              {m.ciudad}
            </span>
          )}
          {m.tv.length > 0 && (
            <span className={styles.infoChip}>
              <span className={styles.infoLabel}>TV</span>
              {m.tv.join(' · ')}
            </span>
          )}
          {m.arbitro && (
            <span className={styles.infoChip}>
              <span className={styles.infoLabel}>Árbitro</span>
              {m.arbitro}
            </span>
          )}
        </div>
      )}

      {/* Incidencias: solo si hay datos */}
      {incidencias.length > 0 && (
        <div className={styles.incidencias}>
          <span className={styles.incKicker}>Incidencias</span>
          {incidencias.map((ev, i) => (
            <FilaIncidencia key={i} ev={ev} />
          ))}
        </div>
      )}
    </>
  );
}

export function MatchModal({ matchId, onClose }: MatchModalProps) {
  const query = useMatchDetail(matchId);
  const fechaLocal = useHoraLocal(query.data?.fecha ?? '', query.data?.hora ?? '00:00').fecha;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Cabecera del modal */}
        <div className={styles.header}>
          <span className={styles.fecha}>
            {query.data ? formatFecha(fechaLocal) : ' '}
          </span>
          <button
            type="button"
            className={styles.cerrar}
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Cuerpo */}
        <div className={styles.cuerpo}>
          {query.isPending ? (
            <div className={styles.loadingWrap}>
              <SkeletonCard count={2} alto={72} />
            </div>
          ) : query.isError || !query.data ? (
            <p className={styles.error}>No se pudo cargar el partido.</p>
          ) : (
            <ModalContent match={query.data} />
          )}
        </div>
      </div>
    </div>
  );
}
