import { Link, useParams } from 'react-router-dom';
import { Flag } from '../components/ui/Flag';
import { LiveDot } from '../components/ui/LiveDot';
import { ErrorState } from '../components/ui/ErrorState';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { useMatchDetail } from '../hooks/useData';
import { formatFecha } from '../lib/time';
import type { EventoPartido, MatchDetail } from '../lib/types';
import styles from './MatchPage.module.css';

function BadgeEstado({ match }: { match: MatchDetail }) {
  if (match.estado === 'en_vivo') {
    return (
      <span className={styles.badgeVivo}>
        <LiveDot />
        VIVO {match.minuto != null ? `${match.minuto}'` : ''}
      </span>
    );
  }
  if (match.estado === 'entretiempo') return <span className={styles.badgeEt}>ET</span>;
  if (match.estado === 'finalizado') return <span className={styles.badgeFin}>FIN</span>;
  return null;
}

function iconoEvento(tipo: EventoPartido['tipo']) {
  switch (tipo) {
    case 'gol': return '⚽';
    case 'tarjeta_amarilla': return '🟨';
    case 'tarjeta_roja': return '🟥';
    case 'sustitucion': return '↕';
  }
}

function FilaEvento({ ev }: { ev: EventoPartido }) {
  const esLocal = ev.equipo === 'local';
  return (
    <div className={styles.eventoFila}>
      <div className={`${styles.eventoLado} ${styles.eventoLocal}`}>
        {esLocal && (
          <>
            <span className={styles.eventoJugador}>{ev.jugador}</span>
            {ev.detalle && <span className={styles.eventoDetalle}>{ev.detalle}</span>}
          </>
        )}
      </div>
      <div className={styles.eventoCenter}>
        <span className={styles.eventoIcono}>{iconoEvento(ev.tipo)}</span>
        <span className={styles.eventoMin}>{ev.minuto}'</span>
      </div>
      <div className={`${styles.eventoLado} ${styles.eventoVisit}`}>
        {!esLocal && (
          <>
            <span className={styles.eventoJugador}>{ev.jugador}</span>
            {ev.detalle && <span className={styles.eventoDetalle}>{ev.detalle}</span>}
          </>
        )}
      </div>
    </div>
  );
}

function metaPartido(match: MatchDetail): string {
  const partes: string[] = [];
  if (match.grupo) partes.push(`Grupo ${match.grupo}`);
  else {
    const fases: Record<string, string> = {
      dieciseisavos: '16avos de final',
      octavos: 'Octavos de final',
      cuartos: 'Cuartos de final',
      semifinal: 'Semifinal',
      tercer_puesto: 'Tercer puesto',
      final: 'Final',
    };
    if (match.fase !== 'grupos') partes.push(fases[match.fase] ?? match.fase);
  }
  if (match.jornada) partes.push(`Fecha ${match.jornada}`);
  if (match.estadio) partes.push(match.estadio);
  return partes.join(' · ');
}

export default function MatchPage() {
  const { id } = useParams<{ id: string }>();
  const query = useMatchDetail(id ?? null);

  if (query.isPending) {
    return (
      <div className={`container ${styles.pagina}`}>
        <SkeletonCard count={3} alto={80} />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className={`container ${styles.pagina}`}>
        <ErrorState detalle="No se pudo cargar el partido." />
      </div>
    );
  }

  const m = query.data;
  const conMarcador = m.estado !== 'programado';
  const meta = metaPartido(m);

  return (
    <div className={`container ${styles.pagina}`}>
      <Link to="/futbol" className={styles.volver}>← Volver al fixture</Link>

      {/* CABECERA */}
      <header className={styles.cabecera}>
        <div className={styles.equipos}>
          <div className={styles.equipoBloque}>
            <span className={styles.banderaGrande}><Flag code={m.localCode} title={m.local} /></span>
            <span className={styles.nombreEquipo}>{m.local}</span>
          </div>

          <div className={styles.centro}>
            {conMarcador ? (
              <span className={styles.marcador}>
                {m.golesLocal ?? 0} – {m.golesVisitante ?? 0}
              </span>
            ) : (
              <span className={styles.horaGrande}>{m.hora}</span>
            )}
            <BadgeEstado match={m} />
          </div>

          <div className={styles.equipoBloque}>
            <span className={styles.banderaGrande}><Flag code={m.visitanteCode} title={m.visitante} /></span>
            <span className={styles.nombreEquipo}>{m.visitante}</span>
          </div>
        </div>

        {(meta || m.fecha) && (
          <p className={styles.metaInfo}>
            {m.fecha && <span>{formatFecha(m.fecha)}</span>}
            {meta && <span>{meta}</span>}
          </p>
        )}
        {m.arbitro && (
          <p className={styles.arbitro}>Árbitro: {m.arbitro}</p>
        )}
      </header>

      {/* CRONOLOGÍA */}
      {m.eventos.length > 0 && (
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>Cronología</h2>
          <div className={styles.timeline}>
            <div className={styles.timelineHeader}>
              <span>{m.local}</span>
              <span />
              <span>{m.visitante}</span>
            </div>
            {m.eventos.map((ev, i) => (
              <FilaEvento key={i} ev={ev} />
            ))}
          </div>
        </section>
      )}

      {m.eventos.length === 0 && conMarcador && (
        <section className={styles.seccion}>
          <p className={styles.sinDatos}>Estamos trabajando para mostrarte los detalles de este partido a la brevedad.</p>
        </section>
      )}

      {/* H2H */}
      {m.h2h.length > 0 && (
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>Historial</h2>
          <div className={styles.h2hLista}>
            {m.h2h.map((p, i) => (
              <div key={i} className={styles.h2hFila}>
                <div className={styles.h2hEquipo}>
                  <Flag code={p.localCode} title={p.local} />
                  <span className={styles.h2hNombre}>{p.local}</span>
                </div>
                <span className={styles.h2hResultado}>
                  {p.golesLocal} – {p.golesVisitante}
                </span>
                <div className={`${styles.h2hEquipo} ${styles.h2hDerecha}`}>
                  <span className={styles.h2hNombre}>{p.visitante}</span>
                  <Flag code={p.visitanteCode} title={p.visitante} />
                </div>
                <span className={styles.h2hFecha}>{formatFecha(p.fecha)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
