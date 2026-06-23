import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './TerminoAyuda.module.css';

interface TerminoAyudaProps {
  /** Explicación en lenguaje simple, se muestra al pasar el cursor o tocar */
  texto: string;
  /** Contenido abreviado (ej: "FIN", "DNF") que actúa de gatillo */
  children: ReactNode;
}

interface Posicion {
  top: number;
  left: number;
  abajo: boolean;
}

/**
 * Aclaración para jerga deportiva (FIN, ET, DNF...). Se abre al pasar el mouse
 * (desktop) o al tocar (mobile, sin hover). El globo se renderiza en un portal
 * a document.body y se posiciona con coordenadas reales del gatillo — así no
 * lo recorta ningún contenedor con overflow:hidden ni queda atado al ancho
 * de la fila/tarjeta donde vive.
 *
 * No es un <button> real a propósito: varios usos quedan anidados dentro de
 * filas/chips que YA son clickeables, y un <button> dentro de otro <button>
 * rompe el HTML. Por eso usa role="button" en un <span>.
 */
export function TerminoAyuda({ texto, children }: TerminoAyudaProps) {
  const [pos, setPos] = useState<Posicion | null>(null);
  const gatilloRef = useRef<HTMLSpanElement>(null);
  const id = useId();
  const abierto = pos !== null;

  function abrir() {
    const r = gatilloRef.current?.getBoundingClientRect();
    if (!r) return;
    const margen = 70;
    const vw = window.innerWidth || document.documentElement.clientWidth || 0;
    const centro = r.left + r.width / 2;
    const left = vw > margen * 2 ? Math.min(Math.max(centro, margen), vw - margen) : centro;
    const arriba = r.top > 56;
    setPos({ top: arriba ? r.top - 8 : r.bottom + 8, left, abajo: !arriba });
  }

  function cerrar() {
    setPos(null);
  }

  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') cerrar(); };
    const onScrollOrResize = () => cerrar();
    const onPointerDown = (e: Event) => {
      if (!gatilloRef.current?.contains(e.target as Node)) cerrar();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [abierto]);

  return (
    <span
      ref={gatilloRef}
      role="button"
      tabIndex={0}
      aria-describedby={abierto ? id : undefined}
      aria-expanded={abierto}
      className={styles.gatillo}
      onMouseEnter={abrir}
      onMouseLeave={cerrar}
      onFocus={abrir}
      onBlur={cerrar}
      onClick={(e) => {
        e.stopPropagation();
        abierto ? cerrar() : abrir();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          abierto ? cerrar() : abrir();
        }
      }}
    >
      {children}
      {abierto && createPortal(
        <span
          role="tooltip"
          id={id}
          className={`${styles.globo} ${pos.abajo ? styles.globoAbajo : ''}`}
          style={{ top: pos.top, left: pos.left }}
        >
          {texto}
        </span>,
        document.body,
      )}
    </span>
  );
}
