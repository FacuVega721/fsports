import styles from './Logo.module.css';

/** Logo de la marca: la "F" en blanco cálido, "SPORTS" en naranja. */
export function Logo() {
  return (
    <span className={styles.logo} aria-label="FSports">
      <span className={styles.f}>F</span>
      <span className={styles.sports}>SPORTS</span>
    </span>
  );
}
