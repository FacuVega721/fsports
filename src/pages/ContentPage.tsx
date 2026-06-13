import { useMemo, useState } from 'react';
import { EditablePost } from '../components/content/EditablePost';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { Tabs } from '../components/ui/Tabs';
import { useF1Last, useF1Next, useMatches } from '../hooks/useData';
import { postAgenda, postFinal, postProximaF1, postResultadoF1 } from '../lib/social';
import { hoyArg } from '../lib/time';
import type { Match } from '../lib/types';
import contenidoStyles from './ContentPage.module.css';
import styles from './Page.module.css';

type Deporte = 'futbol' | 'f1';
type FiltroFutbol = 'hoy' | 'proximos' | 'resultados';

function filtrarMatches(matches: Match[], filtro: FiltroFutbol): Match[] {
  const hoy = hoyArg();
  switch (filtro) {
    case 'hoy':
      return matches
        .filter((m) => m.fecha === hoy || m.estado === 'en_vivo' || m.estado === 'entretiempo')
        .sort((a, b) => a.hora.localeCompare(b.hora));
    case 'proximos':
      return matches
        .filter((m) => m.estado === 'programado' && m.fecha >= hoy)
        .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora));
    case 'resultados':
      return matches
        .filter((m) => m.estado === 'finalizado')
        .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.hora.localeCompare(a.hora));
  }
}

/**
 * Centro de contenido: posteos pregenerados, editables, para copiar y publicar.
 * No está enlazada desde la navegación — acceso directo por URL (/contenido).
 */
export default function ContentPage() {
  const [deporte, setDeporte] = useState<Deporte>('futbol');
  const [filtroFutbol, setFiltroFutbol] = useState<FiltroFutbol>('hoy');
  const matches = useMatches();
  const f1Next = useF1Next();
  const f1Last = useF1Last();

  const filtrados = useMemo(
    () => filtrarMatches(matches.data ?? [], filtroFutbol),
    [matches.data, filtroFutbol],
  );

  return (
    <div className={`container ${styles.pagina}`}>
      <section className={`${styles.banner} texture`}>
        <span className="kicker">Centro de contenido</span>
        <h1 className={styles.titulo}>Posteos</h1>
        <p className={styles.subtitulo}>
          Textos listos para copiar y publicar en X — editalos antes de copiar.
        </p>
      </section>

      <Tabs
        label="Deporte"
        tabs={[
          { id: 'futbol', label: 'Fútbol' },
          { id: 'f1', label: 'F1' },
        ]}
        active={deporte}
        onChange={(id) => setDeporte(id as Deporte)}
      />

      {deporte === 'futbol' && (
        <div className={styles.fixture}>
          <Tabs
            label="Filtro de partidos"
            tabs={[
              { id: 'hoy', label: 'Hoy' },
              { id: 'proximos', label: 'Próximos' },
              { id: 'resultados', label: 'Resultados' },
            ]}
            active={filtroFutbol}
            onChange={(id) => setFiltroFutbol(id as FiltroFutbol)}
          />
          {matches.isPending ? (
            <SkeletonCard count={3} alto={160} />
          ) : matches.isError ? (
            <ErrorState onRetry={() => matches.refetch()} />
          ) : filtrados.length === 0 ? (
            <EmptyState
              titulo="Sin partidos"
              detalle="No hay partidos disponibles para este filtro."
            />
          ) : (
            <div className={contenidoStyles.lista}>
              {filtroFutbol === 'resultados' ? (
                filtrados.map((m) => (
                  <EditablePost
                    key={m.id}
                    titulo={`${m.local} ${m.golesLocal ?? 0}-${m.golesVisitante ?? 0} ${m.visitante}`}
                    texto={postFinal(m)}
                  />
                ))
              ) : (
                <EditablePost
                  key={filtroFutbol}
                  titulo={filtroFutbol === 'hoy' ? 'Agenda de hoy' : 'Agenda — próximos partidos'}
                  texto={postAgenda(filtrados, filtroFutbol === 'hoy')}
                />
              )}
            </div>
          )}
        </div>
      )}

      {deporte === 'f1' && (
        <div className={contenidoStyles.lista}>
          {f1Next.isPending || f1Last.isPending ? (
            <SkeletonCard count={2} alto={160} />
          ) : (
            <>
              {f1Next.data && (
                <EditablePost
                  key={`next-${f1Next.data.gp}`}
                  titulo={`Próximo GP: ${f1Next.data.gp}`}
                  texto={postProximaF1(f1Next.data)}
                />
              )}
              {f1Last.data && (
                <EditablePost
                  key={`last-${f1Last.data.gp}`}
                  titulo={`Resultado: ${f1Last.data.gp}`}
                  texto={postResultadoF1(f1Last.data)}
                />
              )}
              {!f1Next.data && !f1Last.data && (
                <EmptyState
                  titulo="Sin datos de F1"
                  detalle="No hay carreras disponibles por ahora."
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
