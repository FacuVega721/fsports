/**
 * Reseñas breves de los equipos de F1 — EDITABLE A MANO.
 *
 * La API (Jolpica) no provee historia/biografía de los equipos, solo el dato
 * y un link a Wikipedia. Acá cargamos una reseña corta por escudería.
 *
 * La clave es el "constructorId" de la API (ej: "ferrari", "red_bull",
 * "mclaren"...). Si un equipo no está acá, no se muestra reseña (solo el
 * dato + link a Wikipedia). Editá o agregá libremente.
 */
export const HISTORIAL_EQUIPOS: Record<string, string> = {
  ferrari:
    'La escudería más antigua y laureada de la Fórmula 1: fundada en 1929, con base en Maranello, acumula 16 títulos de constructores — ninguno desde 2008. Sostenida por la pasión incondicional de los Tifosi, en 2025 sumó a Lewis Hamilton junto a Charles Leclerc para intentar romper esa sequía.',
  mclaren:
    'Fundado por Bruce McLaren en 1963, con base en Woking, Inglaterra. Por su escudería pasaron campeones como Senna, Prost, Hamilton y Alonso. Tras años de sequía, volvió a lo más alto con el título de constructores 2024 de la mano de Lando Norris y Oscar Piastri.',
  mercedes:
    'Equipo oficial de Mercedes-Benz desde 2010 (cuando absorbió al campeón Brawn GP), con base en Brackley, Inglaterra. Dominó la era de los motores híbridos con ocho títulos de constructores consecutivos (2014-2021), de la mano de Lewis Hamilton.',
  red_bull:
    'Escudería de la marca de bebidas energéticas desde 2005, con base en Milton Keynes, Inglaterra. Dominó dos eras distintas de la categoría: la de Sebastian Vettel (2010-2013) y la de Max Verstappen (2021-2024), siempre con una filosofía aerodinámica agresiva.',
  williams:
    'Fundado por Frank Williams en 1977, con base en Grove, Inglaterra. Uno de los equipos más ganadores de la historia (9 títulos de constructores), atraviesa desde hace más de una década un proceso de reconstrucción para volver a pelear arriba.',
  aston_martin:
    'La marca británica volvió a la Fórmula 1 en 2021 tras comprar el antiguo Force India/Racing Point, con base en Silverstone. Respaldada por la inversión del empresario Lawrence Stroll, construyó una de las fábricas más modernas de la parrilla.',
  alpine:
    'Es la marca deportiva de Renault en la Fórmula 1, con fábrica en Enstone, Inglaterra — la misma que ganó títulos como Benetton (Schumacher, 1994-1995) y como Renault (Alonso, 2005-2006).',
  haas:
    'El único equipo de capital estadounidense de la parrilla, fundado por Gene Haas en 2016. Opera con una estructura más chica que el resto de los equipos, comprando piezas de diseño a Ferrari bajo el reglamento técnico vigente.',
  rb:
    'Equipo hermano y "cantera" de pilotos de Red Bull, con base en Faenza, Italia. Compitió antes como Toro Rosso y AlphaTauri; por ahí debutaron Vettel, Ricciardo y Verstappen antes de subir al equipo principal.',
  racing_bulls:
    'Equipo hermano y "cantera" de pilotos de Red Bull, con base en Faenza, Italia. Compitió antes como Toro Rosso y AlphaTauri; por ahí debutaron Vettel, Ricciardo y Verstappen antes de subir al equipo principal.',
  sauber:
    'Equipo suizo fundado por Peter Sauber en 1993, con base en Hinwil. Fue fábrica de BMW entre 2006 y 2009, y desde 2026 pasa a manos de Audi.',
  audi:
    'El fabricante alemán ingresa a la Fórmula 1 en 2026 sobre la estructura suiza de Hinwil (ex Sauber), con la ambición de convertirse en el segundo gran constructor alemán de la categoría, junto a Mercedes.',
  cadillac:
    'Marca de General Motors que debuta en la Fórmula 1 en 2026 como el undécimo equipo de la parrilla — la primera incorporación completamente nueva desde Haas en 2016.',
};
