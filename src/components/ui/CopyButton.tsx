import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import styles from './CopyButton.module.css';

interface CopyButtonProps {
  /** Texto a copiar al portapapeles */
  text: string;
  /** Etiqueta del botón (oculta si iconOnly) */
  label?: string;
  /** Solo ícono (para espacios chicos, ej: tarjeta) */
  iconOnly?: boolean;
}

/** Botón que copia un texto al portapapeles y muestra confirmación. */
export function CopyButton({ text, label = 'Copiar', iconOnly = false }: CopyButtonProps) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(text);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Si el navegador bloquea el portapapeles, no rompemos nada.
    }
  }

  return (
    <button
      type="button"
      className={`${styles.boton} ${iconOnly ? styles.icono : ''} ${copiado ? styles.ok : ''}`}
      onClick={copiar}
      title={iconOnly ? (copiado ? '¡Copiado!' : label) : undefined}
      aria-label={iconOnly ? label : undefined}
    >
      {copiado ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
      {!iconOnly && <span>{copiado ? '¡Copiado!' : label}</span>}
    </button>
  );
}
