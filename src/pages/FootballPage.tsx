import { useMemo, useState } from 'react';
import { BracketView } from '../components/football/BracketView';
import { KnockoutBracket } from '../components/football/KnockoutBracket';
import { MatchList } from '../components/football/MatchList';
import { StandingsTable } from '../components/football/StandingsTable';
import { TeamDetail } from '../components/football/TeamDetail';
import { TeamsGrid } from '../components/football/TeamsGrid';
import { CopyButton } from '../components/ui/CopyButton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { Tabs } from '../components/ui/Tabs';
import { useMatches, useStandings, useTeams } from '../hooks/useData';
import { dataSource } from '../lib/data';
import { postAgenda } from '../lib/social';
import { hoyArg } from '../lib/time';
import type { Match } from '../lib/types';
import styles from './Page.module.css';

type Seccion = 'grupos' | 'eliminatoria' | 'paises' | 'fixture';
type TabFixture = 'hoy' | 'resultados' | 'proximos';
type VistaElim = 'cuadro' | 'listado';

const MENSAJES_VACIO: Record<TabFixture, { titulo: string; detalle: string }> = {
  hoy: {
    titulo: 'No hay partidos hoy',
    detalle: 'Volvé mañana para más acción, o mirá los próximos en su pestaña.',
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

function filtrarFixture(matches: Match[], tab: TabFixture): Match[] {
  const hoy = hoyArg();
  switch (tab) {
    case 'hoy':
      return matches
        .filter(
          (m) => m.fecha === hoy || m.estado === 'en_vivo' || m.estado === 'entretiempo',
        )
        .sort((a, b) => a.hora.localeCompare(b.hora));
    case 'resultados':
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
  const [seccion, setSeccion] = useState<Seccion>('fixture');
  const [tabFixture, setTabFixture] = useState<TabFixture>('hoy');
  const [vistaElim, setVistaElim] = useState<VistaElim>('cuadro');
  const [paisSel, setPaisSel] = useState<string | null>(null);
  const matches = useMatches();
  const standings = useStandings();
  const teams = useTeams();

  const fixtureFiltrado = useMemo(
    () => filtrarFixture(matches.data ?? [], tabFixture),
    [matches.data, tabFixture],
  );
  const eliminatoria = useMemo(
    () => (matches.data ?? []).filter((m) => m.fase !== 'grupos'),
    [matches.data],
  );
  const teamSel = useMemo(
    () => (teams.data ?? []).find((t) => t.nombre === paisSel) ?? null,
    [teams.data, paisSel],
  );

  return (
    <div className={`container ${styles.pagina}`}>
      {/* Banner de competición */}
      <section className={`${styles.banner} texture`}>
        <span className="kicker">Fútbol · Mundial</span>
        <h1 className={styles.titulo}>{dataSource.futbolTitulo}</h1>
        <p className={styles.subtitulo}>
          La agenda del Mundial: fixture, grupos, eliminatoria y selecciones — hora
          argentina (UTC-3).
        </p>
      </section>

      {/* Navegación entre las 4 secciones (la agenda/fixture primero) */}
      <Tabs
        label="Secciones del Mundial"
        tabs={[
          { id: 'fixture', label: 'Fixture' },
          { id: 'grupos', label: 'Grupos' },
          { id: 'eliminatoria', label: 'Eliminatoria' },
          { id: 'paises', label: 'Países' },
        ]}
        active={seccion}
        onChange={(id) => setSeccion(id as Seccion)}
      />

      <div key={seccion} className={styles.fade}>
        {/* ─── GRUPOS ─── */}
        {seccion === 'grupos' &&
          (standings.isPending ? (
            <SkeletonCard count={6} alto={180} />
          ) : standings.isError ? (
            <ErrorState
              titulo="Posiciones no disponibles"
              onRetry={() => standings.refetch()}
            />
          ) : (standings.data ?? []).length === 0 ? (
            <EmptyState
              titulo="Sin grupos todavía"
              detalle="Las tablas aparecen cuando arranca la competición."
            />
          ) : (
            <StandingsTable standings={standings.data ?? []} />
          ))}

        {/* ─── ELIMINATORIA ─── */}
        {seccion === 'eliminatoria' &&
          (matches.isPending ? (
            <SkeletonCard count={4} alto={92} />
          ) : matches.isError ? (
            <ErrorState onRetry={() => matches.refetch()} />
          ) : (
            <div className={styles.fixture}>
              <Tabs
                label="Vista de eliminatoria"
                tabs={[
                  { id: 'cuadro', label: 'Cuadro' },
                  { id: 'listado', label: 'Listado' },
                ]}
                active={vistaElim}
                onChange={(id) => setVistaElim(id as VistaElim)}
              />
              <div key={vistaElim} className={styles.fade}>
                {vistaElim === 'cuadro' ? (
                  <BracketView matches={eliminatoria} />
                ) : (
                  <KnockoutBracket matches={eliminatoria} />
                )}
              </div>
            </div>
          ))}

        {/* ─── PAÍSES ─── */}
        {seccion === 'paises' &&
          (teams.isPending ? (
            <SkeletonCard count={6} alto={180} />
          ) : teams.isError ? (
            <ErrorState
              titulo="Selecciones no disponibles"
              onRetry={() => teams.refetch()}
            />
          ) : teamSel ? (
            <TeamDetail
              team={teamSel}
              matches={matches.data ?? []}
              onBack={() => setPaisSel(null)}
            />
          ) : (
            <TeamsGrid teams={teams.data ?? []} onSelect={setPaisSel} />
          ))}

        {/* ─── FIXTURE ─── */}
        {seccion === 'fixture' && (
          <div className={styles.fixture}>
            <div className={styles.fixtureToolbar}>
              <Tabs
                label="Filtro de partidos"
                tabs={[
                  { id: 'hoy', label: 'Hoy' },
                  { id: 'resultados', label: 'Resultados' },
                  { id: 'proximos', label: 'Próximos' },
                ]}
                active={tabFixture}
                onChange={(id) => setTabFixture(id as TabFixture)}
              />
              {tabFixture !== 'resultados' && fixtureFiltrado.length > 0 && (
                <CopyButton
                  text={postAgenda(fixtureFiltrado, tabFixture === 'hoy')}
                  label="Copiar agenda"
                />
              )}
            </div>
            <div key={tabFixture} className={styles.fade}>
              {matches.isPending ? (
                <SkeletonCard count={4} alto={92} />
              ) : matches.isError ? (
                <ErrorState onRetry={() => matches.refetch()} />
              ) : fixtureFiltrado.length === 0 ? (
                <EmptyState
                  titulo={MENSAJES_VACIO[tabFixture].titulo}
                  detalle={MENSAJES_VACIO[tabFixture].detalle}
                />
              ) : (
                <MatchList matches={fixtureFiltrado} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
