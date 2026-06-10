import { useState } from 'react';
import type { ConstructorStanding, DriverStanding } from '../../lib/types';
import { EmptyState } from '../ui/EmptyState';
import { Tabs } from '../ui/Tabs';
import styles from './DriverStandings.module.css';

interface DriverStandingsProps {
  pilotos: DriverStanding[];
  constructores: ConstructorStanding[];
}

/** Campeonatos de pilotos y constructores, con tabs. */
export function DriverStandings({ pilotos, constructores }: DriverStandingsProps) {
  const [tab, setTab] = useState('pilotos');

  const filas: Array<{ pos: number; nombre: string; detalle: string; pts: number }> =
    tab === 'pilotos'
      ? pilotos.map((p) => ({ pos: p.pos, nombre: p.nombre, detalle: p.equipo, pts: p.pts }))
      : constructores.map((c) => ({ pos: c.pos, nombre: c.nombre, detalle: '', pts: c.pts }));

  return (
    <section className={styles.seccion} aria-label="Campeonato">
      <header className={`${styles.header} texture`}>
        <span className="kicker">Campeonato</span>
        <Tabs
          label="Tipo de campeonato"
          tabs={[
            { id: 'pilotos', label: 'Pilotos' },
            { id: 'constructores', label: 'Equipos' },
          ]}
          active={tab}
          onChange={setTab}
        />
      </header>

      {filas.length === 0 ? (
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
            {filas.map((fila) => (
              <tr key={`${tab}-${fila.pos}-${fila.nombre}`}>
                <td className={styles.pos}>{fila.pos}</td>
                <td>
                  <span className={styles.nombre}>{fila.nombre}</span>
                  {fila.detalle && <span className={styles.detalle}> · {fila.detalle}</span>}
                </td>
                <td className={styles.pts}>{fila.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
