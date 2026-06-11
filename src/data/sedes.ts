/**
 * SEDES DEL MUNDIAL 2026 — estadios y ciudades.
 *
 * La API gratuita de football-data.org NO devuelve la sede de cada partido,
 * así que la cargamos acá a mano. Dos partes:
 *   1) SEDES: las 16 sedes oficiales (dato firme).
 *   2) SEDE_POR_PARTIDO: qué sede le corresponde a cada partido.
 *
 * ── CÓMO ASIGNAR UN PARTIDO A SU SEDE ──
 * En SEDE_POR_PARTIDO agregá una línea con la forma:
 *     "Local vs Visitante": "claveDeSede",
 * usando los nombres EN ESPAÑOL tal como aparecen en la web, y una clave
 * de las que están en SEDES (ej: "azteca", "metlife", "sofi"...).
 * Ejemplo:  "Argentina vs Argelia": "miami",
 *
 * Si un partido no está en la lista, simplemente no muestra sede (no rompe nada).
 */

export interface Sede {
  estadio: string;
  ciudad: string;
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

/**
 * Asignación partido → sede, por "Local vs Visitante" (nombres en español).
 *
 * ⚠️ De momento solo está cargado el partido INAUGURAL (dato firme). El resto
 * conviene completarlo con el calendario oficial para no poner sedes erróneas.
 * Agregá líneas siguiendo el ejemplo de arriba.
 */
export const SEDE_POR_PARTIDO: Record<string, string> = {
  // ── 1ª fecha (jornada inaugural) — datos oficiales FIFA ──
  'México vs Sudáfrica': 'azteca',
  'Corea del Sur vs República Checa': 'akron',
  'Canadá vs Bosnia y Herzegovina': 'bmo',
  'Estados Unidos vs Paraguay': 'sofi',
  'Catar vs Suiza': 'levis',
  'Brasil vs Marruecos': 'metlife',
  'Haití vs Escocia': 'gillette',
  'Australia vs Turquía': 'bcplace',
  'Alemania vs Curazao': 'nrg',
  'Países Bajos vs Japón': 'att',
  'Costa de Marfil vs Ecuador': 'lincoln',
  'Suecia vs Túnez': 'bbva',
  'España vs Cabo Verde': 'mercedes',
  'Bélgica vs Egipto': 'lumen',
  'Arabia Saudita vs Uruguay': 'hardrock',
  'Irán vs Nueva Zelanda': 'sofi',
  'Francia vs Senegal': 'metlife',
  'Irak vs Noruega': 'gillette',
  'Argentina vs Argelia': 'arrowhead',
  'Austria vs Jordania': 'levis',
  // 👉 Próximas fechas: agregá "Local vs Visitante": "claveDeSede",
};
