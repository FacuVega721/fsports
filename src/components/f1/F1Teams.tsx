import { useState } from 'react';
import type { CSSProperties } from 'react';
import { ArrowLeft, ChevronRight, ExternalLink } from 'lucide-react';
import type { F1Team } from '../../lib/types';
import { EmptyState } from '../ui/EmptyState';
import { Flag } from '../ui/Flag';
import styles from './F1Teams.module.css';

interface F1TeamsProps {
  teams: F1Team[];
}

export function F1Teams({ teams }: F1TeamsProps) {
  const [sel, setSel] = useState<string | null>(null);
  const team = teams.find((t) => t.id === sel) ?? null;

  if (teams.length === 0) {
    return (
      <EmptyState
        titulo="Equipos no disponibles"
        detalle="El detalle de las escuderías se muestra con datos en vivo (modo API)."
      />
    );
  }

  // ── Detalle de un equipo ──
  if (team) {
    return (
      <div className={styles.detalle}>
        <button className={styles.volver} onClick={() => setSel(null)}>
          <ArrowLeft size={15} aria-hidden="true" />
          Volver a equipos
        </button>

        <header className={`${styles.cabecera} texture`}>
          <span className={styles.posBig}>{team.pos}°</span>
          <div className={styles.cabeceraInfo}>
            <h2 className={styles.nombre}>
              <Flag code={team.nacionalidadCode} title={team.nacionalidad} />
              {team.nombre}
            </h2>
            <p className={styles.meta}>
              {team.nacionalidad} · <span className={styles.pts}>{team.puntos} pts</span>
            </p>
          </div>
        </header>

        {team.historial && <p className={styles.historial}>{team.historial}</p>}

        <h3 className={styles.subtitulo}>
          <span className="kicker">Pilotos</span>
        </h3>
        <div className={styles.pilotos}>
          {team.pilotos.map((p) => (
            <div key={p.code || p.nombre} className={styles.piloto}>
              <span className={styles.dorsal}>{p.numero || '–'}</span>
              <Flag code={p.nacionalidadCode} title={p.nacionalidad} />
              <div className={styles.pilotoInfo}>
                <span className={styles.pilotoNombre}>{p.nombre}</span>
                <span className={styles.pilotoMeta}>
                  {p.code}
                  {p.edad !== null ? ` · ${p.edad} años` : ''}
                </span>
              </div>
              <span className={styles.pilotoPts}>{p.puntos} pts</span>
            </div>
          ))}
        </div>

        {team.wikipedia && (
          <a className={styles.wiki} href={team.wikipedia} target="_blank" rel="noopener noreferrer">
            Más sobre {team.nombre} en Wikipedia
            <ExternalLink size={13} aria-hidden="true" />
          </a>
        )}
      </div>
    );
  }

  // ── Grilla de equipos ──
  return (
    <div className={styles.grilla}>
      {teams.map((t, i) => (
        <button
          key={t.id}
          className={`${styles.card} stagger`}
          style={{ '--i': i } as CSSProperties}
          onClick={() => setSel(t.id)}
        >
          <span className={styles.pos}>{t.pos}°</span>
          <Flag code={t.nacionalidadCode} title={t.nacionalidad} />
          <div className={styles.cardInfo}>
            <span className={styles.cardNombre}>{t.nombre}</span>
            <span className={styles.cardPilotos}>
              {t.pilotos.map((p) => p.code).filter(Boolean).join(' · ') || t.nacionalidad}
            </span>
          </div>
          <span className={styles.cardPts}>{t.puntos}</span>
          <ChevronRight size={15} className={styles.chevron} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
