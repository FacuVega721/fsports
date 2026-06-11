import styles from './Logo.module.css';

/**
 * Wordmark de la marca: "FSports" en tipografía condensada deportiva, blanco,
 * con leve inclinación agresiva (al estilo del logo oficial). Una sola palabra.
 */
export function Logo() {
  return (
    <span className={styles.logo} aria-label="FSports">
      FSports
    </span>
  );
}
