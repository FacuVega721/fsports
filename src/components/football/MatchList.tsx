import type { Match } from '../../lib/types';
import { formatFecha, hoyArg } from '../../lib/time';
import { MatchCard } from './MatchCard';
import styles from './MatchList.module.css';

interface MatchListProps {
  matches: Match[];
  /** Al hacer clic en un partido (se pasa su grupo, para abrir el detalle del grupo) */
  onSelectGroup?: (grupo: string) => void;
  /** Al hacer clic en el nombre de un equipo (abre el detalle del país) */
  onSelectPais?: (nombre: string) => void;
}

/** Lista de partidos agrupados por día, con encabezado de fecha. */
export function MatchList({ matches, onSelectGroup, onSelectPais }: MatchListProps) {
  const hoy = hoyArg();

  // Agrupar preservando el orden de llegada (ya viene ordenado por fecha)
  const grupos: Array<{ fecha: string; partidos: Match[] }> = [];
  for (const match of matches) {
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.fecha === match.fecha) {
      ultimo.partidos.push(match);
    } else {
      grupos.push({ fecha: match.fecha, partidos: [match] });
    }
  }

  let indiceGlobal = 0;

  return (
    <div className={styles.lista}>
      {grupos.map((grupo) => (
        <section key={grupo.fecha || 'sin-fecha'} className={styles.dia}>
          <h3 className={styles.fecha}>
            {grupo.fecha === hoy && <span className={styles.hoyTag}>HOY</span>}
            {grupo.fecha ? formatFecha(grupo.fecha) : 'Fecha a confirmar'}
          </h3>
          <div className={styles.partidos}>
            {grupo.partidos.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                index={indiceGlobal++}
                onSelectGroup={onSelectGroup}
                onSelectPais={onSelectPais}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
