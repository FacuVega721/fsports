import { useMemo, useState } from 'react';
import { CAMPEONES_MUNDIAL } from '../../data/mundiales-historicos';
import { Flag } from '../ui/Flag';
import { Tabs } from '../ui/Tabs';
import styles from './MundialesHistoricos.module.css';

type Vista = 'ranking' | 'campeones';

/** Históricos del Mundial: ranking de selecciones más ganadoras + campeones año por año. */
export function MundialesHistoricos() {
  const [vista, setVista] = useState<Vista>('ranking');

  const ranking = useMemo(() => {
    const conteo = new Map<string, { nombre: string; code: string; titulos: number }>();
    for (const c of CAMPEONES_MUNDIAL) {
      const actual = conteo.get(c.campeonCode);
      if (actual) actual.titulos += 1;
      else conteo.set(c.campeonCode, { nombre: c.campeon, code: c.campeonCode, titulos: 1 });
    }
    return [...conteo.values()].sort((a, b) => b.titulos - a.titulos);
  }, []);

  const campeonesDesc = useMemo(() => [...CAMPEONES_MUNDIAL].reverse(), []);

  return (
    <div className={styles.historicos}>
      <Tabs
        label="Vista histórica del Mundial"
        tabs={[
          { id: 'ranking', label: 'Selecciones más ganadoras' },
          { id: 'campeones', label: 'Campeones por año' },
        ]}
        active={vista}
        onChange={(id) => setVista(id as Vista)}
      />

      {vista === 'ranking' && (
        <div className={styles.scroll}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th className={styles.colPos} scope="col">#</th>
                <th className={styles.colEquipo} scope="col">Selección</th>
                <th scope="col">Títulos</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((r, i) => (
                <tr key={r.code}>
                  <td className={styles.colPos}>{i + 1}</td>
                  <td className={styles.equipoCell}>
                    <span className={styles.equipo}>
                      <Flag code={r.code} title={r.nombre} />
                      <span>{r.nombre}</span>
                    </span>
                  </td>
                  <td className={styles.num}>{r.titulos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {vista === 'campeones' && (
        <div className={styles.scroll}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th scope="col">Año</th>
                <th className={styles.colEquipo} scope="col">Campeón</th>
                <th scope="col">Subcampeón</th>
                <th scope="col">Sede</th>
                <th scope="col">Resultado</th>
              </tr>
            </thead>
            <tbody>
              {campeonesDesc.map((c) => (
                <tr key={c.anio}>
                  <td className={styles.num}>{c.anio}</td>
                  <td className={styles.equipoCell}>
                    <span className={styles.equipo}>
                      <Flag code={c.campeonCode} title={c.campeon} />
                      <span>{c.campeon}</span>
                    </span>
                  </td>
                  <td className={styles.detalle}>{c.subcampeon}</td>
                  <td className={styles.detalle}>{c.sede}</td>
                  <td className={styles.detalle}>{c.marcador}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
