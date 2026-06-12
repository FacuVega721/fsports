import { NavLink, useLocation } from 'react-router-dom';
import { Logo } from '../ui/Logo';
import { SportNav } from './SportNav';
import styles from './Header.module.css';

export function Header() {
  const { pathname } = useLocation();
  // En la portada no mostramos el header: la página ya es la marca en grande.
  if (pathname === '/') return null;

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <NavLink to="/" className={styles.marca} aria-label="FSports — inicio">
          <Logo />
        </NavLink>
        <SportNav />
      </div>
    </header>
  );
}
