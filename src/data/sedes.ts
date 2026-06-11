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
  'México vs Sudáfrica': 'azteca', // Partido inaugural — 11/6/2026
  // "Local vs Visitante": "claveDeSede",
};
