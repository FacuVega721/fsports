import { useState } from 'react';
import { Flag as FlagIcon, Timer, Trophy, Zap } from 'lucide-react';
import type { QualyResultRow, RaceFull, RaceResultRow, ResultadoEstado } from '../../lib/types';
import { formatFecha } from '../../lib/time';
import { Flag } from '../ui/Flag';
import { Tabs } from '../ui/Tabs';
import styles from './F1RaceResult.module.css';

interface F1RaceResultProps {
  race: RaceFull;
}

const CLASE_ESTADO: Partial<Record<ResultadoEstado, string>> = {
  dnf: styles.dnf,
  dns: styles.dns,
  dsq: styles.dsq,
  nc: styles.nc,
};

/** Tabla de clasificación (sirve para Carrera y Sprint). */
function Clasificacion({ rows }: { rows: RaceResultRow[] }) {
  return (
    <div className={styles.scroll}>
      <table className={styles.tabla}>
        <thead>
          <tr>
            <th className={styles.colPos} scope="col">#</th>
            <th scope="col">Piloto</th>
            <th scope="col">Equipo</th>
            <th className={styles.colNum} scope="col" title="Posición de largada">Larg.</th>
            <th className={styles.colNum} scope="col" title="Vueltas">Vts</th>
            <th className={styles.colTiempo} scope="col">Tiempo / Estado</th>
            <th className={styles.colNum} scope="col" title="Puntos">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={`${r.code || r.piloto}-${i}`}
              className={r.pos !== null && r.pos <= 3 ? styles[`p${r.pos}`] : ''}
            >
              <td className={styles.pos}>{r.posTexto}</td>
              <td>
                <span className={styles.piloto}>{r.piloto}</span>
                {r.code && <span className={styles.code}>{r.code}</span>}
              </td>
              <td className={styles.equipo}>{r.equipo}</td>
              <td className={styles.num}>{r.grilla ?? '—'}</td>
              <td className={styles.num}>{r.vueltas ?? '—'}</td>
              <td className={styles.tiempo}>
                {r.estado !== 'ok' && CLASE_ESTADO[r.estado] && (
                  <span className={`${styles.badge} ${CLASE_ESTADO[r.estado]}`}>{r.posTexto}</span>
                )}
                {r.tiempo}
              </td>
              <td className={`${styles.num} ${styles.pts}`}>{r.puntos || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Tabla de clasificación de Qualy (Q1/Q2/Q3). */
function TablaQualy({ rows }: { rows: QualyResultRow[] }) {
  return (
    <div className={styles.scroll}>
      <table className={styles.tabla}>
        <thead>
          <tr>
            <th className={styles.colPos} scope="col">#</th>
            <th scope="col">Piloto</th>
            <th scope="col">Equipo</th>
            <th className={styles.colTiempo} scope="col">Q1</th>
            <th className={styles.colTiempo} scope="col">Q2</th>
            <th className={styles.colTiempo} scope="col">Q3</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={`${r.code || r.piloto}-${i}`}
              className={r.pos <= 3 ? styles[`p${r.pos}`] : ''}
            >
              <td className={styles.pos}>{r.pos}</td>
              <td>
                <span className={styles.piloto}>{r.piloto}</span>
                {r.code && <span className={styles.code}>{r.code}</span>}
              </td>
              <td className={styles.equipo}>{r.equipo}</td>
              <td className={styles.tiempo}>{r.q1 || '—'}</td>
              <td className={styles.tiempo}>{r.q2 || '—'}</td>
              <td className={styles.tiempo}>{r.q3 || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type Vista = 'carrera' | 'sprint' | 'clasificacion';

/** Detalle de un GP: pole, vuelta rápida, clasificación y (si hubo) Sprint. */
export function F1RaceResult({ race }: F1RaceResultProps) {
  const hayResultados = race.resultados.length > 0;
  const haySprint = !!race.sprint && race.sprint.length > 0;
  const hayClasificacion = !!race.clasificacion && race.clasificacion.length > 0;
  const [vista, setVista] = useState<Vista>(
    hayResultados ? 'carrera' : hayClasificacion ? 'clasificacion' : 'sprint',
  );
  const enSprint = haySprint && vista === 'sprint';
  const enClasificacion = hayClasificacion && vista === 'clasificacion';

  return (
    <section className={styles.detalle}>
      <header className={`${styles.cabecera} texture`}>
        <span className="kicker">
          {hayResultados ? 'Resultado' : 'GP en curso'} · Ronda {race.ronda}
          {haySprint && ' · Fin de semana Sprint'}
        </span>
        <h2 className={styles.gp}>
          <Flag code={race.code} title={race.gp} />
          {race.gp}
        </h2>
        <p className={styles.circuito}>
          {[race.circuito, race.ciudad].filter(Boolean).join(' · ')}
          {race.fecha ? ` · ${formatFecha(race.fecha)}` : ''}
        </p>
      </header>

      {(hayResultados || haySprint || hayClasificacion) && (
        <Tabs
          label="Sesión del fin de semana"
          tabs={[
            ...(hayResultados ? [{ id: 'carrera', label: 'Carrera' }] : []),
            ...(haySprint ? [{ id: 'sprint', label: 'Sprint' }] : []),
            ...(hayClasificacion ? [{ id: 'clasificacion', label: 'Clasificación' }] : []),
          ]}
          active={vista}
          onChange={(id) => setVista(id as Vista)}
        />
      )}

      {!hayResultados && !haySprint && !hayClasificacion ? (
        <p className={styles.notaSprint}>Todavía no hay resultados para este GP.</p>
      ) : enSprint ? (
        <>
          <p className={styles.notaSprint}>
            <Zap size={13} aria-hidden="true" /> Clasificación de la carrera Sprint (puntos para
            los primeros 8).
          </p>
          <Clasificacion rows={race.sprint!} />
        </>
      ) : enClasificacion ? (
        <TablaQualy rows={race.clasificacion!} />
      ) : (
        <>
          {(race.pole || race.vueltaRapida) && (
            <div className={styles.destacados}>
              {race.pole && (
                <div className={styles.destacado}>
                  <Trophy size={15} className={styles.iconPole} aria-hidden="true" />
                  <div>
                    <span className={styles.dLabel}>Pole position</span>
                    <span className={styles.dValor}>
                      {race.pole.piloto} <span className={styles.dTiempo}>{race.pole.tiempo}</span>
                    </span>
                  </div>
                </div>
              )}
              {race.vueltaRapida && (
                <div className={styles.destacado}>
                  <Timer size={15} className={styles.iconVr} aria-hidden="true" />
                  <div>
                    <span className={styles.dLabel}>Vuelta rápida</span>
                    <span className={styles.dValor}>
                      {race.vueltaRapida.piloto}{' '}
                      <span className={styles.dTiempo}>{race.vueltaRapida.tiempo}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
          <Clasificacion rows={race.resultados} />
        </>
      )}

      <p className={styles.nota}>
        <FlagIcon size={11} aria-hidden="true" /> Larg. = posición de largada · DNF = abandono ·
        DNS = no largó
      </p>
    </section>
  );
}
