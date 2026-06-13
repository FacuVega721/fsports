import { useEffect, useState } from 'react';
import type { MatchSimVista, ResultadoSim } from '../../lib/simulator/types';
import { Flag } from '../ui/Flag';
import styles from './SimuladorMatchInput.module.css';

interface SimuladorMatchInputProps {
  partido: MatchSimVista;
  override?: ResultadoSim;
  /** Partido de eliminatoria: un empate habilita los penales para definir ganador. */
  eliminatoria?: boolean;
  onChange: (resultado: ResultadoSim | null) => void;
}

function aEntero(valor: string): number | null {
  if (valor === '') return null;
  const n = Number(valor);
  return Number.isInteger(n) && n >= 0 && n <= 20 ? n : null;
}

/** Fila de un partido del simulador: editable si falta jugarse, o resultado real (fijo) si ya terminó. */
export function SimuladorMatchInput({ partido, override, eliminatoria, onChange }: SimuladorMatchInputProps) {
  const [local, setLocal] = useState(override?.golesLocal?.toString() ?? '');
  const [visitante, setVisitante] = useState(override?.golesVisitante?.toString() ?? '');
  const [penLocal, setPenLocal] = useState(override?.penalesLocal?.toString() ?? '');
  const [penVisitante, setPenVisitante] = useState(override?.penalesVisitante?.toString() ?? '');

  useEffect(() => {
    setLocal(override?.golesLocal?.toString() ?? '');
    setVisitante(override?.golesVisitante?.toString() ?? '');
    setPenLocal(override?.penalesLocal?.toString() ?? '');
    setPenVisitante(override?.penalesVisitante?.toString() ?? '');
  }, [override?.golesLocal, override?.golesVisitante, override?.penalesLocal, override?.penalesVisitante]);

  if (partido.real) {
    return (
      <div className={styles.fila}>
        <span className={styles.equipo}>
          <Flag code={partido.localCode} title={partido.local} />
          <span className={styles.nombre}>{partido.local}</span>
        </span>
        <span className={styles.marcador}>
          <strong>{partido.golesLocal}</strong>
          <span className={styles.badgeReal}>Real</span>
          <strong>{partido.golesVisitante}</strong>
        </span>
        <span className={`${styles.equipo} ${styles.equipoVisitante}`}>
          <span className={styles.nombre}>{partido.visitante}</span>
          <Flag code={partido.visitanteCode} title={partido.visitante} />
        </span>
      </div>
    );
  }

  if (!partido.definido) {
    return (
      <div className={`${styles.fila} ${styles.porDefinir}`}>
        <span className={styles.nombre}>{partido.local}</span>
        <span className={styles.marcador}>vs</span>
        <span className={`${styles.nombre} ${styles.nombreVisitante}`}>{partido.visitante}</span>
      </div>
    );
  }

  function emitir(gl: string, gv: string, pl: string, pv: string) {
    const golesLocal = aEntero(gl);
    const golesVisitante = aEntero(gv);
    if (golesLocal === null || golesVisitante === null) {
      onChange(null);
      return;
    }
    if (eliminatoria && golesLocal === golesVisitante) {
      const penalesLocal = aEntero(pl);
      const penalesVisitante = aEntero(pv);
      onChange({
        golesLocal,
        golesVisitante,
        ...(penalesLocal !== null && penalesVisitante !== null ? { penalesLocal, penalesVisitante } : {}),
      });
      return;
    }
    onChange({ golesLocal, golesVisitante });
  }

  function actualizarGoles(nuevoLocal: string, nuevoVisitante: string) {
    setLocal(nuevoLocal);
    setVisitante(nuevoVisitante);
    emitir(nuevoLocal, nuevoVisitante, penLocal, penVisitante);
  }

  function actualizarPenales(nuevoLocal: string, nuevoVisitante: string) {
    setPenLocal(nuevoLocal);
    setPenVisitante(nuevoVisitante);
    emitir(local, visitante, nuevoLocal, nuevoVisitante);
  }

  const empate = eliminatoria && aEntero(local) !== null && aEntero(local) === aEntero(visitante);

  return (
    <div className={styles.contenedorFila}>
      <div className={styles.fila}>
        <span className={styles.equipo}>
          <Flag code={partido.localCode} title={partido.local} />
          <span className={styles.nombre}>{partido.local}</span>
        </span>
        <span className={styles.marcador}>
          <input
            type="number"
            min={0}
            max={20}
            inputMode="numeric"
            className={styles.input}
            value={local}
            onChange={(e) => actualizarGoles(e.target.value, visitante)}
            aria-label={`Goles de ${partido.local}`}
          />
          <span className={styles.guion}>-</span>
          <input
            type="number"
            min={0}
            max={20}
            inputMode="numeric"
            className={styles.input}
            value={visitante}
            onChange={(e) => actualizarGoles(local, e.target.value)}
            aria-label={`Goles de ${partido.visitante}`}
          />
        </span>
        <span className={`${styles.equipo} ${styles.equipoVisitante}`}>
          <span className={styles.nombre}>{partido.visitante}</span>
          <Flag code={partido.visitanteCode} title={partido.visitante} />
        </span>
      </div>
      {empate && (
        <div className={styles.penales}>
          <span className={styles.penalesLabel}>Penales</span>
          <input
            type="number"
            min={0}
            max={20}
            inputMode="numeric"
            className={styles.input}
            value={penLocal}
            onChange={(e) => actualizarPenales(e.target.value, penVisitante)}
            aria-label={`Penales de ${partido.local}`}
          />
          <span className={styles.guion}>-</span>
          <input
            type="number"
            min={0}
            max={20}
            inputMode="numeric"
            className={styles.input}
            value={penVisitante}
            onChange={(e) => actualizarPenales(penLocal, e.target.value)}
            aria-label={`Penales de ${partido.visitante}`}
          />
        </div>
      )}
    </div>
  );
}
