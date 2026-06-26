import { nombreEspanol } from '../paises';

/** Nombre de país de StatsBomb → código ISO-2 para flag-icons. */
const CODIGO: Record<string, string> = {
  Argentina: 'ar',
  Bolivia: 'bo',
  Brazil: 'br',
  Canada: 'ca',
  Chile: 'cl',
  Colombia: 'co',
  'Costa Rica': 'cr',
  Ecuador: 'ec',
  Jamaica: 'jm',
  Mexico: 'mx',
  Panama: 'pa',
  Paraguay: 'py',
  Peru: 'pe',
  'United States of America': 'us',
  'United States': 'us',
  Uruguay: 'uy',
  Venezuela: 've',
  // Extensibles para futuras competiciones:
  Spain: 'es',
  France: 'fr',
  England: 'gb-eng',
  Germany: 'de',
  Italy: 'it',
  Portugal: 'pt',
  Netherlands: 'nl',
  Belgium: 'be',
  Croatia: 'hr',
  Morocco: 'ma',
  Japan: 'jp',
};

/** Quita cualificadores entre paréntesis: "Venezuela (Bolivarian Republic)" → "Venezuela". */
function base(pais: string): string {
  return pais.replace(/\s*\(.*\)\s*/g, '').trim();
}

const ES_OVERRIDE: Record<string, string> = {
  'United States of America': 'Estados Unidos',
  'United States': 'Estados Unidos',
};

export function codigoBandera(pais: string | undefined): string {
  if (!pais) return '';
  return CODIGO[pais] ?? CODIGO[base(pais)] ?? '';
}

export function paisEspanol(pais: string | undefined): string {
  if (!pais) return '';
  const b = base(pais);
  return ES_OVERRIDE[pais] ?? ES_OVERRIDE[b] ?? nombreEspanol(b);
}
