import styles from './LiveDot.module.css';

/** Punto rojo pulsante de "EN VIVO". */
export function LiveDot() {
  return <span className={styles.dot} aria-hidden="true" />;
}
