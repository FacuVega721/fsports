import { useEffect, useState } from 'react';
import { useSeo } from '../hooks/useSeo';
import { ReportView } from '../components/scout/ReportView';
import { MetricsPanel, type PlayerProfile } from '../components/scout/MetricsPanel';
import { FlagSelect } from '../components/scout/FlagSelect';
import { PlayerSelect } from '../components/scout/PlayerSelect';
import { Flag } from '../components/ui/Flag';
import { codigoBandera, paisEspanol } from '../lib/scout/banderas';
import styles from './ScoutPage.module.css';

type Locale = 'es' | 'en';

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
}

interface PlayerSample {
  id: string;
  kind: 'comp' | 'agg';
  competition: string;
  season: string;
  minutes: number;
  matches: number;
}

function sampleLabel(s: PlayerSample): string {
  if (s.kind === 'agg') return `Histórico (${s.season})`;
  return `${s.competition} ${s.season}`;
}

const GRUPOS: { value: string; label: string }[] = [
  { value: '', label: 'Selecciona posición' },
  { value: 'GK', label: 'Arqueros' },
  { value: 'DEF', label: 'Defensores' },
  { value: 'MID', label: 'Mediocampistas' },
  { value: 'FWD', label: 'Delanteros' },
];

export default function ScoutPage() {
  useSeo(
    'FSports Scout Intelligence',
    'Descubrí la performance de cada talento de manera individual, sus puntos fuertes y oportunidades de mejora.',
    '/scout',
  );

  const [grupo, setGrupo] = useState('');
  const [nacion, setNacion] = useState('');
  const [nacionesDisp, setNacionesDisp] = useState<string[]>([]);
  const [players, setPlayers] = useState<PlayerSummary[]>([]);
  const [cargando, setCargando] = useState(false);
  const [cargaError, setCargaError] = useState(false);
  const [selected, setSelected] = useState<PlayerSummary | null>(null);
  const [samples, setSamples] = useState<PlayerSample[]>([]);
  const [sampleId, setSampleId] = useState<string>('');
  const [locale, setLocale] = useState<Locale>('es');
  const [report, setReport] = useState<string | null>(null);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Nacionalidades disponibles para el filtro (una sola vez).
  useEffect(() => {
    fetch('/api/scout/nationalities')
      .then((res) => res.json())
      .then((d: { nationalities: string[] }) => setNacionesDisp(d.nationalities))
      .catch(() => setNacionesDisp([]));
  }, []);

  // Trae la lista de jugadores con los filtros dados (no auto-aplica: se dispara
  // con el botón Buscar o al limpiar). En la carga inicial trae todos.
  function buscar(g = grupo, n = nacion) {
    const params = new URLSearchParams();
    if (g) params.set('group', g);
    if (n) params.set('nat', n);
    setCargando(true);
    setCargaError(false);
    fetch(`/api/scout/search?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((d: { players: PlayerSummary[] }) => setPlayers(d.players))
      .catch(() => {
        setPlayers([]);
        setCargaError(true);
      })
      .finally(() => setCargando(false));
    setSelected(null);
    setSamples([]);
    setSampleId('');
    setReport(null);
    setProfile(null);
  }

  function limpiarFiltros() {
    setGrupo('');
    setNacion('');
    buscar('', '');
  }

  // Carga inicial: todos los jugadores.
  useEffect(() => {
    buscar('', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function elegir(id: string) {
    const p = players.find((x) => x.id === id) ?? null;
    setSelected(p);
    setReport(null);
    setProfile(null);
    setReportId(null);
    setError(null);
    setSamples([]);
    setSampleId('');
    if (!p) return;
    // Traer las muestras del jugador (histórico + cada competición).
    fetch(`/api/scout/samples?key=${encodeURIComponent(p.playerKey)}`)
      .then((res) => res.json())
      .then((d: { samples: PlayerSample[] }) => {
        setSamples(d.samples);
        setSampleId(d.samples[0]?.id ?? p.id); // histórico primero
      })
      .catch(() => setSampleId(p.id));
  }

  // El panel de métricas (percentiles desde D1) se carga solo, sin pasar por
  // Claude: es gratis. El informe con IA queda como acción aparte (botón).
  useEffect(() => {
    if (!sampleId) return;
    setReport(null);
    setReportId(null);
    setError(null);
    fetch(`/api/scout/profile?id=${encodeURIComponent(sampleId)}`)
      .then((res) => res.json())
      .then((d: { profile?: PlayerProfile }) => setProfile(d.profile ?? null))
      .catch(() => setProfile(null));
  }, [sampleId]);

  async function generar(loc: Locale) {
    const targetId = sampleId || selected?.id;
    if (!targetId) return;
    setGenerando(true);
    setError(null);
    try {
      const res = await fetch('/api/scout/report', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ playerId: targetId, locale: loc }),
      });
      const data = (await res.json()) as {
        id?: string;
        content?: string;
        profile?: PlayerProfile;
        error?: string;
      };
      if (!res.ok || !data.content) throw new Error(data.error ?? 'Error al generar');
      setReport(data.content);
      setProfile(data.profile ?? null);
      setReportId(data.id ?? null);
      setCopiado(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al generar el informe');
    } finally {
      setGenerando(false);
    }
  }

  function cambiarIdioma(loc: Locale) {
    setLocale(loc);
    if (selected && report) void generar(loc);
  }

  return (
    <div className={`container ${styles.pagina}`}>
      <header className={styles.hero}>
        <span className="kicker">Scout Intelligence</span>
        <h1 className={styles.titulo}>Analizá jugadores con el ojo de un profesional</h1>
        <p className={styles.sub}>
          Descubrí la performance de cada talento de manera individual, sus
          puntos fuertes y oportunidades de mejora.
        </p>
      </header>

      {/* Filtros */}
      <div className={styles.fila}>
        <select
          className={styles.filtro}
          value={grupo}
          onChange={(e) => setGrupo(e.target.value)}
          aria-label="Filtrar por posición"
        >
          {GRUPOS.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>

        <FlagSelect value={nacion} options={nacionesDisp} onChange={setNacion} />

        <button type="button" className={styles.buscar} onClick={() => buscar()}>
          Buscar
        </button>
        {(grupo || nacion) && (
          <button type="button" className={styles.limpiar} onClick={limpiarFiltros}>
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Selección de jugador */}
      <div className={styles.fila}>
        <PlayerSelect
          players={players}
          value={selected?.id ?? ''}
          onChange={elegir}
          loading={cargando}
        />
      </div>

      {cargaError && (
        <p className={styles.error}>
          No se pudieron cargar los jugadores. Si estás en desarrollo local,
          asegurate de tener corriendo el API de Scout
          (<code>npm run scout:dev</code> en otra terminal).
        </p>
      )}
      {!cargaError && !cargando && players.length === 0 && (grupo || nacion) && (
        <p className={styles.vacio}>
          No hay jugadores con esos filtros. Probá con otra combinación o limpiá
          los filtros.
        </p>
      )}

      {selected && (
        <div className={styles.ficha}>
          <Flag code={codigoBandera(selected.nationality)} title={paisEspanol(selected.nationality)} />
          <div className={styles.fichaInfo}>
            <span className={styles.fichaNombre}>{selected.name}</span>
            <span className={styles.fichaMeta}>
              {paisEspanol(selected.nationality)} · {selected.position}
              {selected.age ? ` · ${selected.age} años` : ''}
            </span>
          </div>
        </div>
      )}

      {selected && samples.length > 1 && (
        <div className={styles.muestras}>
          <span className={styles.muestrasLabel}>
            Analizar al jugador en:
          </span>
          <div className={styles.muestrasOpts}>
            {samples.map((s) => (
              <button
                key={s.id}
                type="button"
                className={sampleId === s.id ? styles.muestraActiva : styles.muestra}
                onClick={() => {
                  setSampleId(s.id);
                  setReport(null);
                  setProfile(null);
                  setReportId(null);
                }}
              >
                {sampleLabel(s)}
                <span className={styles.muestraMin}>{Math.round(s.minutes)}′</span>
              </button>
            ))}
          </div>
          <span className={styles.muestrasHint}>
            <strong>Histórico</strong> combina todas sus competiciones; o elegí una
            en particular para ver su rendimiento en ese torneo.
          </span>
        </div>
      )}

      {selected && (
        <div className={styles.controles}>
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
            {generando
              ? 'Generando…'
              : report
                ? 'Regenerar informe'
                : 'Generar informe'}
          </button>
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      {profile && <MetricsPanel profile={profile} />}

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
                    .then(() => setCopiado(true));
                }}
              >
                {copiado ? 'Enlace copiado ✓' : 'Copiar enlace'}
              </button>
            </div>
          )}
          <ReportView markdown={report} />
        </>
      )}
    </div>
  );
}
