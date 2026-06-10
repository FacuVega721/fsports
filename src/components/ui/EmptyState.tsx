import { CalendarOff } from 'lucide-react';
import styles from './States.module.css';

interface EmptyStateProps {
  titulo: string;
  detalle?: string;
}

/** Estado vacío en la voz de la marca — nunca un hueco crudo. */
export function EmptyState({ titulo, detalle }: EmptyStateProps) {
  return (
    <div className={styles.estado}>
      <CalendarOff size={28} strokeWidth={1.5} className={styles.icono} aria-hidden="true" />
      <p className={styles.titulo}>{titulo}</p>
      {detalle && <p className={styles.detalle}>{detalle}</p>}
    </div>
  );
}
