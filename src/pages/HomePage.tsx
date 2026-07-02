import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { Flag } from '../components/ui/Flag';
import { LiveDot } from '../components/ui/LiveDot';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { TerminoAyuda } from '../components/ui/TerminoAyuda';
import { MatchModal } from '../components/football/MatchModal';
import { useMatches, useF1Next, useF1Last } from '../hooks/useData';
import { useHoraLocal } from '../hooks/useHoraLocal';
import { useSeo } from '../hooks/useSeo';
import { enRango, formatFecha, hoyArg } from '../lib/time';
import type { Match, NextRace, LastRace } from '../lib/types';
import styles from './HomePage.module.css';

/* ── Chip de la tira horizontal ── */
function ChipPartido({ match: m, onVerDetalle }: { match: Match; onVerDetalle: (id: string) => void }) {
  const enJuego = m.estado === 'en_vivo' || m.estado === 'entretiempo';
  const conScore = enJuego || m.estado === 'finalizado';
  const clickable = conScore;
  const local = useHoraLocal(m.fecha, m.hora);
  return (
    <button
      type="button"
      onClick={clickable ? () => onVerDetalle(m.id) : undefined}
      className={`${styles.chip} ${enJuego ? styles.chipVivo : ''} ${!clickable ? styles.chipStatic : ''}`}
    >
      {enJuego && <LiveDot />}
      <Flag code={m.localCode} title={m.local} />
      <span className={conScore ? styles.chipScore : styles.chipHora}>
        {conScore ? `${m.golesLocal ?? '-'}–${m.golesVisitante ?? '-'}` : local.hora}
      </span>
      <Flag code={m.visitanteCode} title={m.visitante} />
      {m.estado === 'entretiempo' && (
        <span className={styles.chipBadge}><TerminoAyuda texto="Entretiempo">ET</TerminoAyuda></span>
      )}
      {m.estado === 'finalizado' && (
        <span className={styles.chipBadge}><TerminoAyuda texto="Partido finalizado">FIN</TerminoAyuda></span>
      )}
      {m.estado === 'en_vivo' && m.minuto != null && (
        <span className={styles.chipMin}>{m.minuto}'</span>
      )}
    </button>
  );
}

/* ── Fila de partido compacta ── */
function PartidoFila({ match: m, onVerDetalle }: { match: Match; onVerDetalle: (id: string) => void }) {
  const enVivo = m.estado === 'en_vivo';
  const entretiempo = m.estado === 'entretiempo';
  const finalizado = m.estado === 'finalizado';
  const enJuego = enVivo || entretiempo;
  const conMarcador = enJuego || finalizado;
  const Tag = conMarcador ? 'button' : 'div';
  const local = useHoraLocal(m.fecha, m.hora);

  return (
    <Tag
      {...(conMarcador ? { type: 'button', onClick: () => onVerDetalle(m.id) } : {})}
      className={`${styles.partido} ${enJuego ? styles.partidoVivo : ''} ${conMarcador ? styles.partidoClickable : ''}`}
    >
      {/* Col 1: estado o hora */}
      <div className={styles.partidoEstado}>
        {enVivo ? (
          <><LiveDot />{m.minuto != null && <span className={styles.estadoMin}>{m.minuto}'</span>}</>
        ) : entretiempo ? (
          <span className={styles.estadoEt}><TerminoAyuda texto="Entretiempo">ET</TerminoAyuda></span>
        ) : finalizado ? (
          <span className={styles.estadoFin}><TerminoAyuda texto="Partido finalizado">FIN</TerminoAyuda></span>
        ) : (
          <span className={styles.estadoHora}>
            {local.hora}
            {local.distinta && <sup className={styles.diaDistinto}>{local.fecha > m.fecha ? '+1' : '-1'}</sup>}
          </span>
        )}
      </div>

      {/* Col 2: equipos */}
      <div className={styles.partidoEquipos}>
        <div className={styles.equipoRow}>
          <Flag code={m.localCode} title={m.local} />
          <span className={styles.partidoNombre}>{m.local}</span>
        </div>
        <div className={styles.equipoRow}>
          <Flag code={m.visitanteCode} title={m.visitante} />
          <span className={styles.partidoNombre}>{m.visitante}</span>
        </div>
      </div>

      {/* Col 3: scores */}
      {conMarcador && (
        <div className={styles.scores}>
          <span className={enJuego ? `${styles.gol} ${styles.golVivo}` : styles.gol}>{m.golesLocal ?? '-'}</span>
          <span className={enJuego ? `${styles.gol} ${styles.golVivo}` : styles.gol}>{m.golesVisitante ?? '-'}</span>
        </div>
      )}

      {/* Col 4: flecha */}
      {conMarcador && <ChevronRight size={13} className={styles.partidoArrow} aria-hidden="true" />}
    </Tag>
  );
}

/* ── Fila de sesión de F1 (FP1, Clasificación, Carrera...), con hora local ── */
function SesionFila({ sesion: s }: { sesion: { tipo: string; fecha: string; hora: string } }) {
  const local = useHoraLocal(s.fecha, s.hora);
  return (
    <div className={styles.gpSesion}>
      <span className={styles.gpSesionNombre}>{s.tipo}</span>
      <span className={styles.gpSesionFecha}>{formatFecha(local.fecha)}</span>
      <span className={styles.gpSesionHora}>{local.hora}</span>
    </div>
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
              <SesionFila key={s.tipo} sesion={s} />
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
  useSeo(
    'Mundial 2026 y Fórmula 1 en vivo',
    'Resultados, fixture y calendario del Mundial 2026 y la Fórmula 1, al instante y con otro estilo.',
    '/',
  );
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
        <p className={styles.heroValor}>
          Mundial 2026 y Fórmula 1 en vivo — más análisis de jugadores con IA.
        </p>
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

      {/* SCOUT INTELLIGENCE — arriba del dashboard, es la prioridad de crecimiento actual */}
      <Link to="/scout" className={styles.scoutCard}>
        <span className={styles.scoutBadge}>Nuevo</span>
        <span className="kicker">Scout Intelligence</span>
        <p className={styles.scoutTitulo}>Analizá jugadores como un profesional</p>
        <p className={styles.scoutDesc}>
          Revisá sus estadísticas, su desempeño en las principales
          competencias y mucho más.
        </p>
        <span className={styles.scoutCta}>
          Probar gratis <ChevronRight size={14} aria-hidden="true" />
        </span>
      </Link>

      {/* DASHBOARD */}
      <div className={styles.dashboard}>

        {/* FÚTBOL */}
        <section className={styles.seccion}>
          <div className={styles.seccionCabecera}>
            <div className={styles.seccionTitulos}>
              <span className="kicker">FIFA World Cup 2026</span>
              <p className={styles.seccionDesc}>Partidos, grupos, eliminatoria y goleadores del Mundial.</p>
            </div>
            <Link to="/futbol" className={styles.seccionBtn}>
              Ver todo <ChevronRight size={13} aria-hidden="true" />
            </Link>
          </div>

          {matches.isPending ? (
            <SkeletonCard count={3} alto={64} />
          ) : matchesMostrar.length > 0 ? (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>{fichaLabel}</span>
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

          <Link to="/futbol" className={styles.seccionCtaFull}>
            Ver fixture completo del Mundial <ChevronRight size={14} aria-hidden="true" />
          </Link>
        </section>

        {/* F1 */}
        <section className={styles.seccion}>
          <div className={styles.seccionCabecera}>
            <div className={styles.seccionTitulos}>
              <span className="kicker">Fórmula 1</span>
              <p className={styles.seccionDesc}>Calendario, resultados y campeonato de la temporada.</p>
            </div>
            <Link to="/f1" className={styles.seccionBtn}>
              Ver todo <ChevronRight size={13} aria-hidden="true" />
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

          <Link to="/f1" className={styles.seccionCtaFull}>
            Ver calendario completo de F1 <ChevronRight size={14} aria-hidden="true" />
          </Link>
        </section>

      </div>

      {modalMatchId && (
        <MatchModal matchId={modalMatchId} onClose={() => setModalMatchId(null)} />
      )}
    </div>
  );
}
