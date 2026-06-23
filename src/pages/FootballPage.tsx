import { useMemo, useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { EstadisticasTorneo } from '../components/football/EstadisticasTorneo';
import { SimuladorBracket } from '../components/football/SimuladorBracket';
import { Goleadores } from '../components/football/Goleadores';
import { GroupDetail } from '../components/football/GroupDetail';
import { KnockoutBracket } from '../components/football/KnockoutBracket';
import { MatchList } from '../components/football/MatchList';
import { MatchModal } from '../components/football/MatchModal';
import { RankingTerceros } from '../components/football/RankingTerceros';
import { Simulador } from '../components/football/Simulador';
import { StandingsTable } from '../components/football/StandingsTable';
import { TeamDetail } from '../components/football/TeamDetail';
import { TeamsGrid } from '../components/football/TeamsGrid';
import { CopyButton } from '../components/ui/CopyButton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { Tabs } from '../components/ui/Tabs';
import { useMatches, useScorers, useStandings, useTeams } from '../hooks/useData';
import { dataSource } from '../lib/data';
import { mejoresTerceros } from '../lib/simulator/terceros';
import { marcarReales, overridesReales, simularTorneo } from '../lib/simulator/simular';
import { postAgenda } from '../lib/social';
import { hoyArg } from '../lib/time';
import type { Match } from '../lib/types';
import styles from './Page.module.css';

type Seccion = 'fixture' | 'grupos' | 'eliminatoria' | 'goleadores' | 'paises' | 'simulador';
type TabFixture = 'hoy' | 'resultados' | 'proximos';
type VistaElim = 'cuadro' | 'listado';
type SubEstadisticas = 'resumen' | 'goleadores' | 'ranking';

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

/** Jornada de la fase de grupos a destacar: la del partido en vivo, o la
 *  del próximo programado, o la del último finalizado si ya terminó todo. */
function jornadaActual(matches: Match[]): number | null {
  const grupos = matches.filter(
    (m): m is Match & { jornada: number } => m.fase === 'grupos' && m.jornada !== null,
  );
  if (grupos.length === 0) return null;

  const enVivo = grupos.find((m) => m.estado === 'en_vivo' || m.estado === 'entretiempo');
  if (enVivo) return enVivo.jornada;

  const proximos = grupos
    .filter((m) => m.estado === 'programado')
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora));
  if (proximos.length > 0) return proximos[0].jornada;

  const finalizados = grupos
    .filter((m) => m.estado === 'finalizado')
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
  return finalizados[0]?.jornada ?? null;
}

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
  const { isAdmin } = useAdmin();
  const [seccion, setSeccion] = useState<Seccion>('fixture');
  const [tabFixture, setTabFixture] = useState<TabFixture>('hoy');
  const [vistaElim, setVistaElim] = useState<VistaElim>('cuadro');
  const [subEstadisticas, setSubEstadisticas] = useState<SubEstadisticas>('resumen');
  const [paisSel, setPaisSel] = useState<string | null>(null);
  const [grupoSel, setGrupoSel] = useState<string | null>(null);
  const [modalMatchId, setModalMatchId] = useState<string | null>(null);
  const matches = useMatches();
  const standings = useStandings();
  const scorers = useScorers();
  const teams = useTeams();

  // Abrir el detalle de un grupo (desde el título del grupo o desde un partido)
  function verGrupo(grupo: string) {
    setGrupoSel(grupo);
    setSeccion('grupos');
  }

  // Abrir el detalle de un país (desde el nombre de un equipo en cualquier lado)
  function verPais(nombre: string) {
    setPaisSel(nombre);
    setGrupoSel(null);
    setSeccion('paises');
  }

  const fixtureFiltrado = useMemo(
    () => filtrarFixture(matches.data ?? [], tabFixture),
    [matches.data, tabFixture],
  );
  const eliminatoria = useMemo(
    () => (matches.data ?? []).filter((m) => m.fase !== 'grupos'),
    [matches.data],
  );
  const terceros = useMemo(() => mejoresTerceros(standings.data ?? []), [standings.data]);
  const proyeccion = useMemo(() => {
    const ms = matches.data;
    if (!ms || ms.length === 0) return null;
    const resultado = simularTorneo(ms, overridesReales(ms));
    return marcarReales(resultado.rondas, ms);
  }, [matches.data]);
  const teamSel = useMemo(
    () => (teams.data ?? []).find((t) => t.nombre === paisSel) ?? null,
    [teams.data, paisSel],
  );
  const jornada = useMemo(() => jornadaActual(matches.data ?? []), [matches.data]);

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
          { id: 'goleadores', label: 'Estadísticas' },
          { id: 'paises', label: 'Países' },
          { id: 'simulador', label: 'Simulador' },
        ]}
        active={seccion}
        onChange={(id) => {
          setSeccion(id as Seccion);
          setGrupoSel(null);
          setPaisSel(null);
        }}
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
          ) : grupoSel ? (
            <GroupDetail
              grupo={grupoSel}
              standings={standings.data ?? []}
              matches={matches.data ?? []}
              onBack={() => setGrupoSel(null)}
              onSelectPais={verPais}
            />
          ) : (
            <div className={styles.pila}>
              <StandingsTable
                standings={standings.data ?? []}
                onSelectGroup={verGrupo}
                onSelectPais={verPais}
              />
              <RankingTerceros terceros={terceros} />
            </div>
          ))}

        {/* ─── ESTADÍSTICAS ─── */}
        {seccion === 'goleadores' && (
          <div className={styles.fixture}>
            <Tabs
              label="Vista de estadísticas"
              tabs={[
                { id: 'resumen', label: 'Resumen' },
                { id: 'goleadores', label: 'Goleadores' },
                { id: 'ranking', label: 'Ranking' },
              ]}
              active={subEstadisticas}
              onChange={(id) => setSubEstadisticas(id as SubEstadisticas)}
            />
            <div key={subEstadisticas} className={styles.fade}>
              {subEstadisticas === 'goleadores' ? (
                scorers.isPending ? (
                  <SkeletonCard count={2} alto={320} />
                ) : scorers.isError ? (
                  <ErrorState titulo="Goleadores no disponibles" onRetry={() => scorers.refetch()} />
                ) : (
                  <Goleadores scorers={scorers.data ?? []} />
                )
              ) : subEstadisticas === 'ranking' ? (
                standings.isPending ? (
                  <SkeletonCard count={2} alto={200} />
                ) : standings.isError ? (
                  <ErrorState titulo="Ranking no disponible" onRetry={() => standings.refetch()} />
                ) : (
                  <EstadisticasTorneo
                    matches={matches.data ?? []}
                    standings={standings.data ?? []}
                    teams={teams.data ?? []}
                    vista="ranking"
                  />
                )
              ) : (
                matches.isPending ? (
                  <SkeletonCard count={3} alto={180} />
                ) : matches.isError ? (
                  <ErrorState titulo="Estadísticas no disponibles" onRetry={() => matches.refetch()} />
                ) : (
                  <EstadisticasTorneo
                    matches={matches.data ?? []}
                    standings={standings.data ?? []}
                    teams={teams.data ?? []}
                    vista="resumen"
                  />
                )
              )}
            </div>
          </div>
        )}

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
                  proyeccion ? (
                    <SimuladorBracket
                      rondas={proyeccion}
                      overrides={{}}
                      onChange={() => {}}
                      readOnly
                    />
                  ) : (
                    <SkeletonCard count={4} alto={92} />
                  )
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
            {jornada !== null && <span className="kicker">Fecha {jornada} · Fase de grupos</span>}
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
              {tabFixture !== 'resultados' && fixtureFiltrado.length > 0 && isAdmin && (
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
                <MatchList
                  matches={fixtureFiltrado}
                  onSelectGroup={verGrupo}
                  onSelectPais={verPais}
                  onVerDetalle={setModalMatchId}
                />
              )}
            </div>
          </div>
        )}

        {/* ─── SIMULADOR ─── */}
        {seccion === 'simulador' &&
          (matches.isPending ? (
            <SkeletonCard count={4} alto={92} />
          ) : matches.isError ? (
            <ErrorState onRetry={() => matches.refetch()} />
          ) : (
            <Simulador matches={matches.data ?? []} />
          ))}
      </div>

      {modalMatchId && (
        <MatchModal matchId={modalMatchId} onClose={() => setModalMatchId(null)} />
      )}
    </div>
  );
}
