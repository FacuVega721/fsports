/**
 * Históricos de la Copa Mundial de la FIFA — EDITABLE A MANO.
 *
 * football-data.org (la API que usa el sitio) no cubre Mundiales históricos
 * en su plan gratuito, solo la edición vigente. Esto es historia estable y
 * muy documentada (no cambia con el tiempo), así que se carga una sola vez
 * a mano. Cuando termine el Mundial 2026, agregar una fila más al final.
 */
export interface CampeonMundial {
  anio: number;
  campeon: string;
  campeonCode: string;
  subcampeon: string;
  sede: string;
  marcador: string;
}

export const CAMPEONES_MUNDIAL: CampeonMundial[] = [
  { anio: 1930, campeon: 'Uruguay', campeonCode: 'uy', subcampeon: 'Argentina', sede: 'Uruguay', marcador: '4-2' },
  { anio: 1934, campeon: 'Italia', campeonCode: 'it', subcampeon: 'Checoslovaquia', sede: 'Italia', marcador: '2-1' },
  { anio: 1938, campeon: 'Italia', campeonCode: 'it', subcampeon: 'Hungría', sede: 'Francia', marcador: '4-2' },
  { anio: 1950, campeon: 'Uruguay', campeonCode: 'uy', subcampeon: 'Brasil', sede: 'Brasil', marcador: '2-1' },
  { anio: 1954, campeon: 'Alemania', campeonCode: 'de', subcampeon: 'Hungría', sede: 'Suiza', marcador: '3-2' },
  { anio: 1958, campeon: 'Brasil', campeonCode: 'br', subcampeon: 'Suecia', sede: 'Suecia', marcador: '5-2' },
  { anio: 1962, campeon: 'Brasil', campeonCode: 'br', subcampeon: 'Checoslovaquia', sede: 'Chile', marcador: '3-1' },
  { anio: 1966, campeon: 'Inglaterra', campeonCode: 'gb-eng', subcampeon: 'Alemania', sede: 'Inglaterra', marcador: '4-2' },
  { anio: 1970, campeon: 'Brasil', campeonCode: 'br', subcampeon: 'Italia', sede: 'México', marcador: '4-1' },
  { anio: 1974, campeon: 'Alemania', campeonCode: 'de', subcampeon: 'Países Bajos', sede: 'Alemania', marcador: '2-1' },
  { anio: 1978, campeon: 'Argentina', campeonCode: 'ar', subcampeon: 'Países Bajos', sede: 'Argentina', marcador: '3-1' },
  { anio: 1982, campeon: 'Italia', campeonCode: 'it', subcampeon: 'Alemania', sede: 'España', marcador: '3-1' },
  { anio: 1986, campeon: 'Argentina', campeonCode: 'ar', subcampeon: 'Alemania', sede: 'México', marcador: '3-2' },
  { anio: 1990, campeon: 'Alemania', campeonCode: 'de', subcampeon: 'Argentina', sede: 'Italia', marcador: '1-0' },
  { anio: 1994, campeon: 'Brasil', campeonCode: 'br', subcampeon: 'Italia', sede: 'Estados Unidos', marcador: '0-0 (pen. 3-2)' },
  { anio: 1998, campeon: 'Francia', campeonCode: 'fr', subcampeon: 'Brasil', sede: 'Francia', marcador: '3-0' },
  { anio: 2002, campeon: 'Brasil', campeonCode: 'br', subcampeon: 'Alemania', sede: 'Corea del Sur / Japón', marcador: '2-0' },
  { anio: 2006, campeon: 'Italia', campeonCode: 'it', subcampeon: 'Francia', sede: 'Alemania', marcador: '1-1 (pen. 5-3)' },
  { anio: 2010, campeon: 'España', campeonCode: 'es', subcampeon: 'Países Bajos', sede: 'Sudáfrica', marcador: '1-0' },
  { anio: 2014, campeon: 'Alemania', campeonCode: 'de', subcampeon: 'Argentina', sede: 'Brasil', marcador: '1-0' },
  { anio: 2018, campeon: 'Francia', campeonCode: 'fr', subcampeon: 'Croacia', sede: 'Rusia', marcador: '4-2' },
  { anio: 2022, campeon: 'Argentina', campeonCode: 'ar', subcampeon: 'Francia', sede: 'Catar', marcador: '3-3 (pen. 4-2)' },
];
