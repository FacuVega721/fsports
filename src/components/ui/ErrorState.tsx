import { RefreshCw, WifiOff } from 'lucide-react';
import styles from './States.module.css';

interface ErrorStateProps {
  titulo?: string;
  detalle?: string;
  onRetry?: () => void;
}

/** Estado de error elegante con reintento. La web nunca queda en blanco. */
export function ErrorState({
  titulo = 'No pudimos traer los datos',
  detalle = 'Puede ser un problema de conexión o de la fuente de datos. Probá de nuevo en unos segundos.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className={styles.estado} role="alert">
      <WifiOff size={28} strokeWidth={1.5} className={styles.icono} aria-hidden="true" />
      <p className={styles.titulo}>{titulo}</p>
      <p className={styles.detalle}>{detalle}</p>
      {onRetry && (
        <button className={styles.reintentar} onClick={onRetry}>
          <RefreshCw size={14} aria-hidden="true" />
          Reintentar
        </button>
      )}
    </div>
  );
}
