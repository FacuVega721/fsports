import { useMemo, useState } from 'react';
import { DriverStandings } from '../components/f1/DriverStandings';
import { F1Calendar } from '../components/f1/F1Calendar';
import { F1RaceResult } from '../components/f1/F1RaceResult';
import { F1Teams } from '../components/f1/F1Teams';
import { NextRaceCard } from '../components/f1/NextRaceCard';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { Tabs } from '../components/ui/Tabs';
import {
  useF1Calendar,
  useF1Constructors,
  useF1Drivers,
  useF1Next,
  useF1Race,
  useF1Teams,
} from '../hooks/useData';
import { dataSource } from '../lib/data';
import styles from './Page.module.css';

type SeccionF1 = 'calendario' | 'resultados' | 'equipos' | 'campeonato';

export default function F1Page() {
  const [seccion, setSeccion] = useState<SeccionF1>('calendario');
  const [rondaSel, setRondaSel] = useState<number | null>(null);

  const proxima = useF1Next();
  const calendario = useF1Calendar();
  const teams = useF1Teams();
  const pilotos = useF1Drivers();
  const constructores = useF1Constructors();

  // GP finalizados (para el selector de resultados), del más reciente al primero
  const finalizadas = useMemo(
    () =>
      (calendario.data ?? [])
        .filter((r) => r.estado === 'finalizada')
        .sort((a, b) => b.ronda - a.ronda),
    [calendario.data],
  );
  // Ronda a mostrar en Resultados: la elegida, o la última finalizada por defecto
  const rondaEfectiva = rondaSel ?? finalizadas[0]?.ronda ?? null;
  const race = useF1Race(seccion === 'resultados' ? rondaEfectiva : null);

  function verResultado(ronda: number) {
    setRondaSel(ronda);
    setSeccion('resultados');
  }

  return (
    <div className={`container ${styles.pagina}`}>
      {/* Banner de temporada */}
      <section className={`${styles.banner} texture`}>
        <span className="kicker">Fórmula 1 · Temporada {dataSource.f1Temporada}</span>
        <h1 className={styles.titulo}>Fórmula 1</h1>
        <p className={styles.subtitulo}>
          Calendario, resultados, equipos y campeonato — hora argentina (UTC-3).
        </p>
      </section>

      {/* Próximo GP destacado (siempre arriba) */}
      {proxima.isPending ? (
        <SkeletonCard count={1} alto={260} />
      ) : (
        proxima.data && <NextRaceCard race={proxima.data} />
      )}

      {/* Navegación de secciones */}
      <Tabs
        label="Secciones de F1"
        tabs={[
          { id: 'calendario', label: 'Calendario' },
          { id: 'resultados', label: 'Resultados' },
          { id: 'equipos', label: 'Equipos' },
          { id: 'campeonato', label: 'Campeonato' },
        ]}
        active={seccion}
        onChange={(id) => setSeccion(id as SeccionF1)}
      />

      <div key={seccion} className={styles.fade}>
        {/* ─── CALENDARIO ─── */}
        {seccion === 'calendario' &&
          (calendario.isPending ? (
            <SkeletonCard count={6} alto={64} />
          ) : calendario.isError ? (
            <ErrorState titulo="Calendario no disponible" onRetry={() => calendario.refetch()} />
          ) : (calendario.data ?? []).length === 0 ? (
            <EmptyState titulo="Sin calendario" detalle="Todavía no hay carreras cargadas." />
          ) : (
            <F1Calendar races={calendario.data ?? []} onSelect={verResultado} />
          ))}

        {/* ─── RESULTADOS ─── */}
        {seccion === 'resultados' && (
          <div className={styles.fixture}>
            {finalizadas.length > 0 && (
              <select
                className={styles.gpSelect}
                value={rondaEfectiva ?? ''}
                onChange={(e) => setRondaSel(Number(e.target.value))}
                aria-label="Elegir Gran Premio"
              >
                {finalizadas.map((r) => (
                  <option key={r.ronda} value={r.ronda}>
                    R{r.ronda} · {r.gp}
                  </option>
                ))}
              </select>
            )}
            {finalizadas.length === 0 ? (
              <EmptyState
                titulo="Todavía no hay carreras disputadas"
                detalle="Cuando baje la bandera a cuadros, los resultados aparecen acá."
              />
            ) : race.isPending ? (
              <SkeletonCard count={1} alto={400} />
            ) : race.isError ? (
              <ErrorState titulo="Resultado no disponible" onRetry={() => race.refetch()} />
            ) : race.data ? (
              <F1RaceResult race={race.data} />
            ) : null}
          </div>
        )}

        {/* ─── EQUIPOS ─── */}
        {seccion === 'equipos' &&
          (teams.isPending ? (
            <SkeletonCard count={6} alto={70} />
          ) : teams.isError ? (
            <ErrorState titulo="Equipos no disponibles" onRetry={() => teams.refetch()} />
          ) : (
            <F1Teams teams={teams.data ?? []} />
          ))}

        {/* ─── CAMPEONATO ─── */}
        {seccion === 'campeonato' &&
          (pilotos.isPending || constructores.isPending ? (
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
          ))}
      </div>
    </div>
  );
}
