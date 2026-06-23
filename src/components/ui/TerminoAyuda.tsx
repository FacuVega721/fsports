import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import styles from './TerminoAyuda.module.css';

interface TerminoAyudaProps {
  /** Explicación en lenguaje simple, se muestra al tocar/clickear */
  texto: string;
  /** Contenido abreviado (ej: "FIN", "DNF") que actúa de gatillo */
  children: ReactNode;
}

/**
 * Aclaración touch-friendly para jerga deportiva (FIN, ET, DNF...).
 * A diferencia de title="...", funciona igual en mobile (tap) y desktop (click).
 * No es un <button> real a propósito: varios usos quedan anidados dentro de
 * filas/chips que YA son clickeables, y un <button> dentro de otro <button>
 * rompe el HTML. Por eso usa role="button" en un <span>.
 */
export function TerminoAyuda({ texto, children }: TerminoAyudaProps) {
  const [abierto, setAbierto] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const id = useId();

  useEffect(() => {
    if (!abierto) return;
    function cerrar(e: Event) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setAbierto(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setAbierto(false);
    }
    document.addEventListener('pointerdown', cerrar);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', cerrar);
      document.removeEventListener('keydown', onKey);
    };
  }, [abierto]);

  return (
    <span className={styles.wrap} ref={wrapRef}>
      <span
        role="button"
        tabIndex={0}
        aria-describedby={abierto ? id : undefined}
        aria-expanded={abierto}
        className={styles.gatillo}
        onClick={(e) => {
          e.stopPropagation();
          setAbierto((v) => !v);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            setAbierto((v) => !v);
          }
        }}
      >
        {children}
      </span>
      {abierto && (
        <span role="tooltip" id={id} className={styles.globo}>
          {texto}
        </span>
      )}
    </span>
  );
}
