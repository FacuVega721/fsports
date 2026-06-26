import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
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

/** Campeonatos de pilotos y constructores, con tabs. Los pilotos tienen ficha (click-through). */
export function DriverStandings({ pilotos, constructores }: DriverStandingsProps) {
  const [tab, setTab] = useState('pilotos');
  const [selId, setSelId] = useState<string | null>(null);
  const seleccionado = selId ? pilotos.find((p) => p.id === selId) ?? null : null;

  if (seleccionado) {
    return <PilotoDetalle piloto={seleccionado} onVolver={() => setSelId(null)} />;
  }

  const filas: Array<{ pos: number; nombre: string; detalle: string; pts: number; id?: string }> =
    tab === 'pilotos'
      ? pilotos.map((p) => ({ pos: p.pos, nombre: p.nombre, detalle: p.equipo, pts: p.pts, id: p.id }))
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
