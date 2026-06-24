import { Logo } from '../components/ui/Logo';
import { useSeo } from '../hooks/useSeo';
import styles from './LinksPage.module.css';

interface EnlaceBio {
  icono: string;
  label: string;
  href: string;
}

const ENLACES: EnlaceBio[] = [
  { icono: '🌐', label: 'Web', href: 'https://oficialfsports.com' },
  { icono: '𝕏', label: 'Twitter/X', href: 'https://x.com/oficialfsports' },
  { icono: '📸', label: 'Instagram', href: 'https://instagram.com/oficialfsports' },
  { icono: '🎵', label: 'TikTok', href: 'https://tiktok.com/@oficialfsports' },
];

export default function LinksPage() {
  useSeo(
    'Enlaces',
    'Todos los enlaces de FSports: web, X, Instagram y TikTok.',
    '/links',
  );

  return (
    <div className={styles.pagina}>
      <div className={styles.contenido}>
        <header className={styles.cabecera}>
          <Logo />
          <p className={styles.nombre}>FSports</p>
          <p className={styles.tagline}>Fútbol y F1, con otro estilo</p>
        </header>

        <nav className={styles.lista}>
          {ENLACES.map((e) => (
            <a
              key={e.href}
              className={styles.enlace}
              href={e.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={styles.icono} aria-hidden="true">{e.icono}</span>
              <span>{e.label}</span>
            </a>
          ))}
        </nav>

        <p className={styles.pie}>FSports © 2026</p>
      </div>
    </div>
  );
}
