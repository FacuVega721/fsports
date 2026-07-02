import { tierColor } from '../../lib/scout/tiers';
import styles from './ProgressRing.module.css';

interface ProgressRingProps {
  /** Valor 0-100 (percentil / score). */
  value: number;
  /** Diámetro en px (default 42). */
  size?: number;
  /** Grosor del anillo en px (default proporcional al tamaño). */
  strokeWidth?: number;
  /** Etiqueta accesible (ej. "Scout Score"). */
  label?: string;
}

/**
 * Anillo de progreso SVG coloreado semánticamente, con el número al centro.
 * Reutilizable: filas del buscador (chico) y rail del perfil (grande).
 */
export function ProgressRing({ value, size = 42, strokeWidth, label }: ProgressRingProps) {
  const v = Math.max(0, Math.min(100, value));
  const sw = strokeWidth ?? Math.max(3, Math.round(size * 0.1));
  const r = (size - sw) / 2;
  const cx = size / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - v / 100);
  const color = tierColor(v);

  return (
    <span
      className={styles.ring}
      style={{ width: size, height: size }}
      role="img"
      aria-label={label ? `${label}: ${v} de 100` : `${v} de 100`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth={sw} />
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cx})`}
          className={styles.progreso}
        />
      </svg>
      <span className={styles.numero} style={{ color, fontSize: Math.round(size * 0.31) }}>
        {v}
      </span>
    </span>
  );
}
