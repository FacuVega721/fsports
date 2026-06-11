import type { FasePartido, Match } from '../../lib/types';
import { EmptyState } from '../ui/EmptyState';
import { Flag } from '../ui/Flag';
import styles from './BracketView.module.css';

interface BracketViewProps {
  matches: Match[];
}

/** Rondas que forman el cuadro principal (el 3° puesto va aparte). */
const RONDAS: Array<{ fase: FasePartido; label: string }> = [
  { fase: 'dieciseisavos', label: '16avos' },
  { fase: 'octavos', label: 'Octavos' },
  { fase: 'cuartos', label: 'Cuartos' },
  { fase: 'semifinal', label: 'Semis' },
  { fase: 'final', label: 'Final' },
];

function ordenar(a: Match, b: Match) {
  return a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora);
}

/** Una llave (fila de un equipo dentro del partido). */
function Lado({
  nombre,
  code,
  goles,
  ganador,
}: {
  nombre: string;
  code: string;
  goles: number | null;
  ganador: boolean;
}) {
  const definido = nombre !== 'Por definir' && nombre !== '';
  return (
    <div className={`${styles.lado} ${ganador ? styles.ganador : ''}`}>
      {definido ? (
        <Flag code={code} title={nombre} />
      ) : (
        <span className={styles.sinFlag} aria-hidden="true" />
      )}
      <span className={`${styles.nombre} ${definido ? '' : styles.tbd}`}>
        {definido ? nombre : 'Por definir'}
      </span>
      {goles !== null && <span className={styles.goles}>{goles}</span>}
    </div>
  );
}

function Llave({ m }: { m: Match }) {
  const finalizado = m.estado === 'finalizado';
  const localGana = finalizado && (m.golesLocal ?? 0) > (m.golesVisitante ?? 0);
  const visitGana = finalizado && (m.golesVisitante ?? 0) > (m.golesLocal ?? 0);
  return (
    <div className={styles.llave}>
      <Lado nombre={m.local} code={m.localCode} goles={m.golesLocal} ganador={localGana} />
      <Lado
        nombre={m.visitante}
        code={m.visitanteCode}
        goles={m.golesVisitante}
        ganador={visitGana}
      />
    </div>
  );
}

/**
 * Cuadro de llaves: una columna por ronda. El espaciado vertical (space-around)
 * hace que cada partido quede centrado frente al par de la ronda anterior,
 * dando la forma clásica de bracket. Scroll horizontal en pantallas chicas.
 */
export function BracketView({ matches }: BracketViewProps) {
  const columnas = RONDAS.map((r) => ({
    ...r,
    partidos: matches.filter((m) => m.fase === r.fase).sort(ordenar),
  })).filter((c) => c.partidos.length > 0);

  const tercero = matches.filter((m) => m.fase === 'tercer_puesto').sort(ordenar);

  if (columnas.length === 0) {
    return (
      <EmptyState
        titulo="El cuadro todavía no está definido"
        detalle="Cuando termine la fase de grupos se arman las llaves y vas a ver el cuadro completo acá."
      />
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.cuadro}>
        {columnas.map((col) => (
          <div key={col.fase} className={styles.columna}>
            <div className={styles.colHeader}>{col.label}</div>
            <div className={styles.llaves}>
              {col.partidos.map((m) => (
                <Llave key={m.id} m={m} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {tercero.length > 0 && (
        <div className={styles.tercero}>
          <div className={styles.colHeader}>Tercer puesto</div>
          {tercero.map((m) => (
            <Llave key={m.id} m={m} />
          ))}
        </div>
      )}
    </div>
  );
}
