import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import styles from './PlayerSelect.module.css';

export interface PlayerOption {
  id: string;
  name: string;
  position: string;
  age: number | null;
}

interface Props {
  players: PlayerOption[];
  value: string;
  onChange: (id: string) => void;
  loading?: boolean;
}

const LIMITE_LISTA = 200;

function normalizar(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

/** Combobox con autocompletado: escribís nombre/apellido y filtra la lista de jugadores. */
export function PlayerSelect({ players, value, onChange, loading }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const selected = players.find((p) => p.id === value) ?? null;

  // Cuando se cierra el dropdown, el input muestra el nombre del jugador elegido.
  useEffect(() => {
    if (!open) setQuery(selected ? selected.name : '');
  }, [selected, open]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const filtrados = useMemo(() => {
    const q = normalizar(query.trim());
    const base = q ? players.filter((p) => normalizar(p.name).includes(q)) : players;
    return base.slice(0, LIMITE_LISTA);
  }, [players, query]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  function elegir(p: PlayerOption) {
    onChange(p.id);
    setQuery(p.name);
    setOpen(false);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') setOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, filtrados.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const p = filtrados[activeIdx];
      if (p) elegir(p);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  const placeholder = loading
    ? 'Cargando jugadores…'
    : players.length === 0
      ? 'Sin jugadores'
      : 'Buscar jugador…';

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <input
        className={styles.input}
        type="text"
        value={query}
        disabled={loading}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
        role="combobox"
        aria-expanded={open}
        aria-label="Buscar y elegir jugador"
        autoComplete="off"
      />
      {open && !loading && (
        <ul className={styles.lista} role="listbox">
          {filtrados.length === 0 ? (
            <li className={styles.vacio}>Sin resultados</li>
          ) : (
            filtrados.map((p, i) => (
              <li key={p.id} role="option" aria-selected={p.id === value}>
                <button
                  type="button"
                  className={i === activeIdx ? `${styles.opcion} ${styles.activa}` : styles.opcion}
                  onMouseEnter={() => setActiveIdx(i)}
                  onClick={() => elegir(p)}
                >
                  <span className={styles.nombre}>{p.name}</span>
                  <span className={styles.meta}>
                    {p.position}
                    {p.age ? ` · ${p.age} años` : ''}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
