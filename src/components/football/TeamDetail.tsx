import { ArrowLeft } from 'lucide-react';
import type { Match, Posicion, TeamFull } from '../../lib/types';
import { Flag } from '../ui/Flag';
import { MatchList } from './MatchList';
import { EmptyState } from '../ui/EmptyState';
import styles from './TeamDetail.module.css';

interface TeamDetailProps {
  team: TeamFull;
  /** Todos los partidos (se filtran los de este equipo) */
  matches: Match[];
  onBack: () => void;
}

const ORDEN_POS: Posicion[] = ['Arquero', 'Defensor', 'Mediocampista', 'Delantero', 'Otro'];
const PLURAL: Record<Posicion, string> = {
  Arquero: 'Arqueros',
  Defensor: 'Defensores',
  Mediocampista: 'Mediocampistas',
  Delantero: 'Delanteros',
  Otro: 'Otros',
};

export function TeamDetail({ team, matches, onBack }: TeamDetailProps) {
  const susPartidos = matches
    .filter((m) => m.local === team.nombre || m.visitante === team.nombre)
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora));

  // Agrupar plantel por posición, en orden
  const porPosicion = ORDEN_POS.map((pos) => ({
    pos,
    jugadores: team.squad.filter((j) => j.posicion === pos),
  })).filter((g) => g.jugadores.length > 0);

  return (
    <div className={styles.detalle}>
      <button className={styles.volver} onClick={onBack}>
        <ArrowLeft size={15} aria-hidden="true" />
        Volver a países
      </button>

      <header className={`${styles.cabecera} texture`}>
        <Flag code={team.code} title={team.nombre} />
        <div>
          <h2 className={styles.nombre}>{team.nombre}</h2>
          <p className={styles.meta}>
            {team.grupo ? `Grupo ${team.grupo}` : 'Mundial 2026'}
            {team.dt && (
              <>
                {' · '}
                <span className={styles.dt}>DT: {team.dt}</span>
              </>
            )}
          </p>
        </div>
      </header>

      {/* Partidos del equipo */}
      <section className={styles.bloque}>
        <h3 className={styles.tituloBloque}>
          <span className="kicker">Partidos</span>
        </h3>
        {susPartidos.length > 0 ? (
          <MatchList matches={susPartidos} />
        ) : (
          <EmptyState
            titulo="Sin partidos cargados"
            detalle="Cuando se publique el fixture del equipo, sus partidos aparecen acá."
          />
        )}
      </section>

      {/* Plantel */}
      <section className={styles.bloque}>
        <h3 className={styles.tituloBloque}>
          <span className="kicker">Plantel</span>
        </h3>
        {porPosicion.length > 0 ? (
          <div className={styles.plantel}>
            {porPosicion.map((grupo) => (
              <div key={grupo.pos} className={styles.lineaPos}>
                <h4 className={styles.posTitulo}>{PLURAL[grupo.pos]}</h4>
                <ul className={styles.jugadores}>
                  {grupo.jugadores.map((j) => (
                    <li key={j.nombre} className={styles.jugador}>
                      <span className={styles.jugadorInfo}>
                        {j.dorsal !== null && <span className={styles.dorsal}>{j.dorsal}</span>}
                        <span className={styles.jugadorNombre}>{j.nombre}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            titulo="Plantel no disponible"
            detalle="La lista de jugadores se muestra cuando la web usa datos en vivo (modo API)."
          />
        )}
      </section>
    </div>
  );
}
