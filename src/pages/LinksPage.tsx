import { useSeo } from '../hooks/useSeo';
import styles from './LinksPage.module.css';

const ENLACES = [
  {
    tag: 'WEB',
    label: 'Sitio web',
    handle: 'oficialfsports.com',
    href: 'https://oficialfsports.com',
  },
  {
    tag: '𝕏',
    label: 'Twitter / X',
    handle: '@oficialfsports',
    href: 'https://x.com/oficialfsports',
  },
  {
    tag: 'IG',
    label: 'Instagram',
    handle: '@oficialfsports',
    href: 'https://instagram.com/oficialfsports',
  },
  {
    tag: 'TT',
    label: 'TikTok',
    handle: '@oficialfsports',
    href: 'https://tiktok.com/@oficialfsports',
  },
];

export default function LinksPage() {
  useSeo(
    'FSports — Links',
    'Todos los enlaces de FSports: web, X, Instagram y TikTok.',
    '/links',
  );

  return (
    <div className={styles.pagina}>
      <div className={styles.contenido}>

        <header className={styles.hero}>
          <span className={styles.logoTexto} aria-label="FSports">FSports</span>
          <p className={styles.tagline}>Fanáticos del deporte.</p>
        </header>

        <div className={styles.separador} aria-hidden="true" />

        <nav className={styles.lista} aria-label="Redes y sitio web">
          {ENLACES.map((e) => (
            <a
              key={e.href}
              className={styles.enlace}
              href={e.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={styles.tag} aria-hidden="true">{e.tag}</span>
              <span className={styles.label}>{e.label}</span>
              <span className={styles.handle}>{e.handle}</span>
            </a>
          ))}
        </nav>

        <p className={styles.pie}>FSports © 2026</p>
      </div>
    </div>
  );
}
