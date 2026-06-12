import { ArrowLeft } from 'lucide-react';
import type { Match, StandingGroup } from '../../lib/types';
import { EmptyState } from '../ui/EmptyState';
import { MatchList } from './MatchList';
import { StandingsTable } from './StandingsTable';
import styles from './GroupDetail.module.css';

interface GroupDetailProps {
  grupo: string;
  standings: StandingGroup[];
  matches: Match[];
  onBack: () => void;
}

/** Zoom de un grupo: su tabla de posiciones + todos sus partidos fecha a fecha. */
export function GroupDetail({ grupo, standings, matches, onBack }: GroupDetailProps) {
  const tabla = standings.find((g) => g.grupo === grupo);
  const partidos = matches
    .filter((m) => m.fase === 'grupos' && m.grupo === grupo)
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora));

  return (
    <div className={styles.detalle}>
      <button className={styles.volver} onClick={onBack}>
        <ArrowLeft size={15} aria-hidden="true" />
        Volver a grupos
      </button>

      <header className={`${styles.cabecera} texture`}>
        <span className="kicker">Fase de grupos</span>
        <h2 className={styles.titulo}>Grupo {grupo}</h2>
      </header>

      <section className={styles.bloque}>
        <h3 className={styles.subtitulo}>
          <span className="kicker">Posiciones</span>
        </h3>
        {tabla ? (
          <StandingsTable standings={[tabla]} />
        ) : (
          <EmptyState titulo="Sin posiciones" detalle="Todavía no hay tabla para este grupo." />
        )}
      </section>

      <section className={styles.bloque}>
        <h3 className={styles.subtitulo}>
          <span className="kicker">Resultados y fixture</span>
        </h3>
        {partidos.length > 0 ? (
          <MatchList matches={partidos} />
        ) : (
          <EmptyState
            titulo="Sin partidos"
            detalle="Cuando se publique el fixture del grupo, los partidos aparecen acá."
          />
        )}
      </section>
    </div>
  );
}
