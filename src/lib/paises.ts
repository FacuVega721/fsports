/**
 * Traducción de nombres de selecciones del inglés (como los devuelve
 * football-data.org) al español. Si un país no está en el mapa, se devuelve
 * el nombre original: nunca queda vacío.
 */
const ES: Record<string, string> = {
  // Sudamérica
  Argentina: 'Argentina', Brazil: 'Brasil', Uruguay: 'Uruguay', Colombia: 'Colombia',
  Ecuador: 'Ecuador', Paraguay: 'Paraguay', Chile: 'Chile', Peru: 'Perú',
  Venezuela: 'Venezuela', Bolivia: 'Bolivia',
  // Norte/Centroamérica y Caribe
  Mexico: 'México', 'United States': 'Estados Unidos', USA: 'Estados Unidos',
  Canada: 'Canadá', 'Costa Rica': 'Costa Rica', Panama: 'Panamá', Honduras: 'Honduras',
  Jamaica: 'Jamaica', Haiti: 'Haití', Curacao: 'Curazao', 'Curaçao': 'Curazao',
  // Europa
  Spain: 'España', France: 'Francia', England: 'Inglaterra', Germany: 'Alemania',
  Italy: 'Italia', Portugal: 'Portugal', Netherlands: 'Países Bajos', Belgium: 'Bélgica',
  Croatia: 'Croacia', Switzerland: 'Suiza', Austria: 'Austria', Denmark: 'Dinamarca',
  Sweden: 'Suecia', Norway: 'Noruega', Poland: 'Polonia', Scotland: 'Escocia',
  Wales: 'Gales', Serbia: 'Serbia', Turkey: 'Turquía', Türkiye: 'Turquía',
  Ukraine: 'Ucrania', 'Czech Republic': 'República Checa', Czechia: 'República Checa',
  Slovakia: 'Eslovaquia', Slovenia: 'Eslovenia', Hungary: 'Hungría', Romania: 'Rumania',
  Greece: 'Grecia', Albania: 'Albania', Georgia: 'Georgia',
  'Bosnia-Herzegovina': 'Bosnia y Herzegovina', 'Bosnia and Herzegovina': 'Bosnia y Herzegovina',
  // África
  Morocco: 'Marruecos', Senegal: 'Senegal', Tunisia: 'Túnez', Algeria: 'Argelia',
  Egypt: 'Egipto', Nigeria: 'Nigeria', Ghana: 'Ghana', Cameroon: 'Camerún',
  'Ivory Coast': 'Costa de Marfil', "Côte d'Ivoire": 'Costa de Marfil',
  'Côte d’Ivoire': 'Costa de Marfil', 'South Africa': 'Sudáfrica',
  'Cape Verde': 'Cabo Verde', 'Cape Verde Islands': 'Cabo Verde',
  'Congo DR': 'RD del Congo', 'DR Congo': 'RD del Congo',
  // Asia y Oceanía
  Japan: 'Japón', 'South Korea': 'Corea del Sur', 'Korea Republic': 'Corea del Sur',
  Australia: 'Australia', 'Saudi Arabia': 'Arabia Saudita', Iran: 'Irán', Qatar: 'Catar',
  Iraq: 'Irak', Jordan: 'Jordania', Uzbekistan: 'Uzbekistán', 'New Zealand': 'Nueva Zelanda',
};

/** Devuelve el nombre del país en español, o el original si no está mapeado. */
export function nombreEspanol(nombre: string | undefined | null): string {
  if (!nombre) return '';
  return ES[nombre] ?? ES[nombre.trim()] ?? nombre;
}
