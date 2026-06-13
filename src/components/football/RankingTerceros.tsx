import type { RankingTerceros as RankingTercerosData } from '../../lib/simulator/types';
import { Flag } from '../ui/Flag';
import styles from './RankingTerceros.module.css';

interface RankingTercerosProps {
  terceros: RankingTercerosData;
}

/** Tabla de los 12 terceros puestos: los 8 mejores clasifican a 16avos. */
export function RankingTerceros({ terceros }: RankingTercerosProps) {
  const filas = [
    ...terceros.clasificados.map((t) => ({ ...t, clasifica: true })),
    ...terceros.descartados.map((t) => ({ ...t, clasifica: false })),
  ];

  return (
    <section className={styles.terceros}>
      <h3 className="kicker">Mejores terceros (8 de 12 clasifican)</h3>
      <div className={styles.scroll}>
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th className={styles.colPos} scope="col">#</th>
              <th className={styles.colEquipo} scope="col">Equipo</th>
              <th className={styles.colGrupo} scope="col">Grupo</th>
              <th scope="col" title="Puntos">PTS</th>
              <th scope="col" title="Diferencia de gol">DIF</th>
              <th scope="col" title="Goles a favor">GF</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((t) => (
              <tr key={`${t.grupo}-${t.nombre}`} className={t.clasifica ? styles.clasifica : styles.eliminado}>
                <td className={styles.colPos}>{t.pos}</td>
                <td className={styles.equipoCell}>
                  <span className={styles.equipo}>
                    <Flag code={t.code} title={t.nombre} />
                    <span>{t.nombre}</span>
                  </span>
                </td>
                <td className={styles.colGrupo}>{t.grupo}</td>
                <td className={styles.num}>{t.pts}</td>
                <td className={styles.num}>{t.dif > 0 ? `+${t.dif}` : t.dif}</td>
                <td className={styles.num}>{t.gf}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
