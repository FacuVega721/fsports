import { useEffect, useState } from 'react';
import styles from './Flag.module.css';

/**
 * Bandera de país con flag-icons (CDN). Robustez: si el CSS del CDN no
 * cargó (sin internet, CDN caído) o el código no existe, mostramos el
 * código del país como texto — nunca un hueco roto.
 */

let flagsCssCache: boolean | null = null;

function flagsCssDisponible(): boolean {
  if (flagsCssCache !== null) return flagsCssCache;
  try {
    const probe = document.createElement('span');
    probe.className = 'fi fi-ar';
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    document.body.appendChild(probe);
    // flag-icons define background-repeat: no-repeat en .fi;
    // si el CSS no cargó, el valor computado queda en "repeat"
    const loaded = getComputedStyle(probe).backgroundRepeat === 'no-repeat';
    probe.remove();
    flagsCssCache = loaded;
    return loaded;
  } catch {
    flagsCssCache = false;
    return false;
  }
}

interface FlagProps {
  /** Código ISO de 2 letras (ar, br, mx) o subdivisión (gb-eng, gb-sct) */
  code: string;
  /** Nombre del país, para lectores de pantalla */
  title?: string;
}

export function Flag({ code, title }: FlagProps) {
  // Optimista al inicio para no parpadear; se corrige tras montar si el CDN falló
  const [cssOk, setCssOk] = useState(flagsCssCache ?? true);

  useEffect(() => {
    setCssOk(flagsCssDisponible());
  }, []);

  const limpio = code.trim().toLowerCase();

  if (!cssOk || limpio === '') {
    return (
      <span className={styles.fallback} aria-label={title ?? limpio}>
        {(limpio || '—').slice(0, 3).toUpperCase()}
      </span>
    );
  }

  return (
    <span
      className={`fi fi-${limpio} ${styles.flag}`}
      role="img"
      aria-label={title ?? limpio.toUpperCase()}
    />
  );
}
