import type { CSSProperties } from 'react';
import type { OverridesSim, ResultadoSim, RondasSim } from '../../lib/simulator/types';
import { SimuladorMatchInput } from './SimuladorMatchInput';
import styles from './SimuladorBracket.module.css';

interface SimuladorBracketProps {
  rondas: RondasSim;
  overrides: OverridesSim;
  onChange: (matchId: string, resultado: ResultadoSim | null) => void;
  readOnly?: boolean;
}

const COLUMNAS: Array<{ key: keyof Omit<RondasSim, 'tercer_puesto'>; label: string }> = [
  { key: 'dieciseisavos', label: '16avos' },
  { key: 'octavos', label: 'Octavos' },
  { key: 'cuartos', label: 'Cuartos' },
  { key: 'semifinal', label: 'Semis' },
  { key: 'final', label: 'Final' },
];

/**
 * Líneas conectoras entre una ronda y la siguiente (solo en modo readOnly,
 * donde cada tarjeta tiene alto uniforme — sin eso la posición en % no
 * coincide). Misma técnica que KnockoutBracket: con `justify-content:
 * space-around` en .llaves, el partido N+1 cae centrado matemáticamente
 * entre sus dos partidos previos.
 */
function Conectores({ cantidadPartidos }: { cantidadPartidos: number }) {
  const pares = Math.floor(cantidadPartidos / 2);
  return (
    <div className={styles.conectores} aria-hidden="true">
      {Array.from({ length: pares }, (_, i) => {
        const centroA = ((2 * (2 * i) + 1) / (2 * cantidadPartidos)) * 100;
        const centroB = ((2 * (2 * i + 1) + 1) / (2 * cantidadPartidos)) * 100;
        return (
          <span
            key={i}
            className={styles.linea}
            style={{ top: `${centroA}%`, height: `${centroB - centroA}%` } as CSSProperties}
          />
        );
      })}
    </div>
  );
}

/** Cuadro de eliminatoria editable: 16avos hasta la final, encadenados en vivo. */
export function SimuladorBracket({ rondas, overrides, onChange, readOnly }: SimuladorBracketProps) {
  const final = rondas.final[0];
  const campeon = final?.ganador
    ? final.ganador === 'local'
      ? final.local
      : final.visitante
    : null;
  const tercero = rondas.tercer_puesto[0];

  return (
    <div className={styles.wrapper}>
      {campeon && (
        <p className={styles.campeon}>
          <span className="kicker">Campeón</span> {campeon}
        </p>
      )}

      <div className={`${styles.cuadro} ${readOnly ? styles.cuadroConectado : ''}`}>
        {COLUMNAS.map((col, i) => (
          <div key={col.key} className={styles.columna}>
            <div className={`${styles.colHeader} ${col.key === 'final' ? styles.colHeaderFinal : ''}`}>
              {col.label}
            </div>
            <div className={styles.llaves}>
              {rondas[col.key].map((p) => (
                <div key={p.id} className={`${styles.llave} ${col.key === 'final' ? styles.llaveFinal : ''}`}>
                  <SimuladorMatchInput
                    partido={p}
                    override={overrides[p.id]}
                    eliminatoria
                    readOnly={readOnly}
                    onChange={(resultado) => onChange(p.id, resultado)}
                  />
                </div>
              ))}
              {readOnly && i < COLUMNAS.length - 1 && (
                <Conectores cantidadPartidos={rondas[col.key].length} />
              )}
            </div>
          </div>
        ))}
      </div>

      {tercero && (
        <div className={styles.tercero}>
          <div className={styles.colHeader}>Tercer puesto</div>
          <div className={styles.llave}>
            <SimuladorMatchInput
              partido={tercero}
              override={overrides[tercero.id]}
              eliminatoria
              readOnly={readOnly}
              onChange={(resultado) => onChange(tercero.id, resultado)}
            />
          </div>
        </div>
      )}

      <p className={styles.aviso}>
        Los cruces de 16avos y la asignación de los mejores terceros son una aproximación propia
        válida según el reglamento, que puede no coincidir con la tabla oficial de FIFA en casos
        ambiguos.
      </p>
    </div>
  );
}
