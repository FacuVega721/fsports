import type { CSSProperties } from 'react';
import { ChevronRight } from 'lucide-react';
import type { Team } from '../../lib/types';
import { EmptyState } from '../ui/EmptyState';
import { Flag } from '../ui/Flag';
import styles from './TeamsGrid.module.css';

interface TeamsGridProps {
  teams: Team[];
  /** Al hacer clic en un país (para abrir su detalle) */
  onSelect?: (nombre: string) => void;
}

/** Selecciones participantes, agrupadas por grupo del Mundial. */
export function TeamsGrid({ teams, onSelect }: TeamsGridProps) {
  if (teams.length === 0) {
    return (
      <EmptyState
        titulo="Todavía no hay selecciones cargadas"
        detalle="Cuando se confirmen los participantes y el sorteo de grupos, las vas a ver acá."
      />
    );
  }

  // Agrupar por grupo, preservando orden alfabético de grupo
  const grupos = new Map<string, Team[]>();
  for (const t of teams) {
    const key = t.grupo || '—';
    if (!grupos.has(key)) grupos.set(key, []);
    grupos.get(key)!.push(t);
  }
  const ordenados = [...grupos.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  const total = teams.length;

  return (
    <div className={styles.wrapper}>
      <p className={styles.resumen}>
        <span className={styles.total}>{total}</span> selecciones en {ordenados.length}{' '}
        {ordenados.length === 1 ? 'grupo' : 'grupos'}
      </p>
      <div className={styles.grilla}>
        {ordenados.map(([grupo, equipos], i) => (
          <section
            key={grupo}
            className={`${styles.grupo} stagger`}
            style={{ '--i': i } as CSSProperties}
          >
            <header className={`${styles.cabecera} texture`}>
              <span className="kicker">Grupo {grupo}</span>
            </header>
            <ul className={styles.lista}>
              {equipos.map((t) => (
                <li key={`${grupo}-${t.nombre}`}>
                  <button
                    type="button"
                    className={styles.pais}
                    onClick={() => onSelect?.(t.nombre)}
                  >
                    <Flag code={t.code} title={t.nombre} />
                    <span className={styles.nombre}>{t.nombre}</span>
                    <ChevronRight size={15} className={styles.chevron} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
