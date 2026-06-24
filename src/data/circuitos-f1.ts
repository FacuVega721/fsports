import type { CircuitoHistoria } from '../lib/types';

/**
 * Datos históricos de los circuitos de F1 — EDITABLE A MANO.
 *
 * La API (Jolpica) no provee esta información: el endpoint de circuitos solo
 * devuelve circuitId/nombre/ubicación y un link a Wikipedia, nada de longitud,
 * vueltas, récord de vuelta, trazado ni curiosidades. Acá cargamos esos datos
 * manualmente.
 *
 * La clave es el "circuitId" de la API (ej: "monaco", "spa", "interlagos").
 * Si un circuito no está acá, no se muestra la sub-sección de Historia.
 * Los récords de vuelta pueden quedar desactualizados con el tiempo si se
 * bate uno nuevo — son fáciles de actualizar acá.
 */
export const HISTORIA_CIRCUITOS: Record<string, CircuitoHistoria> = {
  albert_park: {
    longitudKm: 5.278,
    vueltas: 58,
    distanciaKm: 306.124,
    inaugurado: 1996,
    recordVuelta: { piloto: 'Max Verstappen', tiempo: '1:19.813', anio: 2024 },
    datos: [
      'Trazado semi-urbano alrededor del lago Albert Park, en pleno centro de Melbourne.',
      'Fue durante muchos años la apertura tradicional de la temporada, hasta que ese rol pasó a Baréin en 2022.',
      'Se remodeló en 2021, eliminando varias chicanas para hacerlo más rápido y favorecer los adelantamientos.',
      'Australia tuvo su primer GP de F1 en Adelaide (1985-1995) antes de mudarse a Melbourne en 1996.',
    ],
  },
  shanghai: {
    longitudKm: 5.451,
    vueltas: 56,
    distanciaKm: 305.066,
    inaugurado: 2004,
    recordVuelta: { piloto: 'Michael Schumacher', tiempo: '1:32.238', anio: 2004 },
    datos: [
      'Su curva 1-2-3, con forma de caracol, está inspirada en el carácter chino "上" (shàng).',
      'Se construyó sobre un terreno pantanoso que requirió miles de pilotes de cimentación.',
      'Tiene una de las rectas más largas del calendario, ideal para adelantar antes de la curva 14.',
      'Volvió al calendario en 2024 tras cinco años de ausencia por la pandemia.',
    ],
  },
  suzuka: {
    longitudKm: 5.807,
    vueltas: 53,
    distanciaKm: 307.471,
    inaugurado: 1987,
    recordVuelta: { piloto: 'Lewis Hamilton', tiempo: '1:30.983', anio: 2019 },
    datos: [
      'Único trazado en forma de "8" del calendario, con un cruce de pista elevado en la recta principal.',
      'Lo diseñó el ingeniero holandés John Hugenholtz, el mismo que diseñó Zandvoort.',
      'Su secuencia de curvas "Esses" y la 130R son de las de mayor velocidad y respeto de toda la F1.',
      'Fue escenario de varias definiciones históricas de título, como los duelos Senna-Prost de 1989 y 1990.',
    ],
  },
  miami: {
    longitudKm: 5.412,
    vueltas: 57,
    distanciaKm: 308.326,
    inaugurado: 2022,
    recordVuelta: { piloto: 'Max Verstappen', tiempo: '1:29.708', anio: 2023 },
    datos: [
      'Construido en el estacionamiento del Hard Rock Stadium, sede de los Miami Dolphins.',
      'Combina tramos de calle con curvas de alta velocidad alrededor del estadio.',
      'Incluye una marina artificial decorativa con yates, ya que el circuito no está cerca del mar real.',
      'Debutó en 2022 y rápidamente se convirtió en uno de los GP con más audiencia de la temporada.',
    ],
  },
  villeneuve: {
    longitudKm: 4.361,
    vueltas: 70,
    distanciaKm: 305.270,
    inaugurado: 1978,
    recordVuelta: { piloto: 'Valtteri Bottas', tiempo: '1:13.078', anio: 2019 },
    datos: [
      'Lleva el nombre de Gilles Villeneuve; su último sector se conoce como "El Muro de los Campeones".',
      'Se ubica en la Isla Notre-Dame, construida artificialmente para la Expo 67 de Montreal.',
      'Es de los circuitos más exigentes para los frenos, por sus rectas largas y chicanas cerradas.',
      'Antes de llevar su nombre actual, el circuito se conocía simplemente como Île Notre-Dame.',
    ],
  },
  monaco: {
    longitudKm: 3.337,
    vueltas: 78,
    distanciaKm: 260.286,
    inaugurado: 1929,
    recordVuelta: { piloto: 'Lewis Hamilton', tiempo: '1:12.909', anio: 2021 },
    datos: [
      'El trazado más antiguo y emblemático de la F1: corre por las calles del Principado desde 1929.',
      'Es uno de los pocos Grandes Premios que conserva casi intacto su trazado original de los años 50.',
      'El túnel antes de la curva de la piscina es el único tramo cubierto de todo el calendario.',
      'Ganar en Mónaco, junto con las 500 Millas de Indianápolis y las 24 Horas de Le Mans, forma la "Triple Corona" del automovilismo.',
    ],
  },
  catalunya: {
    longitudKm: 4.657,
    vueltas: 66,
    distanciaKm: 307.236,
    inaugurado: 1991,
    recordVuelta: { piloto: 'Max Verstappen', tiempo: '1:16.330', anio: 2023 },
    datos: [
      'Sede habitual de los test de pretemporada; su curva 3, de alta velocidad, es referencia para medir los autos.',
      'En 2023 se eliminó la chicana final para favorecer los adelantamientos en la última curva.',
      'Casi todos los equipos prueban ahí antes de empezar la temporada, generando datos muy comparables entre sí.',
      'Es el Gran Premio de España desde 1991, tras años alternando con Jerez en la década anterior.',
    ],
  },
  red_bull_ring: {
    longitudKm: 4.318,
    vueltas: 71,
    distanciaKm: 306.452,
    inaugurado: 1970,
    recordVuelta: { piloto: 'Carlos Sainz', tiempo: '1:05.619', anio: 2020 },
    datos: [
      'Enclavado en los Alpes austríacos, es uno de los trazados más cortos y rápidos del calendario.',
      'Se llamó Österreichring (1969-1987) y luego A1-Ring (1996-2003) antes de tomar su nombre actual en 2014.',
      'Tiene fuertes desniveles: más de 65 metros de diferencia entre su punto más alto y el más bajo.',
      'Red Bull, dueño del circuito, es también el dueño de uno de los equipos que corre ahí como local.',
    ],
  },
  silverstone: {
    longitudKm: 5.891,
    vueltas: 52,
    distanciaKm: 306.198,
    inaugurado: 1950,
    recordVuelta: { piloto: 'Max Verstappen', tiempo: '1:27.097', anio: 2020 },
    datos: [
      'Construido sobre una base aérea de la Segunda Guerra Mundial; fue sede de la primera carrera del campeonato de F1, en 1950.',
      'Conserva nombres de pistas de aterrizaje en algunas de sus curvas, como la recta Hangar Straight.',
      'La secuencia Maggotts-Becketts-Chapel es considerada una de las más desafiantes de toda la F1.',
      'Es el hogar histórico de la mayoría de los equipos de F1, con varias fábricas a pocos kilómetros de distancia.',
    ],
  },
  spa: {
    longitudKm: 7.004,
    vueltas: 44,
    distanciaKm: 308.052,
    inaugurado: 1950,
    recordVuelta: { piloto: 'Valtteri Bottas', tiempo: '1:46.286', anio: 2018 },
    datos: [
      'Uno de los circuitos más exigentes del mundo, por su longitud, desniveles y el mítico sector de Eau Rouge.',
      'El clima en las Ardenas belgas es tan cambiante que puede estar lloviendo en un sector y seco en otro.',
      'Su versión original, usada hasta los años 70, medía más de 14 km y era considerada extremadamente peligrosa.',
      'La secuencia Eau Rouge-Raidillon se toma hoy a fondo, algo impensado para los autos de hace pocas décadas.',
    ],
  },
  hungaroring: {
    longitudKm: 4.381,
    vueltas: 70,
    distanciaKm: 306.630,
    inaugurado: 1986,
    recordVuelta: { piloto: 'Lewis Hamilton', tiempo: '1:16.627', anio: 2020 },
    datos: [
      'Fue el primer Gran Premio detrás de la Cortina de Hierro, debutando en el calendario en 1986.',
      'Es un circuito estrecho y con pocas zonas de adelantamiento, apodado a veces "Mónaco sin paredes".',
      'El calor y el polvo de agosto son un desafío extra para motores y neumáticos.',
      'Pilotos como Mika Häkkinen y Fernando Alonso lograron ahí victorias muy recordadas de sus carreras.',
    ],
  },
  zandvoort: {
    longitudKm: 4.259,
    vueltas: 72,
    distanciaKm: 306.587,
    inaugurado: 1952,
    recordVuelta: { piloto: 'Lewis Hamilton', tiempo: '1:11.097', anio: 2021 },
    datos: [
      'Circuito de dunas junto al Mar del Norte, con peraltes pronunciados en varias curvas.',
      'Sus curvas finales peraltadas generan algunas de las fuerzas G más altas del calendario.',
      'El trazado original data de 1948 y se diseñó aprovechando las dunas naturales de la zona.',
      'Volvió al calendario en 2021 tras 36 años de ausencia, en pleno auge de Max Verstappen como local.',
    ],
  },
  monza: {
    longitudKm: 5.793,
    vueltas: 53,
    distanciaKm: 306.720,
    inaugurado: 1950,
    recordVuelta: { piloto: 'Rubens Barrichello', tiempo: '1:21.046', anio: 2004 },
    datos: [
      'Conocido como el "Templo de la Velocidad": tiene las rectas más largas y los promedios más altos del calendario.',
      'Es el circuito más antiguo que sigue en el calendario actual de F1, inaugurado en 1922.',
      'Su velocidad promedio de vuelta supera los 260 km/h, la más alta de toda la temporada.',
      'Los "tifosi" de Ferrari suelen invadir el podio cada vez que un piloto de la Scuderia gana ahí.',
    ],
  },
  madring: {
    longitudKm: 5.474,
    vueltas: 56,
    distanciaKm: 306.5,
    inaugurado: 2026,
    datos: [
      'Circuito híbrido (calle + trazado permanente) en el recinto ferial IFEMA de Madrid.',
      'Debuta en el calendario de F1 en 2026, por lo que todavía no tiene récord de vuelta ni historia disputada.',
      'El proyecto se presentó en 2024 con un contrato de 10 años entre Madrid y Liberty Media.',
      'Combina tramos alrededor del recinto ferial con un trazado permanente adyacente.',
    ],
  },
  baku: {
    longitudKm: 6.003,
    vueltas: 51,
    distanciaKm: 306.049,
    inaugurado: 2016,
    recordVuelta: { piloto: 'Charles Leclerc', tiempo: '1:43.009', anio: 2019 },
    datos: [
      'Combina un sector de altísima velocidad con un tramo estrechísimo entre los muros de la ciudad vieja de Bakú.',
      'Su recta principal es de las más largas del calendario, con velocidades punta cercanas a los 350 km/h.',
      'El tramo junto a la Ciudad Vieja deja apenas centímetros de margen a cada lado de los autos.',
      'Debutó en 2016 como "Gran Premio de Europa" antes de tomar su nombre actual.',
    ],
  },
  marina_bay: {
    longitudKm: 4.940,
    vueltas: 62,
    distanciaKm: 306.143,
    inaugurado: 2008,
    recordVuelta: { piloto: 'Charles Leclerc', tiempo: '1:41.905', anio: 2023 },
    datos: [
      'Fue el primer Gran Premio nocturno de la historia de la F1, corrido íntegramente sobre las calles de Singapur.',
      'Su sistema de iluminación iguala la luz diurna para no afectar la visión de los pilotos.',
      'El calor y la humedad tropical la convierten en una de las carreras más exigentes físicamente del calendario.',
      'En 2023 se eliminó una chicana, acortando la vuelta y aumentando la velocidad media del trazado.',
    ],
  },
  americas: {
    longitudKm: 5.513,
    vueltas: 56,
    distanciaKm: 308.405,
    inaugurado: 2012,
    recordVuelta: { piloto: 'Charles Leclerc', tiempo: '1:36.169', anio: 2019 },
    datos: [
      'Diseñado específicamente para la F1; su curva 1, en subida, está inspirada en Silverstone.',
      'Esa misma curva 1, con un desnivel pronunciado, ofrece una de las mejores vistas del calendario para el público.',
      'Su fin de semana suele acompañarse de un festival de música, generando una gran asistencia de público.',
      'Debutó en 2012 tras varios años sin un Gran Premio de Estados Unidos estable en el calendario.',
    ],
  },
  rodriguez: {
    longitudKm: 4.304,
    vueltas: 71,
    distanciaKm: 305.354,
    inaugurado: 1963,
    recordVuelta: { piloto: 'Valtteri Bottas', tiempo: '1:17.774', anio: 2021 },
    datos: [
      'Su último sector pasa por dentro del estadio "Foro Sol", una de las imágenes más icónicas del calendario.',
      'Lleva el nombre de los hermanos Ricardo y Pedro Rodríguez, pilotos mexicanos fallecidos en competencia.',
      'Por su altitud, superior a los 2200 metros, los autos sufren una notable pérdida de carga aerodinámica.',
      'El ambiente de los hinchas mexicanos es considerado uno de los más festivos de toda la temporada.',
    ],
  },
  interlagos: {
    longitudKm: 4.309,
    vueltas: 71,
    distanciaKm: 305.879,
    inaugurado: 1973,
    recordVuelta: { piloto: 'Valtteri Bottas', tiempo: '1:10.540', anio: 2018 },
    datos: [
      'Uno de los pocos trazados que se corre en sentido antihorario; célebre por sus remontadas y carreras con lluvia.',
      'Su nombre significa "entre lagos", por los dos lagos artificiales que rodean el circuito original.',
      'Ahí Ayrton Senna logró su primera victoria como local, en el Gran Premio de Brasil de 1991.',
      'Tiene más de 40 metros de desnivel entre su punto más alto y el más bajo, algo poco común en un trazado tan corto.',
    ],
  },
  vegas: {
    longitudKm: 6.201,
    vueltas: 50,
    distanciaKm: 309.958,
    inaugurado: 2023,
    recordVuelta: { piloto: 'Oscar Piastri', tiempo: '1:35.490', anio: 2023 },
    datos: [
      'Carrera nocturna sobre el famoso Strip de Las Vegas, con el Bellagio y la esfera Sphere de telón de fondo.',
      'Debutó en 2023 con una inversión multimillonaria de Liberty Media en infraestructura permanente.',
      'Por el frío nocturno del desierto, el asfalto y los neumáticos se comportan distinto al resto del calendario.',
      'La parrilla de largada se ubica frente al hotel Caesars Palace, en plena avenida.',
    ],
  },
  losail: {
    longitudKm: 5.380,
    vueltas: 57,
    distanciaKm: 308.611,
    inaugurado: 2021,
    recordVuelta: { piloto: 'Max Verstappen', tiempo: '1:24.319', anio: 2023 },
    datos: [
      'Diseñado originalmente para MotoGP; se incorporó al calendario de F1 en 2021 y se corre de noche.',
      'Recibió una gran remodelación de boxes y pit lane antes de su debut en la categoría.',
      'Por el calor extremo, las carreras suelen programarse de noche y con restricciones físicas para los pilotos.',
      'Fue el primer Gran Premio de Catar de la historia de la Fórmula 1.',
    ],
  },
  yas_marina: {
    longitudKm: 5.281,
    vueltas: 58,
    distanciaKm: 306.183,
    inaugurado: 2009,
    recordVuelta: { piloto: 'Max Verstappen', tiempo: '1:26.103', anio: 2021 },
    datos: [
      'Cierra la temporada al atardecer, con un tramo final que pasa bajo techo en el hotel Yas Viceroy.',
      'Ahí ocurrió el cierre de campeonato más dramático de la era moderna, entre Hamilton y Verstappen en 2021.',
      'Se redujo y modificó ese mismo año para favorecer los adelantamientos, eliminando varias curvas lentas.',
      'Es uno de los pocos trazados del calendario que combina luz diurna y nocturna en la misma carrera.',
    ],
  },
};
