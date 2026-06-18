import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { Flag } from '../components/ui/Flag';
import { LiveDot } from '../components/ui/LiveDot';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { MatchModal } from '../components/football/MatchModal';
import { useMatches, useF1Next, useF1Last } from '../hooks/useData';
import { enRango, formatFecha, hoyArg } from '../lib/time';
import type { Match, NextRace, LastRace } from '../lib/types';
import styles from './HomePage.module.css';

/* ── Chip de la tira horizontal ── */
function ChipPartido({ match: m, onVerDetalle }: { match: Match; onVerDetalle: (id: string) => void }) {
  const enJuego = m.estado === 'en_vivo' || m.estado === 'entretiempo';
  const conScore = enJuego || m.estado === 'finalizado';
  const clickable = conScore;
  return (
    <button
      type="button"
      onClick={clickable ? () => onVerDetalle(m.id) : undefined}
      className={`${styles.chip} ${enJuego ? styles.chipVivo : ''} ${!clickable ? styles.chipStatic : ''}`}
    >
      {enJuego && <LiveDot />}
      <Flag code={m.localCode} title={m.local} />
      <span className={conScore ? styles.chipScore : styles.chipHora}>
        {conScore ? `${m.golesLocal ?? '-'}–${m.golesVisitante ?? '-'}` : m.hora}
      </span>
      <Flag code={m.visitanteCode} title={m.visitante} />
      {m.estado === 'entretiempo' && <span className={styles.chipBadge}>ET</span>}
      {m.estado === 'finalizado' && <span className={styles.chipBadge}>FIN</span>}
      {m.estado === 'en_vivo' && m.minuto != null && (
        <span className={styles.chipMin}>{m.minuto}'</span>
      )}
    </button>
  );
}

/* ── Fila de partido estilo MatchCard (compacto) ── */
function PartidoFila({ match: m, onVerDetalle }: { match: Match; onVerDetalle: (id: string) => void }) {
  const enVivo = m.estado === 'en_vivo';
  const entretiempo = m.estado === 'entretiempo';
  const finalizado = m.estado === 'finalizado';
  const enJuego = enVivo || entretiempo;
  const conMarcador = enJuego || finalizado;

  const Tag = conMarcador ? 'button' : 'div';

  return (
    <Tag
      {...(conMarcador ? { type: 'button', onClick: () => onVerDetalle(m.id) } : {})}
      className={`${styles.partido} ${enJuego ? styles.partidoVivo : ''} ${conMarcador ? styles.partidoClickable : ''}`}
    >
      {/* Columna estado */}
      <div className={styles.partidoEstado}>
        {enVivo ? (
          <>
            <span className={styles.estadoVivo}><LiveDot />VIVO</span>
            {m.minuto != null && <span className={styles.estadoMin}>{m.minuto}'</span>}
          </>
        ) : entretiempo ? (
          <span className={styles.estadoEt}>ET</span>
        ) : finalizado ? (
          <span className={styles.estadoFin}>FIN</span>
        ) : (
          <span className={styles.estadoHora}>{m.hora}</span>
        )}
      </div>

      {/* Equipos + scores */}
      <div className={styles.partidoEquipos}>
        <div className={styles.partidoFila}>
          <Flag code={m.localCode} title={m.local} />
          <span className={styles.partidoNombre}>{m.local}</span>
          {conMarcador && (
            <span className={enJuego ? `${styles.goles} ${styles.golesVivo}` : styles.goles}>
              {m.golesLocal ?? '-'}
            </span>
          )}
        </div>
        <div className={styles.partidoFila}>
          <Flag code={m.visitanteCode} title={m.visitante} />
          <span className={styles.partidoNombre}>{m.visitante}</span>
          {conMarcador && (
            <span className={enJuego ? `${styles.goles} ${styles.golesVivo}` : styles.goles}>
              {m.golesVisitante ?? '-'}
            </span>
          )}
        </div>
      </div>

      {conMarcador && <ChevronRight size={13} className={styles.partidoArrow} aria-hidden="true" />}
    </Tag>
  );
}

/* ── Card del próximo GP ── */
function ProximoGP({ gp }: { gp: NextRace }) {
  const inicioFinde = gp.horarios?.[0]?.fecha ?? gp.fecha;
  const enCurso = enRango(inicioFinde, gp.fecha);
  const label = gp.ronda ? `Round ${gp.ronda}` : 'Próximo GP';

  return (
    <Link to="/f1?tab=calendario" className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderLeft}>
          <Flag code={gp.code} title={gp.gp} />
          <span className={styles.cardLabel}>{label}</span>
        </div>
        {enCurso && <span className={styles.badgeVivo}><LiveDot />En curso</span>}
      </div>
      <div className={styles.gpBody}>
        <p className={styles.gpNombre}>{gp.gp}</p>
        <p className={styles.gpMeta}>{gp.circuito}</p>
        {gp.horarios && gp.horarios.length > 0 && (
          <div className={styles.gpSesiones}>
            {gp.horarios.map((s) => (
              <div key={s.tipo} className={styles.gpSesion}>
                <span className={styles.gpSesionNombre}>{s.tipo}</span>
                <span className={styles.gpSesionHora}>{s.hora}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

/* ── Card del último podio F1 ── */
function UltimoGP({ carrera }: { carrera: LastRace }) {
  const [p1, p2, p3] = carrera.resultados;
  return (
    <Link to="/f1?tab=resultados" className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderLeft}>
          <Flag code={carrera.code} title={carrera.gp} />
          <span className={styles.cardLabel}>Último GP</span>
        </div>
        <span className={styles.cardSubtitle}>{carrera.gp}</span>
      </div>
      {/* Podio: DOM order 1, 2, 3 → CSS reordena a 2, 1, 3 */}
      <div className={styles.podio}>
        {p1 && (
          <div className={`${styles.podioPillar} ${styles.podioP1}`}>
            <div className={styles.podioInfo}>
              <span className={styles.podioPiloto}>{p1.piloto}</span>
              <span className={styles.podioEquipo}>{p1.equipo}</span>
              <span className={styles.podioTiempo}>{p1.tiempo}</span>
            </div>
            <div className={styles.podioStep}><span className={styles.podioNum}>1</span></div>
          </div>
        )}
        {p2 && (
          <div className={`${styles.podioPillar} ${styles.podioP2}`}>
            <div className={styles.podioInfo}>
              <span className={styles.podioPiloto}>{p2.piloto}</span>
              <span className={styles.podioEquipo}>{p2.equipo}</span>
            </div>
            <div className={styles.podioStep}><span className={styles.podioNum}>2</span></div>
          </div>
        )}
        {p3 && (
          <div className={`${styles.podioPillar} ${styles.podioP3}`}>
            <div className={styles.podioInfo}>
              <span className={styles.podioPiloto}>{p3.piloto}</span>
              <span className={styles.podioEquipo}>{p3.equipo}</span>
            </div>
            <div className={styles.podioStep}><span className={styles.podioNum}>3</span></div>
          </div>
        )}
      </div>
    </Link>
  );
}

/* ── HOME ── */
export default function HomePage() {
  const matches = useMatches();
  const proxima = useF1Next();
  const ultima = useF1Last();
  const [modalMatchId, setModalMatchId] = useState<string | null>(null);

  const hoy = hoyArg();

  const matchesHoy = useMemo(
    () => (matches.data ?? []).filter((m) => m.fecha === hoy),
    [matches.data, hoy],
  );

  const matchesSiguientes = useMemo(() => {
    if (matchesHoy.length > 0) return [];
    return (matches.data ?? [])
      .filter((m) => m.estado === 'programado' && m.fecha > hoy)
      .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora))
      .slice(0, 5);
  }, [matches.data, matchesHoy.length, hoy]);

  const matchesMostrar = matchesHoy.length > 0 ? matchesHoy : matchesSiguientes;

  const hayEnVivo = matchesHoy.some(
    (m) => m.estado === 'en_vivo' || m.estado === 'entretiempo',
  );

  const fichaLabel =
    matchesHoy.length > 0
      ? 'Partidos de hoy'
      : matchesSiguientes.length > 0
        ? `Próximos · ${formatFecha(matchesSiguientes[0].fecha)}`
        : 'Fixture';

  return (
    <div className={`container ${styles.home}`}>

      {/* HERO compacto */}
      <header className={`${styles.hero} texture`}>
        <div className={styles.logoArea}>
          <Logo />
        </div>
        <p className={styles.tagline}>Fanáticos del deporte.</p>
      </header>

      {/* TIRA EN VIVO / HOY */}
      {matchesHoy.length > 0 && (
        <div className={styles.strip}>
          <span className={styles.stripLabel}>
            {hayEnVivo ? <><LiveDot />En vivo</> : `Hoy · ${matchesHoy.length} partidos`}
          </span>
          <div className={styles.stripScroll}>
            {matchesHoy.map((m) => (
              <ChipPartido key={m.id} match={m} onVerDetalle={setModalMatchId} />
            ))}
          </div>
        </div>
      )}

      {/* DASHBOARD */}
      <div className={styles.dashboard}>

        {/* FÚTBOL */}
        <section className={styles.seccion}>
          <div className={styles.seccionCabecera}>
            <span className="kicker">FIFA World Cup 2026</span>
            <Link to="/futbol" className={styles.seccionLink}>
              Ver todo <ChevronRight size={12} aria-hidden="true" />
            </Link>
          </div>

          {matches.isPending ? (
            <SkeletonCard count={3} alto={64} />
          ) : matchesMostrar.length > 0 ? (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>{fichaLabel}</span>
                <Link to="/futbol" className={styles.cardLink}>Ver fixture →</Link>
              </div>
              {matchesMostrar.map((m) => (
                <PartidoFila key={m.id} match={m} onVerDetalle={setModalMatchId} />
              ))}
            </div>
          ) : (
            <div className={styles.card}>
              <p className={styles.vacio}>No hay partidos próximamente.</p>
            </div>
          )}
        </section>

        {/* F1 */}
        <section className={styles.seccion}>
          <div className={styles.seccionCabecera}>
            <span className="kicker">Fórmula 1</span>
            <Link to="/f1" className={styles.seccionLink}>
              Ver todo <ChevronRight size={12} aria-hidden="true" />
            </Link>
          </div>

          {proxima.isPending ? (
            <SkeletonCard count={1} alto={90} />
          ) : proxima.data ? (
            <ProximoGP gp={proxima.data} />
          ) : null}

          {ultima.isPending ? (
            <SkeletonCard count={1} alto={100} />
          ) : ultima.data ? (
            <UltimoGP carrera={ultima.data} />
          ) : null}
        </section>

      </div>

      {modalMatchId && (
        <MatchModal matchId={modalMatchId} onClose={() => setModalMatchId(null)} />
      )}
    </div>
  );
}
