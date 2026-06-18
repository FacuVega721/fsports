import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import styles from './SportNav.module.css';

const DEPORTES = [
  { to: '/futbol', label: 'Mundial 2026' },
  { to: '/f1', label: 'Fórmula 1' },
];

/** Selector de deporte (desplegable) para cambiar de sección desde adentro. */
export function SportNav() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const actual = DEPORTES.find((d) => pathname.startsWith(d.to))?.label ?? 'Deportes';

  return (
    <div className={styles.wrap}>
      <button
        className={styles.boton}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {actual}
        <ChevronDown size={15} className={open ? styles.chevronOpen : ''} aria-hidden="true" />
      </button>

      {open && (
        <>
          <div className={styles.backdrop} onClick={() => setOpen(false)} />
          <ul className={styles.menu} role="menu">
            {DEPORTES.map((d) => (
              <li key={d.to} role="none">
                <NavLink
                  to={d.to}
                  role="menuitem"
                  className={({ isActive }) =>
                    isActive ? `${styles.item} ${styles.activo}` : styles.item
                  }
                  onClick={() => setOpen(false)}
                >
                  {d.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
