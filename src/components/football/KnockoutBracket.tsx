import type { CSSProperties } from 'react';
import type { FasePartido, Match } from '../../lib/types';
import { EmptyState } from '../ui/EmptyState';
import { MatchCard } from './MatchCard';
import styles from './KnockoutBracket.module.css';

interface KnockoutBracketProps {
  matches: Match[];
}

/** Orden y etiqueta de cada ronda eliminatoria. */
const RONDAS: Array<{ fase: FasePartido; label: string }> = [
  { fase: 'dieciseisavos', label: 'Dieciseisavos de final' },
  { fase: 'octavos', label: 'Octavos de final' },
  { fase: 'cuartos', label: 'Cuartos de final' },
  { fase: 'semifinal', label: 'Semifinales' },
  { fase: 'tercer_puesto', label: 'Tercer puesto' },
  { fase: 'final', label: 'Final' },
];

/**
 * Cuadro de eliminatoria: una columna por ronda, con sus partidos.
 * En desktop las rondas se ven lado a lado (scroll horizontal si hace falta);
 * en mobile se apilan. Reutiliza MatchCard para mantener la estética.
 */
export function KnockoutBracket({ matches }: KnockoutBracketProps) {
  const porRonda = RONDAS.map((r) => ({
    ...r,
    partidos: matches
      .filter((m) => m.fase === r.fase)
      .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora)),
  })).filter((r) => r.partidos.length > 0);

  if (porRonda.length === 0) {
    return (
      <EmptyState
        titulo="La eliminatoria todavía no arrancó"
        detalle="Cuando termine la fase de grupos, acá va a aparecer el cuadro de llaves: dieciseisavos, octavos, cuartos, semis y la final."
      />
    );
  }

  return (
    <div className={styles.cuadro}>
      {porRonda.map((ronda, i) => (
        <section
          key={ronda.fase}
          className={`${styles.columna} stagger`}
          style={{ '--i': i } as CSSProperties}
        >
          <header className={`${styles.cabecera} texture`}>
            <span className="kicker">{ronda.label}</span>
          </header>
          <div className={styles.partidos}>
            {ronda.partidos.map((m, j) => (
              <MatchCard key={m.id} match={m} index={j} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
