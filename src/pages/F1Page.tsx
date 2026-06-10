import { DriverStandings } from '../components/f1/DriverStandings';
import { NextRaceCard } from '../components/f1/NextRaceCard';
import { RacePodium } from '../components/f1/RacePodium';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import {
  useF1Constructors,
  useF1Drivers,
  useF1Last,
  useF1Next,
} from '../hooks/useData';
import { dataSource } from '../lib/data';
import styles from './Page.module.css';

export default function F1Page() {
  const ultima = useF1Last();
  const proxima = useF1Next();
  const pilotos = useF1Drivers();
  const constructores = useF1Constructors();

  return (
    <div className={`container ${styles.pagina}`}>
      {/* Banner de temporada */}
      <section className={`${styles.banner} texture`}>
        <span className="kicker">Fórmula 1 · Temporada {dataSource.f1Temporada}</span>
        <h1 className={styles.titulo}>Fórmula 1</h1>
        <p className={styles.subtitulo}>
          Resultados, próximos GP y campeonato — hora argentina (UTC-3).
        </p>
      </section>

      <div className={styles.columnas}>
        <main className={`${styles.principal} ${styles.conEspacio}`}>
          {proxima.isPending ? (
            <SkeletonCard count={1} alto={150} />
          ) : proxima.isError ? (
            <ErrorState
              titulo="Próximo GP no disponible"
              onRetry={() => proxima.refetch()}
            />
          ) : proxima.data ? (
            <NextRaceCard race={proxima.data} />
          ) : (
            <EmptyState
              titulo="Sin próxima carrera confirmada"
              detalle="El calendario se actualiza apenas se confirme la próxima fecha."
            />
          )}

          {ultima.isPending ? (
            <SkeletonCard count={1} alto={320} />
          ) : ultima.isError ? (
            <ErrorState
              titulo="Última carrera no disponible"
              onRetry={() => ultima.refetch()}
            />
          ) : ultima.data && ultima.data.resultados.length > 0 ? (
            <RacePodium race={ultima.data} />
          ) : (
            <EmptyState
              titulo="Todavía no hay carreras disputadas"
              detalle="Cuando baje la bandera a cuadros, el podio aparece acá."
            />
          )}
        </main>

        <aside className={styles.lateral} aria-label="Campeonato">
          {pilotos.isPending || constructores.isPending ? (
            <SkeletonCard count={1} alto={320} />
          ) : pilotos.isError ? (
            <ErrorState
              titulo="Campeonato no disponible"
              onRetry={() => {
                pilotos.refetch();
                constructores.refetch();
              }}
            />
          ) : (
            <DriverStandings
              pilotos={pilotos.data ?? []}
              constructores={constructores.data ?? []}
            />
          )}
        </aside>
      </div>
    </div>
  );
}
