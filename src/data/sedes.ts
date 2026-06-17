/**
 * DATOS POR PARTIDO DEL MUNDIAL 2026 — sede (estadio + ciudad) y TV.
 *
 * La API gratuita NO trae ni la sede ni los canales, así que los cargamos acá
 * a mano (datos oficiales de FIFA, ya en versión Argentina).
 *
 * ── CÓMO AGREGAR UN PARTIDO ──
 * En INFO_POR_PARTIDO agregá una línea con la forma:
 *     "Local vs Visitante": { sede: "claveDeSede", tv: ["dsports", "dgo"] },
 * usando los nombres EN ESPAÑOL tal como aparecen en la web. El orden
 * local/visitante no importa (se prueba en los dos sentidos).
 *   - sede: una clave de SEDES (ej: "azteca", "metlife", "sofi"...).
 *   - tv: lista de claves de CANALES (ej: "tyc", "dsports", "dgo").
 * Cualquiera de los dos puede faltar; si falta, simplemente no se muestra.
 */

export interface Sede {
  estadio: string;
  ciudad: string;
}

export interface InfoPartido {
  sede?: string;
  tv?: string[];
}

/** Las 16 sedes oficiales (estadio + ciudad). Dato confirmado. */
export const SEDES: Record<string, Sede> = {
  // 🇲🇽 México
  azteca: { estadio: 'Estadio Azteca', ciudad: 'Ciudad de México' },
  akron: { estadio: 'Estadio Akron', ciudad: 'Guadalajara' },
  bbva: { estadio: 'Estadio BBVA', ciudad: 'Monterrey' },
  // 🇨🇦 Canadá
  bmo: { estadio: 'BMO Field', ciudad: 'Toronto' },
  bcplace: { estadio: 'BC Place', ciudad: 'Vancouver' },
  // 🇺🇸 Estados Unidos
  metlife: { estadio: 'MetLife Stadium', ciudad: 'Nueva York / Nueva Jersey' },
  att: { estadio: 'AT&T Stadium', ciudad: 'Dallas' },
  mercedes: { estadio: 'Mercedes-Benz Stadium', ciudad: 'Atlanta' },
  nrg: { estadio: 'NRG Stadium', ciudad: 'Houston' },
  arrowhead: { estadio: 'Arrowhead Stadium', ciudad: 'Kansas City' },
  lincoln: { estadio: 'Lincoln Financial Field', ciudad: 'Filadelfia' },
  levis: { estadio: "Levi's Stadium", ciudad: 'San Francisco' },
  lumen: { estadio: 'Lumen Field', ciudad: 'Seattle' },
  hardrock: { estadio: 'Hard Rock Stadium', ciudad: 'Miami' },
  sofi: { estadio: 'SoFi Stadium', ciudad: 'Los Ángeles' },
  gillette: { estadio: 'Gillette Stadium', ciudad: 'Boston' },
};

/** Canales de TV (clave → nombre visible). Transmisión en Argentina. */
export const CANALES: Record<string, string> = {
  tyc: 'TyC Sports',
  dsports: 'DSPORTS',
  dgo: 'DGO',
};

/**
 * Info por partido (sede + TV), por "Local vs Visitante" (nombres en español).
 * Cargada la 1ª fecha (jornada inaugural) con datos oficiales de FIFA.
 */
export const INFO_POR_PARTIDO: Record<string, InfoPartido> = {
  // ── 1ª fecha (jornada inaugural) ──
  'México vs Sudáfrica': { sede: 'azteca', tv: ['dsports', 'dgo'] },
  'Corea del Sur vs República Checa': { sede: 'akron', tv: ['tyc', 'dsports', 'dgo'] },
  'Canadá vs Bosnia y Herzegovina': { sede: 'bmo', tv: ['dsports', 'dgo'] },
  'Estados Unidos vs Paraguay': { sede: 'sofi', tv: ['tyc', 'dsports', 'dgo'] },
  'Catar vs Suiza': { sede: 'levis', tv: ['dsports', 'dgo'] },
  'Brasil vs Marruecos': { sede: 'metlife', tv: ['dsports', 'dgo'] },
  'Haití vs Escocia': { sede: 'gillette', tv: ['tyc', 'dsports', 'dgo'] },
  'Australia vs Turquía': { sede: 'bcplace', tv: ['tyc', 'dsports', 'dgo'] },
  'Alemania vs Curazao': { sede: 'nrg', tv: ['dsports', 'dgo'] },
  'Países Bajos vs Japón': { sede: 'att', tv: ['tyc', 'dsports', 'dgo'] },
  'Costa de Marfil vs Ecuador': { sede: 'lincoln', tv: ['dsports', 'dgo'] },
  'Suecia vs Túnez': { sede: 'bbva', tv: ['tyc', 'dsports', 'dgo'] },
  'España vs Cabo Verde': { sede: 'mercedes', tv: ['dsports', 'dgo'] },
  'Bélgica vs Egipto': { sede: 'lumen', tv: ['tyc', 'dsports', 'dgo'] },
  'Arabia Saudita vs Uruguay': { sede: 'hardrock', tv: ['tyc', 'dsports', 'dgo'] },
  'Irán vs Nueva Zelanda': { sede: 'sofi', tv: ['tyc', 'dsports', 'dgo'] },
  'Francia vs Senegal': { sede: 'metlife', tv: ['dsports', 'dgo'] },
  'Irak vs Noruega': { sede: 'gillette', tv: ['tyc', 'dsports', 'dgo'] },
  'Argentina vs Argelia': { sede: 'arrowhead', tv: ['tyc', 'dsports', 'dgo'] },
  'Austria vs Jordania': { sede: 'levis', tv: ['tyc', 'dsports', 'dgo'] },
  // ── 2ª+ fechas (de las capturas) ──
  'Países Bajos vs Suecia': { sede: 'nrg', tv: ['tyc', 'dsports', 'dgo'] },
  'Alemania vs Costa de Marfil': { sede: 'bmo', tv: ['tyc', 'dsports', 'dgo'] },
  'Ecuador vs Curazao': { sede: 'arrowhead', tv: ['dsports', 'dgo'] },
  'Escocia vs Marruecos': { sede: 'gillette', tv: ['dsports', 'dgo'] },
  'Brasil vs Haití': { sede: 'lincoln', tv: ['tyc', 'dsports', 'dgo'] },
  'Turquía vs Paraguay': { sede: 'levis', tv: ['dsports', 'dgo'] },
  'Canadá vs Catar': { sede: 'bcplace', tv: ['dsports', 'dgo'] },
  'México vs Corea del Sur': { sede: 'akron', tv: ['tyc', 'dsports', 'dgo'] },
  'Estados Unidos vs Australia': { sede: 'lumen', tv: ['tyc', 'dsports', 'dgo'] },
  'Uzbekistán vs Colombia': { sede: 'azteca', tv: ['tyc', 'dsports', 'dgo'] },
  'República Checa vs Sudáfrica': { sede: 'mercedes', tv: ['tyc', 'dsports', 'dgo'] },
  'Suiza vs Bosnia y Herzegovina': { sede: 'sofi', tv: ['dsports', 'dgo'] },
  'Portugal vs RD del Congo': { sede: 'nrg', tv: ['dsports', 'dgo'] },
  'Inglaterra vs Croacia': { sede: 'att', tv: ['tyc', 'dsports', 'dgo'] },
  'Ghana vs Panamá': { sede: 'bmo', tv: ['tyc', 'dsports', 'dgo'] },
  // 👉 Seguir cargando con capturas de FIFA
};

/** Busca la info de un partido probando ambos órdenes (local/visitante). */
export function infoPartido(local: string, visitante: string): InfoPartido {
  return (
    INFO_POR_PARTIDO[`${local} vs ${visitante}`] ??
    INFO_POR_PARTIDO[`${visitante} vs ${local}`] ??
    {}
  );
}
