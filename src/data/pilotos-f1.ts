/**
 * Reseñas breves de los pilotos de F1 — EDITABLE A MANO.
 *
 * La API (Jolpica) no provee biografía de los pilotos, solo el dato y un link
 * a Wikipedia. Acá cargamos una reseña corta por piloto.
 *
 * La clave es el "driverId" de la API (ej: "max_verstappen", "alonso",
 * "colapinto"...). Si un piloto no está acá, no se muestra reseña (solo el
 * dato + link a Wikipedia). Editá o agregá libremente.
 */
export const RESENA_PILOTOS: Record<string, string> = {
  hamilton:
    'Heptacampeón del mundo (récord histórico, empatado con Schumacher) y el piloto más ganador en la historia de la Fórmula 1. Tras 12 temporadas en Mercedes, en 2025 se sumó a Ferrari para intentar el título que todavía le falta con la Scuderia.',
  leclerc:
    'Monegasco, campeón de F2 y GP3, debutó en Ferrari en 2019 a los 21 años. Es el favorito de los Tifosi para devolverle a la Scuderia un título que se le escapa hace más de dos décadas.',
  russell:
    'Británico formado en la academia juvenil de Mercedes, debutó en F1 con Williams en 2019 y llegó al equipo oficial alemán en 2022. Heredó el liderazgo del equipo tras la salida de Hamilton a Ferrari.',
  antonelli:
    'Italiano, ascendido directo de la Fórmula 2 al Mercedes oficial tras pasar por la academia juvenil de la marca. Una de las mayores promesas de su generación, llamado a heredar el asiento de Lewis Hamilton.',
  norris:
    'Británico, formado en la cantera de McLaren desde el karting y en la grilla desde 2019. Fue protagonista directo de la pelea por el título en 2024, el primer gran candidato de McLaren en más de una década.',
  piastri:
    'Australiano, triple campeón consecutivo en F3, F2 y Fórmula 2 antes de firmar con McLaren en un culebrón de fichajes que terminó en tribunales. Ganó su primera carrera en F1 en 2024.',
  max_verstappen:
    'Neerlandés: el piloto más joven en debutar (17 años, 2015) y en ganar una carrera en la historia de la Fórmula 1. Cuatro veces campeón del mundo (2021-2024) con Red Bull, redefinió el dominio de una era completa.',
  hadjar:
    'Francés de raíces argelinas, llegó a la Fórmula 1 tras ser campeón de Fórmula 2. Forma parte de la cantera de pilotos jóvenes de Red Bull.',
  gasly:
    'Francés, pasó por Toro Rosso y Red Bull antes de encontrar continuidad en Alpine desde 2023. Ganó su único GP hasta ahora con Red Bull en Monza 2020, en una carrera caótica por la lluvia.',
  colapinto:
    'Argentino, irrumpió en la Fórmula 1 a mitad de 2024 con un llamado de emergencia de Williams que devolvió al país a la conversación de la categoría después de más de tres décadas sin un piloto titular. Es, por lejos, el piloto con más seguimiento de la grilla en Sudamérica.',
  lawson:
    'Neozelandés, pasó por varias escuderías del universo Red Bull (AlphaTauri y RB) antes de consolidarse en la grilla. Reserva habitual del equipo principal en sus primeras temporadas.',
  arvid_lindblad:
    'Británico de ascendencia india y sueca, una de las jóvenes promesas de la cantera de Red Bull, surgido de las categorías de formación tras destacar en F3 y F2.',
  bearman:
    'Británico, parte de la academia juvenil de Ferrari, debutó de urgencia en 2024 reemplazando a un piloto lesionado y sorprendió con un gran resultado. Pasó a Haas para tener un asiento fijo.',
  ocon:
    'Francés, pasó por Manor, Force India, Renault y Alpine antes de firmar con Haas. Ganó su único GP hasta el momento en Hungría 2021, con Alpine.',
  sainz:
    'Español, hijo del bicampeón mundial de rally Carlos Sainz padre. Pasó por Toro Rosso, Renault, McLaren y Ferrari antes de firmar con Williams, tras la llegada de Hamilton a Maranello.',
  albon:
    'Tailandés-británico, debutó con Toro Rosso y Red Bull antes de una etapa de reconstrucción en Williams desde 2022, donde se transformó en la referencia del equipo.',
  bortoleto:
    'Brasileño, campeón de F3 (2023) y F2 (2024) en años consecutivos. Llegó a la Fórmula 1 con el equipo que pasó a llamarse Audi.',
  hulkenberg:
    'Alemán, uno de los pilotos con más carreras disputadas sin ganar nunca un Gran Premio. Veterano de Williams, Force India, Renault y Haas, encontró un nuevo capítulo en el proyecto de Audi.',
  alonso:
    'Español, bicampeón del mundo (2005-2006 con Renault) y uno de los pilotos más longevos y respetados de la parrilla. Llegó a Aston Martin en 2023 buscando un tercer título que el auto todavía no le permitió pelear.',
  stroll:
    'Canadiense, hijo del empresario Lawrence Stroll, dueño de Aston Martin. Debutó en F1 con Williams en 2017 antes de pasar al equipo de su familia.',
  bottas:
    'Finlandés, fue compañero de Hamilton en Mercedes entre 2017 y 2021, sumando varias victorias y poles en ese período dorado del equipo. Pasó por Alfa Romeo/Sauber antes de sumarse al proyecto debutante de Cadillac.',
  perez:
    'Mexicano, conocido como "Checo". Pasó por Sauber, McLaren, Force India/Racing Point antes de ser compañero de Verstappen en Red Bull entre 2021 y 2024. Es el piloto mexicano más ganador en la historia de la categoría.',
};
