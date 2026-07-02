import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Share2 } from 'lucide-react';
import { useSeo } from '../hooks/useSeo';
import { MetricsPanel, type PlayerProfile } from '../components/scout/MetricsPanel';
import { ComparacionPanel } from '../components/scout/ComparacionPanel';
import { PlayerSelect } from '../components/scout/PlayerSelect';
import { ReportView } from '../components/scout/ReportView';
import { Flag } from '../components/ui/Flag';
import { ProgressRing } from '../components/ui/ProgressRing';
import { Tabs } from '../components/ui/Tabs';
import { codigoBandera, paisEspanol } from '../lib/scout/banderas';
import styles from './ScoutPlayerPage.module.css';

type FullProfile = PlayerProfile & { id: string; playerKey: string; score: number };

interface PlayerSummary {
  id: string;
  playerKey: string;
  name: string;
  team: string;
  position: string;
  nationality: string;
  age: number | null;
  competition: string;
  season: string;
  score: number;
}

interface PlayerSample {
  id: string;
  kind: 'comp' | 'agg';
  competition: string;
  season: string;
  minutes: number;
  matches: number;
}

type Locale = 'es' | 'en';
type TabAnalisis = 'percentiles' | 'comparacion';

function sampleLabel(s: PlayerSample): string {
  if (s.kind === 'agg') return `Histórico (${s.season})`;
  return `${s.competition} ${s.season}`;
}

export default function ScoutPlayerPage() {
  const { id } = useParams<{ id: string }>();

  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [estado, setEstado] = useState<'cargando' | 'ok' | 'error'>('cargando');
  const [samples, setSamples] = useState<PlayerSample[]>([]);
  const [sampleId, setSampleId] = useState<string>('');

  const [tab, setTab] = useState<TabAnalisis>('percentiles');
  const [copiado, setCopiado] = useState(false);

  // Informe con IA (mismo flujo que tenía el buscador viejo).
  const [locale, setLocale] = useState<Locale>('es');
  const [report, setReport] = useState<string | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [generando, setGenerando] = useState(false);
  const [errorInforme, setErrorInforme] = useState<string | null>(null);
  const [linkCopiado, setLinkCopiado] = useState(false);

  // Comparación: lista de jugadores para el selector + rival elegido.
  const [todos, setTodos] = useState<PlayerSummary[]>([]);
  const [rivalId, setRivalId] = useState<string>('');
  const [rival, setRival] = useState<FullProfile | null>(null);

  useSeo(
    profile ? `${profile.name} · Scout Intelligence` : 'Scout Intelligence',
    profile
      ? `Perfil de scouting de ${profile.name}: percentiles, comparación y análisis.`
      : 'Perfil de jugador de FSports Scout Intelligence.',
    `/scout/jugador/${id ?? ''}`,
  );

  // La muestra a mostrar arranca en el id de la URL; cambia con el switcher.
  useEffect(() => {
    if (id) setSampleId(id);
  }, [id]);

  // Carga el perfil de la muestra seleccionada.
  useEffect(() => {
    if (!sampleId) return;
    setEstado('cargando');
    setReport(null);
    setReportId(null);
    setErrorInforme(null);
    fetch(`/api/scout/profile?id=${encodeURIComponent(sampleId)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((d: { profile: FullProfile }) => {
        setProfile(d.profile);
        setEstado('ok');
      })
      .catch(() => setEstado('error'));
  }, [sampleId]);

  // Muestras disponibles del jugador (histórico + cada competición).
  useEffect(() => {
    if (!profile?.playerKey) return;
    fetch(`/api/scout/samples?key=${encodeURIComponent(profile.playerKey)}`)
      .then((res) => res.json())
      .then((d: { samples: PlayerSample[] }) => setSamples(d.samples))
      .catch(() => setSamples([]));
  }, [profile?.playerKey]);

  // Lista de jugadores para el selector de comparación (una sola vez, al abrir el tab).
  useEffect(() => {
    if (tab !== 'comparacion' || todos.length > 0) return;
    fetch('/api/scout/search')
      .then((res) => res.json())
      .then((d: { players: PlayerSummary[] }) => setTodos(d.players))
      .catch(() => setTodos([]));
  }, [tab, todos.length]);

  // Carga el perfil del rival elegido.
  useEffect(() => {
    if (!rivalId) {
      setRival(null);
      return;
    }
    fetch(`/api/scout/profile?id=${encodeURIComponent(rivalId)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((d: { profile: FullProfile }) => setRival(d.profile))
      .catch(() => setRival(null));
  }, [rivalId]);

  const rivalesDisponibles = useMemo(
    () => todos.filter((p) => p.playerKey !== profile?.playerKey),
    [todos, profile?.playerKey],
  );

  function compartirFicha() {
    void navigator.clipboard
      .writeText(`${location.origin}/scout/jugador/${sampleId}`)
      .then(() => {
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      })
      .catch(() => {});
  }

  async function generar(loc: Locale) {
    if (!sampleId) return;
    setGenerando(true);
    setErrorInforme(null);
    try {
      const res = await fetch('/api/scout/report', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ playerId: sampleId, locale: loc }),
      });
      const data = (await res.json()) as { id?: string; content?: string; error?: string };
      if (!res.ok || !data.content) throw new Error(data.error ?? 'Error al generar');
      setReport(data.content);
      setReportId(data.id ?? null);
      setLinkCopiado(false);
    } catch (e) {
      setErrorInforme(e instanceof Error ? e.message : 'Error al generar el informe');
    } finally {
      setGenerando(false);
    }
  }

  function cambiarIdioma(loc: Locale) {
    setLocale(loc);
    if (report) void generar(loc);
  }

  if (estado === 'cargando') {
    return (
      <div className={`container ${styles.pagina}`}>
        <p className={styles.estado}>Cargando perfil…</p>
      </div>
    );
  }

  if (estado === 'error' || !profile) {
    return (
      <div className={`container ${styles.pagina}`}>
        <Link to="/scout" className={styles.volver}>
          <ArrowLeft size={15} aria-hidden="true" /> Volver al buscador
        </Link>
        <p className={styles.estado}>
          No encontramos este jugador. El enlace puede ser inválido.
        </p>
      </div>
    );
  }

  return (
    <div className={`container ${styles.pagina}`}>
      <Link to="/scout" className={styles.volver}>
        <ArrowLeft size={15} aria-hidden="true" /> Volver al buscador
      </Link>

      <div className={styles.split}>
        {/* ── Rail de identidad ── */}
        <aside className={styles.rail}>
          <div className={styles.foto} aria-hidden="true">
            <span>FOTO JUGADOR</span>
          </div>

          <div className={styles.identidad}>
            <div className={styles.identidadTop}>
              <Flag code={codigoBandera(profile.nationality)} title={paisEspanol(profile.nationality)} />
              <span className={styles.seleccion}>{paisEspanol(profile.team)}</span>
            </div>
            <h1 className={styles.nombre}>{profile.name}</h1>
            <p className={styles.posEdad}>
              {profile.position}
              {profile.age ? ` · ${profile.age} años` : ''}
            </p>
          </div>

          <div className={styles.scoreBloque}>
            <ProgressRing value={profile.score} size={82} label="Scout Score" />
            <div className={styles.scoreInfo}>
              <span className={styles.scoreLabel}>Scout Score</span>
              <span className={styles.scoreHint}>Percentil promedio de su posición</span>
            </div>
          </div>

          <dl className={styles.datos}>
            {[
              ['Posición', profile.position],
              ['Edad', profile.age ? `${profile.age} años` : '—'],
              ['Partidos', String(profile.matches)],
              ['Minutos', `${Math.round(profile.minutes)}′`],
            ].map(([k, v]) => (
              <div key={k} className={styles.dato}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>

          <button type="button" className={styles.compartirFicha} onClick={compartirFicha}>
            {copiado ? <Check size={15} aria-hidden="true" /> : <Share2 size={15} aria-hidden="true" />}
            {copiado ? '¡Ficha copiada!' : 'Compartir ficha'}
          </button>
        </aside>

        {/* ── Panel de análisis ── */}
        <div className={styles.analisis}>
          {samples.length > 1 && (
            <div className={styles.muestras}>
              {samples.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={sampleId === s.id ? styles.muestraActiva : styles.muestra}
                  onClick={() => setSampleId(s.id)}
                >
                  {sampleLabel(s)}
                  <span className={styles.muestraMin}>{Math.round(s.minutes)}′</span>
                </button>
              ))}
            </div>
          )}

          <Tabs
            label="Análisis del jugador"
            tabs={[
              { id: 'percentiles', label: 'Percentiles' },
              { id: 'comparacion', label: 'Comparación' },
            ]}
            active={tab}
            onChange={(t) => setTab(t as TabAnalisis)}
          />

          <div key={tab} className={styles.fade}>
            {tab === 'percentiles' ? (
              <MetricsPanel profile={profile} />
            ) : (
              <div className={styles.comparacion}>
                <PlayerSelect
                  players={rivalesDisponibles}
                  value={rivalId}
                  onChange={setRivalId}
                  loading={todos.length === 0}
                />
                {rival ? (
                  <ComparacionPanel base={profile} rival={rival} />
                ) : (
                  <p className={styles.comparacionHint}>
                    Elegí un segundo jugador para comparar sus percentiles lado a lado.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Generar informe con IA */}
          <div className={styles.informe}>
            <div className={styles.informeControles}>
              <div className={styles.toggle}>
                {(['es', 'en'] as Locale[]).map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    className={locale === loc ? styles.toggleActivo : ''}
                    onClick={() => cambiarIdioma(loc)}
                  >
                    {loc === 'es' ? 'Español' : 'English'}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className={styles.generar}
                disabled={generando}
                onClick={() => generar(locale)}
              >
                {generando ? 'Generando…' : report ? 'Regenerar informe' : 'Generar informe con IA'}
              </button>
            </div>

            {errorInforme && <p className={styles.error}>{errorInforme}</p>}

            {report && (
              <>
                {reportId && (
                  <div className={styles.compartir}>
                    <a href={`/r/${reportId}`} target="_blank" rel="noopener noreferrer">
                      Ver informe en página propia ↗
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard
                          .writeText(`${location.origin}/r/${reportId}`)
                          .then(() => setLinkCopiado(true));
                      }}
                    >
                      {linkCopiado ? 'Enlace copiado ✓' : 'Copiar enlace'}
                    </button>
                  </div>
                )}
                <ReportView markdown={report} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
