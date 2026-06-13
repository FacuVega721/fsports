import { useEffect, useMemo, useState } from 'react';
import { RotateCcw, Shuffle } from 'lucide-react';
import type { Match } from '../../lib/types';
import type { OverridesSim, ResultadoSim } from '../../lib/simulator/types';
import { simularTorneo } from '../../lib/simulator/simular';
import { SimuladorBracket } from './SimuladorBracket';
import { SimuladorGrupos } from './SimuladorGrupos';
import { Tabs } from '../ui/Tabs';
import styles from './Simulador.module.css';

interface SimuladorProps {
  matches: Match[];
}

const STORAGE_KEY = 'fsports-sim-2026';
type Vista = 'grupos' | 'eliminatoria';

function cargarOverrides(): OverridesSim {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as OverridesSim) : {};
  } catch {
    return {};
  }
}

/** Simulador de resultados del Mundial: el usuario edita partidos pendientes y ve el impacto en vivo. */
export function Simulador({ matches }: SimuladorProps) {
  const [overrides, setOverrides] = useState<OverridesSim>(cargarOverrides);
  const [vista, setVista] = useState<Vista>('grupos');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
    } catch {
      // localStorage no disponible (modo privado, etc.): la simulación sigue funcionando en memoria.
    }
  }, [overrides]);

  function actualizar(matchId: string, resultado: ResultadoSim | null) {
    setOverrides((prev) => {
      if (resultado === null) {
        if (!(matchId in prev)) return prev;
        const resto = { ...prev };
        delete resto[matchId];
        return resto;
      }
      return { ...prev, [matchId]: resultado };
    });
  }

  function reiniciar() {
    setOverrides({});
  }

  function completarAlAzar() {
    setOverrides((prev) => {
      const nuevo = { ...prev };
      matches
        .filter((m) => m.fase === 'grupos' && m.estado !== 'finalizado' && !(m.id in nuevo))
        .forEach((m) => {
          nuevo[m.id] = {
            golesLocal: Math.floor(Math.random() * 4),
            golesVisitante: Math.floor(Math.random() * 4),
          };
        });
      return nuevo;
    });
  }

  const simulacion = useMemo(() => simularTorneo(matches, overrides), [matches, overrides]);

  return (
    <div className={styles.contenedor}>
      <div className={styles.toolbar}>
        <p className={styles.info}>
          Probá resultados hipotéticos para los partidos que faltan y mirá cómo quedarían las
          tablas, los mejores terceros y el cuadro de eliminatoria hasta la final.
        </p>
        <div className={styles.acciones}>
          <button type="button" className={styles.boton} onClick={completarAlAzar}>
            <Shuffle size={14} aria-hidden="true" />
            Completar al azar
          </button>
          <button type="button" className={styles.boton} onClick={reiniciar}>
            <RotateCcw size={14} aria-hidden="true" />
            Reiniciar
          </button>
        </div>
      </div>

      <Tabs
        label="Vista del simulador"
        tabs={[
          { id: 'grupos', label: 'Grupos' },
          { id: 'eliminatoria', label: 'Eliminatoria' },
        ]}
        active={vista}
        onChange={(id) => setVista(id as Vista)}
      />

      <div key={vista}>
        {vista === 'grupos' ? (
          <SimuladorGrupos
            matches={matches}
            standings={simulacion.standings}
            terceros={simulacion.terceros}
            overrides={overrides}
            onChange={actualizar}
          />
        ) : (
          <SimuladorBracket rondas={simulacion.rondas} overrides={overrides} onChange={actualizar} />
        )}
      </div>
    </div>
  );
}
