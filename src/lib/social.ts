/**
 * Generador de posteos para redes (X) a partir de los datos de partidos.
 * Arma el texto en el formato de FSports, listo para copiar y pegar.
 * (La imagen se obtiene con una captura de las tarjetas de la web.)
 */
import { formatFecha } from './time';
import type { EventoPartido, LastRace, Match, MatchDetail, NextRace } from './types';

/** Hashtags abreviados al estilo FSports para algunos nombres largos. */
const HASHTAG_EQUIPO: Record<string, string> = {
  'Corea del Sur': 'Corea',
  'República Checa': 'Checa',
  'Estados Unidos': 'USA',
  'Países Bajos': 'PaisesBajos',
  'Bosnia y Herzegovina': 'Bosnia',
  'Arabia Saudita': 'ArabiaSaudita',
  'Costa de Marfil': 'CostaMarfil',
  'Nueva Zelanda': 'NuevaZelanda',
  'Cabo Verde': 'CaboVerde',
  'RD del Congo': 'CongoDR',
};

/**
 * Nombres en inglés por código ISO, para hashtags de mayor interacción en X.
 * X suele mostrar la bandera del país automáticamente junto a estos hashtags,
 * por eso NO se agrega el emoji de bandera al lado (quedaría duplicado).
 */
const HASHTAG_PAIS_EN: Record<string, string> = {
  ar: 'Argentina', br: 'Brazil', mx: 'Mexico', us: 'USA', ca: 'Canada',
  uy: 'Uruguay', co: 'Colombia', ec: 'Ecuador', py: 'Paraguay', cl: 'Chile',
  pe: 'Peru', ve: 'Venezuela', bo: 'Bolivia',
  es: 'Spain', fr: 'France', 'gb-eng': 'England', de: 'Germany', it: 'Italy',
  pt: 'Portugal', nl: 'Netherlands', be: 'Belgium', hr: 'Croatia', ch: 'Switzerland',
  at: 'Austria', dk: 'Denmark', se: 'Sweden', no: 'Norway', pl: 'Poland',
  'gb-sct': 'Scotland', 'gb-wls': 'Wales', rs: 'Serbia', tr: 'Turkey', ua: 'Ukraine',
  cz: 'Czechia', sk: 'Slovakia', si: 'Slovenia', hu: 'Hungary', ro: 'Romania',
  gr: 'Greece', al: 'Albania', ge: 'Georgia',
  ma: 'Morocco', sn: 'Senegal', tn: 'Tunisia', dz: 'Algeria', eg: 'Egypt',
  ng: 'Nigeria', gh: 'Ghana', cm: 'Cameroon', ci: 'IvoryCoast', za: 'SouthAfrica',
  cv: 'CapeVerde', cd: 'DRCongo',
  jp: 'Japan', kr: 'SouthKorea', au: 'Australia', sa: 'SaudiArabia', ir: 'Iran',
  qa: 'Qatar', iq: 'Iraq', jo: 'Jordan', uz: 'Uzbekistan',
  nz: 'NewZealand', cr: 'CostaRica', pa: 'Panama', hn: 'Honduras', jm: 'Jamaica',
  ht: 'Haiti', cw: 'Curacao', ba: 'BosniaHerzegovina',
};

function quitarAcentos(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/** "México" → "#Mexico", "Corea del Sur" → "#Corea" */
export function hashtagEquipo(nombre: string): string {
  const base = HASHTAG_EQUIPO[nombre] ?? quitarAcentos(nombre).replace(/[^A-Za-z0-9]/g, '');
  return `#${base}`;
}

/** Hashtag en inglés por código ISO ("ar" → "#Argentina"); cae al nombre en español si no está mapeado. */
export function hashtagPaisEN(code: string, fallbackNombreEs: string): string {
  const en = HASHTAG_PAIS_EN[code.trim().toLowerCase()];
  const base = en ?? quitarAcentos(fallbackNombreEs).replace(/[^A-Za-z0-9]/g, '');
  return `#${base}`;
}

/** Código ISO de 2 letras → emoji de bandera ("mx" → 🇲🇽). Subdivisiones (gb-eng) → "". */
export function flagEmoji(code: string): string {
  const c = code.trim().toLowerCase();
  if (!/^[a-z]{2}$/.test(c)) return '';
  return String.fromCodePoint(...[...c].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 97));
}

/** "16:00" → "16.00" (estilo FSports) */
function horaPunto(hora: string): string {
  return hora.replace(':', '.');
}

function linea(m: Match): string {
  return `${horaPunto(m.hora)} | ${hashtagPaisEN(m.localCode, m.local)} 🆚 ${hashtagPaisEN(m.visitanteCode, m.visitante)}`;
}

/**
 * Posteo de AGENDA: lista de partidos del día.
 * @param hoy  si los partidos son de hoy (cambia el encabezado)
 */
export function postAgenda(matches: Match[], hoy = true): string {
  if (matches.length === 0) return '';
  const titulo = hoy
    ? '📅 Agenda de hoy #FifaWorldCup 2026 🏆'
    : '📅 Agenda #FifaWorldCup 2026 🏆';
  const fase = matches.every((m) => m.fase === 'grupos') ? 'Fase de Grupos:' : 'Eliminatoria:';
  const lineas = [...matches].sort((a, b) => a.hora.localeCompare(b.hora)).map(linea);
  return `${titulo}\n\n${fase}\n${lineas.join('\n')}`;
}

/** Posteo de RESULTADO FINAL de un partido. */
export function postFinal(m: Match): string {
  const marcador = `${hashtagEquipo(m.local)} ${m.golesLocal ?? 0}-${m.golesVisitante ?? 0} ${hashtagEquipo(m.visitante)}`;
  return `⚽ FINAL | #FifaWorldCup 🏆\n\n${marcador}\n\n#Mundial2026 #FifaWorldCup`;
}

/** "Messi", "Messi" → "Messi x2" (agrupa goles del mismo jugador). */
function golesPorEquipo(eventos: EventoPartido[], lado: 'local' | 'visitante'): string {
  const conteo = new Map<string, number>();
  for (const ev of eventos) {
    if (ev.tipo !== 'gol' || ev.equipo !== lado || !ev.jugador) continue;
    conteo.set(ev.jugador, (conteo.get(ev.jugador) ?? 0) + 1);
  }
  return [...conteo.entries()]
    .map(([jugador, n]) => (n > 1 ? `${jugador} x${n}` : jugador))
    .join(', ');
}

/**
 * Posteo de RESULTADO completo (estilo FSports): encabezado + marcador + goleadores
 * autocompletados desde la API, con un espacio para el comentario editorial que
 * se escribe a mano antes de copiar.
 */
export function postResultadoCompleto(m: MatchDetail): string {
  const marcador = `${hashtagPaisEN(m.localCode, m.local)} ${m.golesLocal ?? 0}-${m.golesVisitante ?? 0} ${hashtagPaisEN(m.visitanteCode, m.visitante)}`;

  const golesLocal = golesPorEquipo(m.eventos, 'local');
  const golesVisitante = golesPorEquipo(m.eventos, 'visitante');
  const partes: string[] = [];
  if (golesLocal) partes.push(`${golesLocal}${m.localTla ? ` (${m.localTla})` : ''}`);
  if (golesVisitante) partes.push(`${golesVisitante}${m.visitanteTla ? ` (${m.visitanteTla})` : ''}`);
  const lineaGoleadores = partes.length > 0 ? `⚽️ ${partes.join(', ')}` : '';

  return [
    '⏱️ FINAL | #FifaWorldCup 2026🏆',
    '',
    marcador,
    ...(lineaGoleadores ? [lineaGoleadores] : []),
    '',
    '[Escribí aquí tu comentario]',
    '',
    '#Mundial2026',
  ].join('\n');
}

/** "México" → "#Mexico" para nombres de GP de F1. */
function hashtagGP(gp: string): string {
  return `#${quitarAcentos(gp).replace(/[^A-Za-z0-9]/g, '')}`;
}

/** Posteo de PREVIA de la próxima carrera de F1. */
export function postProximaF1(race: NextRace): string {
  const bandera = flagEmoji(race.code);
  return `🏎️ Próximo GP: ${race.gp} ${bandera} 🏁\n\n📍 ${race.circuito}\n🗓️ ${formatFecha(race.fecha)} - ${race.hora.replace(':', '.')}hs (ARG)\n\n#F1 ${hashtagGP(race.gp)}`;
}

/** Posteo de RESULTADO (podio) de la última carrera de F1. */
export function postResultadoF1(race: LastRace): string {
  const bandera = flagEmoji(race.code);
  const medallas = ['🥇', '🥈', '🥉'];
  const podio = race.resultados
    .slice(0, 3)
    .map((r, i) => `${medallas[i]} ${r.piloto} (${r.equipo})`)
    .join('\n');
  return `🏁 Resultados ${race.gp} ${bandera} 🏎️\n\n${podio}\n\n#F1 ${hashtagGP(race.gp)}`;
}
