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
          <p className={styles.social}>@FSports_21 en X e Instagram</p>
        </div>
      </div>
    </footer>
  );
}
