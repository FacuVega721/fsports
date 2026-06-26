/**
 * Traducción de posiciones de StatsBomb (inglés) a español.
 * El sitio es en español, así que el dato se guarda y muestra en español.
 * Se usa en la ingesta (scripts/ingest-statsbomb.ts) y como referencia.
 */
export const POSICION_ES: Record<string, string> = {
  Goalkeeper: 'Arquero',
  'Right Back': 'Lateral derecho',
  'Left Back': 'Lateral izquierdo',
  'Center Back': 'Central',
  'Right Center Back': 'Central derecho',
  'Left Center Back': 'Central izquierdo',
  'Right Wing Back': 'Carrilero derecho',
  'Left Wing Back': 'Carrilero izquierdo',
  'Defensive Midfield': 'Mediocentro defensivo',
  'Right Defensive Midfield': 'Volante defensivo derecho',
  'Left Defensive Midfield': 'Volante defensivo izquierdo',
  'Center Defensive Midfield': 'Mediocentro defensivo',
  'Center Midfield': 'Mediocentro',
  'Right Center Midfield': 'Mediocentro derecho',
  'Left Center Midfield': 'Mediocentro izquierdo',
  'Right Midfield': 'Volante derecho',
  'Left Midfield': 'Volante izquierdo',
  'Center Attacking Midfield': 'Enganche',
  'Right Attacking Midfield': 'Mediapunta derecho',
  'Left Attacking Midfield': 'Mediapunta izquierdo',
  'Right Wing': 'Extremo derecho',
  'Left Wing': 'Extremo izquierdo',
  'Center Forward': 'Delantero centro',
  'Right Center Forward': 'Delantero centro (der.)',
  'Left Center Forward': 'Delantero centro (izq.)',
  'Secondary Striker': 'Segundo delantero',
  Striker: 'Delantero',
};

export function posicionEspanol(pos: string | undefined): string {
  if (!pos) return '';
  return POSICION_ES[pos] ?? pos;
}
