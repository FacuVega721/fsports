import { useMemo, useState } from 'react';
import { MatchList } from '../components/football/MatchList';
import { StandingsTable } from '../components/football/StandingsTable';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { Tabs } from '../components/ui/Tabs';
import { useMatches, useStandings } from '../hooks/useData';
import { dataSource } from '../lib/data';
import { hoyArg } from '../lib/time';
import type { Match } from '../lib/types';
import styles from './Page.module.css';

type TabFutbol = 'hoy' | 'resultados' | 'proximos';

const MENSAJES_VACIO: Record<TabFutbol, { titulo: string; detalle: string }> = {
  hoy: {
    titulo: 'No hay partidos hoy',
    detalle: 'Volvé mañana para más acción. Mirá los próximos en la pestaña Próximos.',
  },
  resultados: {
    titulo: 'Todavía no hay resultados',
    detalle: 'Cuando se jueguen los primeros partidos, los vas a ver acá.',
  },
  proximos: {
    titulo: 'No hay partidos programados',
    detalle: 'El fixture se actualiza apenas se confirmen las próximas fechas.',
  },
};

function filtrar(matches: Match[], tab: TabFutbol): Match[] {
  const hoy = hoyArg();
  switch (tab) {
    case 'hoy':
      // Partidos del día + todo lo que esté en vivo
      return matches
        .filter((m) => m.fecha === hoy || m.estado === 'en_vivo')
        .sort((a, b) => a.hora.localeCompare(b.hora));
    case 'resultados':
      // Más recientes primero
      return matches
        .filter((m) => m.estado === 'finalizado')
        .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.hora.localeCompare(a.hora));
    case 'proximos':
      return matches
        .filter((m) => m.estado === 'programado' && m.fecha >= hoy)
        .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora));
  }
}

export default function FootballPage() {
  const [tab, setTab] = useState<TabFutbol>('hoy');
  const matches = useMatches();
  const standings = useStandings();

  const filtrados = useMemo(
    () => filtrar(matches.data ?? [], tab),
    [matches.data, tab],
  );

  return (
    <div className={`container ${styles.pagina}`}>
      {/* Banner de competición */}
      <section className={`${styles.banner} texture`}>
        <span className="kicker">Fútbol · Fase de grupos</span>
        <h1 className={styles.titulo}>{dataSource.futbolTitulo}</h1>
        <p className={styles.subtitulo}>
          Fixtures, resultados y posiciones — hora argentina (UTC-3).
        </p>
      </section>

      <div className={styles.columnas}>
        <main className={styles.principal}>
          <Tabs
            label="Filtro de partidos"
            tabs={[
              { id: 'hoy', label: 'Hoy' },
              { id: 'resultados', label: 'Resultados' },
              { id: 'proximos', label: 'Próximos' },
            ]}
            active={tab}
            onChange={(id) => setTab(id as TabFutbol)}
          />

          <div key={tab} className={styles.fade}>
            {matches.isPending ? (
              <SkeletonCard count={4} alto={92} />
            ) : matches.isError ? (
              <ErrorState onRetry={() => matches.refetch()} />
            ) : filtrados.length === 0 ? (
              <EmptyState
                titulo={MENSAJES_VACIO[tab].titulo}
                detalle={MENSAJES_VACIO[tab].detalle}
              />
            ) : (
              <MatchList matches={filtrados} />
            )}
          </div>
        </main>

        <aside className={styles.lateral} aria-label="Tabla de posiciones">
          {standings.isPending ? (
            <SkeletonCard count={2} alto={180} />
          ) : standings.isError ? (
            <ErrorState
              titulo="Posiciones no disponibles"
              detalle="No pudimos traer las tablas. Probá de nuevo."
              onRetry={() => standings.refetch()}
            />
          ) : (standings.data ?? []).length === 0 ? (
            <EmptyState
              titulo="Sin posiciones todavía"
              detalle="Las tablas aparecen cuando arranca la competición."
            />
          ) : (
            <StandingsTable standings={standings.data ?? []} />
          )}
        </aside>
      </div>
    </div>
  );
}
