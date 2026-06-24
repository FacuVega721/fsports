import { useState } from 'react';
import { largoX, LIMITE_X } from '../../lib/social';
import { CopyButton } from '../ui/CopyButton';
import styles from './EditablePost.module.css';

interface EditablePostProps {
  /** Etiqueta corta que identifica el posteo (ej: nombre del partido) */
  titulo: string;
  /** Texto generado, precarga el textarea (editable antes de copiar) */
  texto: string;
}

/** Tarjeta con el texto de un posteo, editable antes de copiar. */
export function EditablePost({ titulo, texto }: EditablePostProps) {
  const [valor, setValor] = useState(texto);
  const largo = largoX(valor);
  const sobrepasado = largo > LIMITE_X;
  const cerca = !sobrepasado && largo > LIMITE_X - 20;

  return (
    <div className={styles.post}>
      <div className={styles.cabecera}>
        <span className="kicker">{titulo}</span>
        <CopyButton text={valor} label="Copiar" />
      </div>
      <textarea
        className={styles.textarea}
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        rows={6}
        aria-label={`Texto del posteo: ${titulo}`}
      />
      <span className={`${styles.contador} ${sobrepasado ? styles.contadorOver : cerca ? styles.contadorCerca : ''}`}>
        {largo} / {LIMITE_X}
      </span>
    </div>
  );
}
