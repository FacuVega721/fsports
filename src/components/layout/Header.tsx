import { NavLink } from 'react-router-dom';
import { Logo } from '../ui/Logo';
import styles from './Header.module.css';

export function Header() {
  const claseLink = ({ isActive }: { isActive: boolean }) =>
    isActive ? `${styles.link} ${styles.activo}` : styles.link;

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <NavLink to="/" className={styles.marca} aria-label="FSports — inicio">
          <Logo />
        </NavLink>
        <nav className={styles.nav} aria-label="Secciones">
          <NavLink to="/" end className={claseLink}>
            Fútbol
          </NavLink>
          <NavLink to="/f1" className={claseLink}>
            F1
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
