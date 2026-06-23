import type { CSSProperties } from 'react';
import { Trophy } from 'lucide-react';
import type { FasePartido, Match } from '../../lib/types';
import { EmptyState } from '../ui/EmptyState';
import { Flag } from '../ui/Flag';
import styles from './KnockoutBracket.module.css';

interface KnockoutBracketProps {
  matches: Match[];
}

/** Rondas del cuadro principal, en orden (alimentan a la siguiente). */
const RONDAS: Array<{ fase: FasePartido; label: string }> = [
  { fase: 'dieciseisavos', label: 'Dieciseisavos' },
  { fase: 'octavos', label: 'Octavos' },
  { fase: 'cuartos', label: 'Cuartos' },
  { fase: 'semifinal', label: 'Semifinales' },
  { fase: 'final', label: 'Final' },
];

interface FilaProps {
  nombre: string;
  code: string;
  goles: number | null;
  hora?: string;
  ganador: boolean;
  perdedor: boolean;
}

function FilaEquipo({ nombre, code, goles, hora, ganador, perdedor }: FilaProps) {
  return (
    <div className={`${styles.fila} ${ganador ? styles.ganador : ''} ${perdedor ? styles.perdedor : ''}`}>
      <Flag code={code} title={nombre} />
      <span className={styles.equipoNombre}>{nombre}</span>
      {goles !== null ? (
        <span className={styles.golBox}>{goles}</span>
      ) : hora ? (
        <span className={styles.horaBox}>{hora}</span>
      ) : null}
    </div>
  );
}

/** Caja compacta de partido para el cuadro (no reutiliza MatchCard: necesita alto fijo). */
function CajaPartido({ match: m, destacada }: { match: Match; destacada?: boolean }) {
  const jugado = m.estado === 'finalizado' && m.golesLocal !== null && m.golesVisitante !== null;
  const localGana = jugado && (m.golesLocal as number) > (m.golesVisitante as number);
  const visitanteGana = jugado && (m.golesVisitante as number) > (m.golesLocal as number);

  return (
    <div className={`${styles.caja} ${destacada ? styles.cajaFinal : ''}`}>
      <FilaEquipo
        nombre={m.local}
        code={m.localCode}
        goles={jugado ? m.golesLocal : null}
        hora={!jugado ? m.hora : undefined}
        ganador={localGana}
        perdedor={visitanteGana}
      />
      <FilaEquipo
        nombre={m.visitante}
        code={m.visitanteCode}
        goles={jugado ? m.golesVisitante : null}
        hora={!jugado ? m.hora : undefined}
        ganador={visitanteGana}
        perdedor={localGana}
      />
    </div>
  );
}

/**
 * Líneas conectoras entre una ronda y la siguiente: una por cada par de partidos
 * que alimenta al partido siguiente. Posicionadas en % sobre la altura de la
 * propia columna — junto con `justify-content: space-around` en .partidos,
 * el partido N+1 cae matemáticamente centrado entre sus dos partidos previos
 * (ver KnockoutBracket.module.css), sin necesidad de medir píxeles en JS.
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

/**
 * Cuadro de eliminatoria con conectores reales entre rondas (en desktop).
 * NOTA: el emparejamiento (qué 2 partidos alimentan al siguiente) se infiere
 * por orden cronológico dentro de cada ronda — la API no expone la llave
 * explícita. Si en algún momento el orden real del sorteo no coincide con el
 * cronológico, las líneas pueden no representar el cruce exacto.
 */
export function KnockoutBracket({ matches }: KnockoutBracketProps) {
  const porRonda = RONDAS.map((r) => ({
    ...r,
    partidos: matches
      .filter((m) => m.fase === r.fase)
      .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora)),
  })).filter((r) => r.partidos.length > 0);

  const tercerPuesto = matches.find((m) => m.fase === 'tercer_puesto');

  if (porRonda.length === 0 && !tercerPuesto) {
    return (
      <EmptyState
        titulo="La eliminatoria todavía no arrancó"
        detalle="Cuando termine la fase de grupos, acá va a aparecer el cuadro de llaves: dieciseisavos, octavos, cuartos, semis y la final."
      />
    );
  }

  return (
    <div className={styles.envoltorio}>
      <div className={styles.cuadro}>
        {porRonda.map((ronda, i) => {
          const esFinal = ronda.fase === 'final';
          return (
            <section
              key={ronda.fase}
              className={`${styles.columna} stagger`}
              style={{ '--i': i } as CSSProperties}
            >
              <header className={`${styles.cabecera} texture`}>
                {esFinal && <Trophy size={12} className={styles.trofeoIcono} aria-hidden="true" />}
                <span className="kicker">{ronda.label}</span>
              </header>
              <div className={styles.partidos}>
                {ronda.partidos.map((m) => (
                  <CajaPartido key={m.id} match={m} destacada={esFinal} />
                ))}
                {i < porRonda.length - 1 && <Conectores cantidadPartidos={ronda.partidos.length} />}
              </div>
            </section>
          );
        })}
      </div>

      {tercerPuesto && (
        <div className={styles.tercerPuesto}>
          <header className={styles.cabeceraTercero}>
            <span className="kicker">Tercer puesto</span>
          </header>
          <CajaPartido match={tercerPuesto} />
        </div>
      )}
    </div>
  );
}
