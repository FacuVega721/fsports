import { Link } from 'react-router-dom';
import { useTimezone } from '../../contexts/TimezoneContext';
import { esOffsetArgentina, etiquetaZona } from '../../lib/time';
import { Logo } from '../ui/Logo';
import styles from './Footer.module.css';

function IconX() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.402 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.26 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconTikTok() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.19 8.19 0 0 0 4.79 1.52V6.79a4.85 4.85 0 0 1-1.02-.1z" />
    </svg>
  );
}

export function Footer() {
  const tz = useTimezone();
  const esArg = esOffsetArgentina(tz);

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.marca}>
          <Logo />
          <p className={styles.tagline}>Fanáticos del deporte.</p>
          <div className={styles.redes}>
            <a
              className={styles.iconRed}
              href="https://x.com/oficialfsports"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
            >
              <IconX />
            </a>
            <a
              className={styles.iconRed}
              href="https://instagram.com/oficialfsports"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <IconInstagram />
            </a>
            <a
              className={styles.iconRed}
              href="https://tiktok.com/@oficialfsports"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
            >
              <IconTikTok />
            </a>
            <span className={styles.handle}>@oficialfsports</span>
          </div>
        </div>

        <div className={styles.notas}>
          <p>
            {esArg
              ? 'Todos los horarios en hora argentina (UTC-3).'
              : `Horarios ajustados a tu zona horaria (${etiquetaZona(tz)}).`}
          </p>
          <p>
            Datos con fines informativos. Los resultados pueden presentar demoras.
          </p>
          <p>
            <Link to="/terminos" className={styles.legal}>
              Términos y condiciones
            </Link>
            {' · '}
            <Link to="/privacidad" className={styles.legal}>
              Privacidad
            </Link>
            {' · '}© FSports {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
