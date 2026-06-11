import { Logo } from '../ui/Logo';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.marca}>
          <Logo />
          <p className={styles.tagline}>Fanáticos del deporte.</p>
        </div>
        <div className={styles.notas}>
          <p>Todos los horarios en hora argentina (UTC-3).</p>
          <p>
            Fuentes: football-data.org · Jolpica-F1. Datos informativos, pueden
            tener demora.
          </p>
          <p className={styles.social}>
            Seguinos:{' '}
            <a
              className={styles.red}
              href="https://x.com/oficialfsports"
              target="_blank"
              rel="noopener noreferrer"
            >
              X
            </a>{' '}
            ·{' '}
            <a
              className={styles.red}
              href="https://instagram.com/oficialfsports"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>{' '}
            ·{' '}
            <a
              className={styles.red}
              href="https://tiktok.com/@oficialfsports"
              target="_blank"
              rel="noopener noreferrer"
            >
              TikTok
            </a>{' '}
            — @oficialfsports
          </p>
        </div>
      </div>
    </footer>
  );
}
