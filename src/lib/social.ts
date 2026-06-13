/**
 * Generador de posteos para redes (X) a partir de los datos de partidos.
 * Arma el texto en el formato de FSports, listo para copiar y pegar.
 * (La imagen se obtiene con una captura de las tarjetas de la web.)
 */
import { formatFecha } from './time';
import type { LastRace, Match, NextRace } from './types';

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

function quitarAcentos(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/** "México" → "#Mexico", "Corea del Sur" → "#Corea" */
export function hashtagEquipo(nombre: string): string {
  const base = HASHTAG_EQUIPO[nombre] ?? quitarAcentos(nombre).replace(/[^A-Za-z0-9]/g, '');
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
  const fl = flagEmoji(m.localCode);
  const fv = flagEmoji(m.visitanteCode);
  return `${horaPunto(m.hora)} | ${hashtagEquipo(m.local)} ${fl} 🆚 ${hashtagEquipo(m.visitante)} ${fv}`
    .replace(/\s+/g, ' ')
    .trim();
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
