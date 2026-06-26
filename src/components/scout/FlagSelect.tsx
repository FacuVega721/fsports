import { useEffect, useRef, useState } from 'react';
import { Flag } from '../ui/Flag';
import { codigoBandera, paisEspanol } from '../../lib/scout/banderas';
import styles from './FlagSelect.module.css';

interface Props {
  /** Valor actual: nombre de país de StatsBomb, o '' para "todas". */
  value: string;
  /** Opciones: nombres de país de StatsBomb. */
  options: string[];
  onChange: (value: string) => void;
}

/** Dropdown de nacionalidad con bandera + nombre en español (flag-icons). */
export function FlagSelect({ value, options, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  function elegir(v: string) {
    onChange(v);
    setOpen(false);
  }

  return (
    <div className={styles.wrap} ref={ref}>
      <button
        type="button"
        className={styles.boton}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {value ? (
          <>
            <Flag code={codigoBandera(value)} title={paisEspanol(value)} />
            <span className={styles.txt}>{paisEspanol(value)}</span>
          </>
        ) : (
          <span className={styles.txt}>Selecciona nacionalidad</span>
        )}
        <span className={styles.chev} aria-hidden="true">▾</span>
      </button>

      {open && (
        <ul className={styles.lista} role="listbox">
          <li>
            <button type="button" onClick={() => elegir('')}>
              <span className={styles.txt}>Selecciona nacionalidad</span>
            </button>
          </li>
          {options.map((o) => (
            <li key={o}>
              <button type="button" onClick={() => elegir(o)}>
                <Flag code={codigoBandera(o)} title={paisEspanol(o)} />
                <span className={styles.txt}>{paisEspanol(o)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
