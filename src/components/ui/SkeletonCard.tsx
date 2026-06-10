import type { CSSProperties } from 'react';
import styles from './States.module.css';

interface SkeletonCardProps {
  /** Cantidad de tarjetas fantasma */
  count?: number;
  /** Altura de cada tarjeta en px */
  alto?: number;
}

/** Skeletons con shimmer — el loading también respeta la estética. */
export function SkeletonCard({ count = 3, alto = 84 }: SkeletonCardProps) {
  return (
    <div className={styles.skeletons} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={styles.skeleton}
          style={{ height: alto, '--i': i } as CSSProperties}
        />
      ))}
    </div>
  );
}
