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
  ferrari: 'La escudería más tradicional de la Fórmula 1, con base en Maranello, Italia.',
  mclaren: 'Histórico equipo británico con base en Woking, Inglaterra.',
  mercedes: 'Equipo oficial de Mercedes-Benz, con base en Brackley, Inglaterra.',
  red_bull: 'Escudería de Red Bull, con base en Milton Keynes, Inglaterra.',
  williams: 'Histórico equipo británico fundado por Frank Williams, con base en Grove.',
  aston_martin: 'Equipo británico con base en Silverstone, Inglaterra.',
  alpine: 'Escudería francesa del grupo Renault, con base en Enstone, Inglaterra.',
  haas: 'El único equipo de base estadounidense de la parrilla.',
  rb: 'Equipo hermano de Red Bull, con base en Faenza, Italia.',
  racing_bulls: 'Equipo hermano de Red Bull, con base en Faenza, Italia.',
  sauber: 'Tradicional equipo suizo con base en Hinwil.',
  audi: 'Audi ingresa a la Fórmula 1 en 2026 sobre la estructura del equipo suizo de Hinwil.',
  cadillac: 'Nuevo equipo de base estadounidense que debuta en la Fórmula 1 en 2026.',
};
