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
  // Mundial 2022 + Eurocopa 2024:
  Spain: 'es',
  France: 'fr',
  England: 'gb-eng',
  Scotland: 'gb-sct',
  Wales: 'gb-wls',
  Germany: 'de',
  Italy: 'it',
  Portugal: 'pt',
  Netherlands: 'nl',
  Belgium: 'be',
  Croatia: 'hr',
  Morocco: 'ma',
  Japan: 'jp',
  Albania: 'al',
  Australia: 'au',
  Austria: 'at',
  Cameroon: 'cm',
  'Czech Republic': 'cz',
  Denmark: 'dk',
  Georgia: 'ge',
  Ghana: 'gh',
  Hungary: 'hu',
  'Iran, Islamic Republic of': 'ir',
  'Korea (South)': 'kr',
  Poland: 'pl',
  Qatar: 'qa',
  Romania: 'ro',
  'Saudi Arabia': 'sa',
  Senegal: 'sn',
  Serbia: 'rs',
  Slovakia: 'sk',
  Slovenia: 'si',
  Switzerland: 'ch',
  Tunisia: 'tn',
  Turkey: 'tr',
  Ukraine: 'ua',
};

/** Normaliza espacios raros (ej. NBSP  , que StatsBomb usa en algunos nombres) a espacio normal. */
function normalizarEspacios(s: string): string {
  return s.replace(/\s/g, ' ');
}

/** Quita cualificadores entre paréntesis: "Venezuela (Bolivarian Republic)" → "Venezuela". */
function base(pais: string): string {
  return normalizarEspacios(pais).replace(/\s*\(.*\)\s*/g, '').trim();
}

const ES_OVERRIDE: Record<string, string> = {
  'United States of America': 'Estados Unidos',
  'United States': 'Estados Unidos',
  'Iran, Islamic Republic of': 'Irán',
  'Korea (South)': 'Corea del Sur',
};

export function codigoBandera(pais: string | undefined): string {
  if (!pais) return '';
  const p = normalizarEspacios(pais);
  return CODIGO[p] ?? CODIGO[base(p)] ?? '';
}

export function paisEspanol(pais: string | undefined): string {
  if (!pais) return '';
  const p = normalizarEspacios(pais);
  const b = base(p);
  return ES_OVERRIDE[p] ?? ES_OVERRIDE[b] ?? nombreEspanol(b);
}
