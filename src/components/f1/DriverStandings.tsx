import { useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { CAMPEONES_CONSTRUCTORES, CAMPEONES_PILOTOS } from '../../data/campeonatos-f1';
import type { ConstructorStanding, DriverStanding } from '../../lib/types';
import { EmptyState } from '../ui/EmptyState';
import { Flag } from '../ui/Flag';
import { Tabs } from '../ui/Tabs';
import styles from './DriverStandings.module.css';

interface DriverStandingsProps {
  pilotos: DriverStanding[];
  constructores: ConstructorStanding[];
}

/** Ficha de un piloto: bandera, equipo, edad y reseña. */
function PilotoDetalle({ piloto, onVolver }: { piloto: DriverStanding; onVolver: () => void }) {
  return (
    <div className={styles.detalle}>
      <button type="button" className={styles.volver} onClick={onVolver}>
        <ArrowLeft size={15} aria-hidden="true" />
        Volver a pilotos
      </button>

      <header className={`${styles.cabecera} texture`}>
        <span className={styles.posBig}>{piloto.pos}°</span>
        <div className={styles.cabeceraInfo}>
          <h2 className={styles.nombreGrande}>
            {piloto.nacionalidadCode && (
              <Flag code={piloto.nacionalidadCode} title={piloto.nacionalidad} />
            )}
            {piloto.nombreCompleto || piloto.nombre}
          </h2>
          <p className={styles.meta}>
            {piloto.equipo}
            {piloto.edad ? ` · ${piloto.edad} años` : ''} ·{' '}
            <span className={styles.pts}>{piloto.pts} pts</span>
          </p>
        </div>
      </header>

      {piloto.resena && <p className={styles.resena}>{piloto.resena}</p>}
    </div>
  );
}

type VistaHistorico = 'titulos' | 'pilotos' | 'constructores';

/** Históricos: títulos acumulados por escudería + campeones año por año. */
function Historicos() {
  const [vista, setVista] = useState<VistaHistorico>('titulos');

  const titulosPorEquipo = useMemo(() => {
    const conteo = new Map<string, { equipo: string; titulos: number }>();
    for (const c of CAMPEONES_CONSTRUCTORES) {
      const actual = conteo.get(c.constructorId);
      if (actual) {
        actual.titulos += 1;
        actual.equipo = c.equipo; // se queda con el nombre más reciente
      } else {
        conteo.set(c.constructorId, { equipo: c.equipo, titulos: 1 });
      }
    }
    return [...conteo.values()].sort((a, b) => b.titulos - a.titulos);
  }, []);

  const pilotosDesc = useMemo(() => [...CAMPEONES_PILOTOS].reverse(), []);
  const constructoresDesc = useMemo(() => [...CAMPEONES_CONSTRUCTORES].reverse(), []);

  return (
    <div className={styles.historicos}>
      <Tabs
        label="Vista histórica"
        tabs={[
          { id: 'titulos', label: 'Títulos por escudería' },
          { id: 'pilotos', label: 'Campeones (pilotos)' },
          { id: 'constructores', label: 'Campeones (constructores)' },
        ]}
        active={vista}
        onChange={(id) => setVista(id as VistaHistorico)}
      />

      {vista === 'titulos' && (
        <div className={styles.scroll}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th scope="col">Escudería</th>
                <th scope="col" className={styles.colDerecha}>
                  Títulos de constructores
                </th>
              </tr>
            </thead>
            <tbody>
              {titulosPorEquipo.map((t) => (
                <tr key={t.equipo}>
                  <td className={styles.nombre}>{t.equipo}</td>
                  <td className={styles.pts}>{t.titulos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {vista === 'pilotos' && (
        <div className={styles.scroll}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th scope="col">Año</th>
                <th scope="col">Piloto</th>
                <th scope="col">Equipo</th>
              </tr>
            </thead>
            <tbody>
              {pilotosDesc.map((c) => (
                <tr key={c.anio}>
                  <td className={styles.pos}>{c.anio}</td>
                  <td className={styles.nombre}>{c.piloto}</td>
                  <td className={styles.detalle}>{c.equipo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {vista === 'constructores' && (
        <div className={styles.scroll}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th scope="col">Año</th>
                <th scope="col">Equipo</th>
              </tr>
            </thead>
            <tbody>
              {constructoresDesc.map((c) => (
                <tr key={c.anio}>
                  <td className={styles.pos}>{c.anio}</td>
                  <td className={styles.nombre}>{c.equipo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

type TabCampeonato = 'pilotos' | 'constructores' | 'historicos';

/** Campeonatos de pilotos y constructores, con tabs. Los pilotos tienen ficha (click-through). */
export function DriverStandings({ pilotos, constructores }: DriverStandingsProps) {
  const [tab, setTab] = useState<TabCampeonato>('pilotos');
  const [selId, setSelId] = useState<string | null>(null);
  const seleccionado = selId ? pilotos.find((p) => p.id === selId) ?? null : null;

  if (seleccionado) {
    return <PilotoDetalle piloto={seleccionado} onVolver={() => setSelId(null)} />;
  }

  const filas: Array<{ pos: number; nombre: string; detalle: string; pts: number; id?: string }> =
    tab === 'pilotos'
      ? pilotos.map((p) => ({ pos: p.pos, nombre: p.nombre, detalle: p.equipo, pts: p.pts, id: p.id }))
      : tab === 'constructores'
        ? constructores.map((c) => ({ pos: c.pos, nombre: c.nombre, detalle: '', pts: c.pts }))
        : [];

  return (
    <section className={styles.seccion} aria-label="Campeonato">
      <header className={`${styles.header} texture`}>
        <span className="kicker">Campeonato</span>
        <Tabs
          label="Tipo de campeonato"
          tabs={[
            { id: 'pilotos', label: 'Pilotos' },
            { id: 'constructores', label: 'Equipos' },
            { id: 'historicos', label: 'Históricos' },
          ]}
          active={tab}
          onChange={(id) => setTab(id as TabCampeonato)}
        />
      </header>

      {tab === 'historicos' ? (
        <Historicos />
      ) : filas.length === 0 ? (
        <div className={styles.vacio}>
          <EmptyState
            titulo="Sin datos del campeonato"
            detalle="Cuando haya posiciones cargadas, van a aparecer acá."
          />
        </div>
      ) : (
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th scope="col" aria-label="Posición">#</th>
              <th scope="col">{tab === 'pilotos' ? 'Piloto' : 'Equipo'}</th>
              <th scope="col" className={styles.colDerecha}>PTS</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((fila) => {
              const clickable = tab === 'pilotos' && !!fila.id;
              return (
                <tr
                  key={`${tab}-${fila.pos}-${fila.nombre}`}
                  className={clickable ? styles.filaClickable : ''}
                  onClick={clickable ? () => setSelId(fila.id!) : undefined}
                >
                  <td className={styles.pos}>{fila.pos}</td>
                  <td>
                    <span className={styles.nombre}>{fila.nombre}</span>
                    {fila.detalle && <span className={styles.detalle}> · {fila.detalle}</span>}
                  </td>
                  <td className={styles.pts}>{fila.pts}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
