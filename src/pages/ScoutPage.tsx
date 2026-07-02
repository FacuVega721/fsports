import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useSeo } from '../hooks/useSeo';
import { FlagSelect } from '../components/scout/FlagSelect';
import { Flag } from '../components/ui/Flag';
import { ProgressRing } from '../components/ui/ProgressRing';
import { EmptyState } from '../components/ui/EmptyState';
import { codigoBandera, paisEspanol } from '../lib/scout/banderas';
import styles from './ScoutPage.module.css';

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

type Orden = 'score' | 'edad' | 'nombre';

const GRUPOS: { value: string; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'GK', label: 'Arqueros' },
  { value: 'DEF', label: 'Defensores' },
  { value: 'MID', label: 'Volantes' },
  { value: 'FWD', label: 'Delanteros' },
];

const ORDENES: { value: Orden; label: string }[] = [
  { value: 'score', label: 'Scout Score' },
  { value: 'edad', label: 'Edad' },
  { value: 'nombre', label: 'Nombre' },
];

/** Quita tildes para comparar en el filtro de texto (Mastantuono ≈ mastantuono). */
function normalizar(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

export default function ScoutPage() {
  useSeo(
    'FSports Scout Intelligence',
    'Descubrí y compará el rendimiento de cada talento: sus puntos fuertes y oportunidades de mejora.',
    '/scout',
  );

  const [grupo, setGrupo] = useState('');
  const [nacion, setNacion] = useState('');
  const [nacionesDisp, setNacionesDisp] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [orden, setOrden] = useState<Orden>('score');
  const [players, setPlayers] = useState<PlayerSummary[]>([]);
  const [cargando, setCargando] = useState(false);
  const [cargaError, setCargaError] = useState(false);

  // Nacionalidades para el filtro (una sola vez).
  useEffect(() => {
    fetch('/api/scout/nationalities')
      .then((res) => res.json())
      .then((d: { nationalities: string[] }) => setNacionesDisp(d.nationalities))
      .catch(() => setNacionesDisp([]));
  }, []);

  // Trae la lista según posición + nacionalidad (server-side). El texto y el
  // orden se aplican en el cliente para respuesta instantánea.
  useEffect(() => {
    const params = new URLSearchParams();
    if (grupo) params.set('group', grupo);
    if (nacion) params.set('nat', nacion);
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
  }, [grupo, nacion]);

  const visibles = useMemo(() => {
    const q = normalizar(query.trim());
    const filtrados = q
      ? players.filter(
          (p) => normalizar(p.name).includes(q) || normalizar(p.team).includes(q),
        )
      : players;
    const ordenados = [...filtrados];
    ordenados.sort((a, b) => {
      if (orden === 'score') return b.score - a.score;
      if (orden === 'edad') return (a.age ?? 999) - (b.age ?? 999);
      return a.name.localeCompare(b.name);
    });
    return ordenados;
  }, [players, query, orden]);

  return (
    <div className={`container ${styles.pagina}`}>
      <header className={styles.hero}>
        <span className="kicker">Scout Intelligence</span>
        <h1 className={styles.titulo}>Buscador de jugadores</h1>
        <p className={styles.sub}>
          Explorá el rendimiento de cada talento y abrí su ficha para ver el análisis completo.
        </p>
      </header>

      {/* Controles: búsqueda + nacionalidad + orden */}
      <div className={styles.fila}>
        <div className={styles.buscador}>
          <Search size={16} aria-hidden="true" className={styles.buscadorIcono} />
          <input
            type="search"
            className={styles.buscadorInput}
            placeholder="Buscar por nombre o selección…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar jugador"
          />
        </div>
        <FlagSelect value={nacion} options={nacionesDisp} onChange={setNacion} />
        <select
          className={styles.filtro}
          value={orden}
          onChange={(e) => setOrden(e.target.value as Orden)}
          aria-label="Ordenar por"
        >
          {ORDENES.map((o) => (
            <option key={o.value} value={o.value}>
              Ordenar: {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Chips de posición */}
      <div className={styles.chips}>
        {GRUPOS.map((g) => (
          <button
            key={g.value}
            type="button"
            className={grupo === g.value ? styles.chipActivo : styles.chip}
            onClick={() => setGrupo(g.value)}
          >
            {g.label}
          </button>
        ))}
      </div>

      {cargaError ? (
        <p className={styles.error}>
          No se pudieron cargar los jugadores. Si estás en desarrollo local, asegurate de
          tener corriendo el API de Scout (<code>npm run scout:dev</code>).
        </p>
      ) : (
        <>
          <div className={styles.contador}>
            {cargando ? 'Cargando…' : `${visibles.length} jugadores`}
          </div>

          {!cargando && visibles.length === 0 ? (
            <EmptyState
              titulo="Sin jugadores"
              detalle="No hay jugadores con esos filtros. Probá con otra combinación."
            />
          ) : (
            <div className={styles.tabla}>
              <div className={`${styles.filaTabla} ${styles.cabeceraTabla}`}>
                <span className={styles.colNum}>#</span>
                <span>Jugador</span>
                <span className={styles.colPos}>Posición</span>
                <span className={styles.colEdad}>Edad</span>
                <span className={styles.colScore}>Scout Score</span>
              </div>
              {visibles.map((p, i) => (
                <Link
                  key={p.id}
                  to={`/scout/jugador/${p.id}`}
                  className={`${styles.filaTabla} ${styles.filaJugador}`}
                >
                  <span className={styles.colNum}>{i + 1}</span>
                  <span className={styles.jugadorCell}>
                    <Flag code={codigoBandera(p.nationality)} title={paisEspanol(p.nationality)} />
                    <span className={styles.jugadorInfo}>
                      <span className={styles.jugadorNombre}>{p.name}</span>
                      <span className={styles.jugadorClub}>{p.team}</span>
                    </span>
                  </span>
                  <span className={`${styles.colPos} ${styles.badgePos}`}>{p.position}</span>
                  <span className={styles.colEdad}>{p.age ?? '—'}</span>
                  <span className={styles.colScore}>
                    <ProgressRing value={p.score} size={42} label="Scout Score" />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
