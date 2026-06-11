import { SEDES, infoPartido } from '../../data/sedes';
import { FOOTBALL_API_BASE } from '../config';
import { nombreEspanol } from '../paises';
import { utcToArg } from '../time';
import type {
  EstadoPartido,
  FasePartido,
  Match,
  Player,
  Posicion,
  StandingGroup,
  TeamFull,
} from '../types';

/**
 * Adaptador de football-data.org (v4) → tipos normalizados.
 *
 * Forma cruda de /competitions/WC/matches (simplificada):
 * {
 *   "matches": [{
 *     "id": 12345,
 *     "utcDate": "2026-06-11T16:00:00Z",   // en UTC → convertimos a UTC-3
 *     "status": "FINISHED",                 // SCHEDULED|TIMED|IN_PLAY|PAUSED|LIVE|FINISHED
 *     "group": "GROUP_A",
 *     "venue": "Estadio Azteca",
 *     "homeTeam": { "name": "Mexico", "tla": "MEX" },
 *     "awayTeam": { "name": "South Africa", "tla": "RSA" },
 *     "score": { "fullTime": { "home": 2, "away": 0 } }
 *   }]
 * }
 */

interface FdTeam {
  name?: string;
  tla?: string;
}

interface FdMatch {
  id?: number;
  utcDate?: string;
  status?: string;
  stage?: string;
  group?: string;
  venue?: string;
  minute?: number;
  homeTeam?: FdTeam;
  awayTeam?: FdTeam;
  score?: { fullTime?: { home?: number | null; away?: number | null } };
}

interface FdStandingsTable {
  group?: string;
  type?: string;
  table?: Array<{
    position?: number;
    playedGames?: number;
    points?: number;
    won?: number;
    draw?: number;
    lost?: number;
    goalsFor?: number;
    goalsAgainst?: number;
    goalDifference?: number;
    team?: FdTeam;
  }>;
}

/**
 * Mapa nombre de selección → código ISO-2 para las banderas.
 * football-data.org da TLA de 3 letras (MEX) pero flag-icons usa 2 (mx).
 * Si un equipo no está acá, el componente <Flag /> muestra el código como texto.
 */
const PAIS_CODE: Record<string, string> = {
  Argentina: 'ar', Brazil: 'br', Mexico: 'mx', 'United States': 'us', USA: 'us',
  Canada: 'ca', Uruguay: 'uy', Colombia: 'co', Ecuador: 'ec', Paraguay: 'py',
  Chile: 'cl', Peru: 'pe', Venezuela: 've', Bolivia: 'bo',
  Spain: 'es', France: 'fr', England: 'gb-eng', Germany: 'de', Italy: 'it',
  Portugal: 'pt', Netherlands: 'nl', Belgium: 'be', Croatia: 'hr', Switzerland: 'ch',
  Austria: 'at', Denmark: 'dk', Sweden: 'se', Norway: 'no', Poland: 'pl',
  Scotland: 'gb-sct', Wales: 'gb-wls', Serbia: 'rs', Turkey: 'tr', Ukraine: 'ua',
  'Czech Republic': 'cz', Czechia: 'cz', Slovakia: 'sk', Slovenia: 'si',
  Hungary: 'hu', Romania: 'ro', Greece: 'gr', Albania: 'al', Georgia: 'ge',
  Morocco: 'ma', Senegal: 'sn', Tunisia: 'tn', Algeria: 'dz', Egypt: 'eg',
  Nigeria: 'ng', Ghana: 'gh', Cameroon: 'cm', 'Ivory Coast': 'ci',
  'Côte d’Ivoire': 'ci', 'South Africa': 'za', 'Cape Verde': 'cv',
  Japan: 'jp', 'South Korea': 'kr', 'Korea Republic': 'kr', Australia: 'au',
  'Saudi Arabia': 'sa', Iran: 'ir', Qatar: 'qa', Iraq: 'iq', Jordan: 'jo',
  Uzbekistan: 'uz', 'New Zealand': 'nz', 'Costa Rica': 'cr', Panama: 'pa',
  Honduras: 'hn', Jamaica: 'jm', Haiti: 'ht', Curacao: 'cw', 'Curaçao': 'cw',
  'Bosnia-Herzegovina': 'ba', 'Cape Verde Islands': 'cv', 'Congo DR': 'cd',
  'DR Congo': 'cd',
};

function codigoPais(team: FdTeam | undefined): string {
  if (!team?.name) return '';
  return PAIS_CODE[team.name] ?? (team.tla ? team.tla.slice(0, 2).toLowerCase() : '');
}

function estadoDesdeStatus(status: string | undefined): EstadoPartido {
  switch (status) {
    case 'IN_PLAY':
    case 'LIVE':
      return 'en_vivo';
    case 'PAUSED':
      return 'entretiempo'; // entretiempo / pausa
    case 'FINISHED':
      return 'finalizado';
    default:
      return 'programado'; // SCHEDULED | TIMED | POSTPONED | etc.
  }
}

/** "GROUP_A" o "Group A" → "A" (matches y standings usan formatos distintos) */
function letraGrupo(group: string | undefined): string {
  if (!group) return '';
  return group.replace(/^group[\s_]*/i, '').trim();
}

/** stage de football-data.org → nuestra fase del torneo */
function faseDesdeStage(stage: string | undefined): FasePartido {
  switch (stage) {
    case 'LAST_32':
      return 'dieciseisavos';
    case 'LAST_16':
      return 'octavos';
    case 'QUARTER_FINALS':
      return 'cuartos';
    case 'SEMI_FINALS':
      return 'semifinal';
    case 'THIRD_PLACE':
      return 'tercer_puesto';
    case 'FINAL':
      return 'final';
    default:
      return 'grupos'; // GROUP_STAGE | LEAGUE_STAGE | etc.
  }
}

async function fetchFd<T>(path: string): Promise<T> {
  // El token lo agrega el proxy (dev server de Vite o Worker), no el cliente.
  const res = await fetch(`${FOOTBALL_API_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`football-data.org respondió ${res.status} en ${path}`);
  }
  return (await res.json()) as T;
}

export async function getMatchesApi(): Promise<Match[]> {
  const data = await fetchFd<{ matches?: FdMatch[] }>('/competitions/WC/matches');
  const matches = Array.isArray(data.matches) ? data.matches : [];
  return matches.map((m, i) => {
    const { fecha, hora } = utcToArg(m.utcDate ?? '');
    const local = m.homeTeam?.name ? nombreEspanol(m.homeTeam.name) : 'Por definir';
    const visitante = m.awayTeam?.name ? nombreEspanol(m.awayTeam.name) : 'Por definir';
    // La API no trae sede ni TV; los buscamos en el mapa editable (src/data/sedes.ts).
    const info = infoPartido(local, visitante);
    const sede = info.sede ? SEDES[info.sede] : undefined;
    return {
      id: String(m.id ?? `api-${i}`),
      fecha,
      hora,
      estado: estadoDesdeStatus(m.status),
      local,
      localCode: codigoPais(m.homeTeam),
      golesLocal: m.score?.fullTime?.home ?? null,
      visitante,
      visitanteCode: codigoPais(m.awayTeam),
      golesVisitante: m.score?.fullTime?.away ?? null,
      grupo: letraGrupo(m.group),
      fase: faseDesdeStage(m.stage),
      estadio: m.venue ?? sede?.estadio ?? '',
      ciudad: sede?.ciudad ?? '',
      tv: info.tv ?? [],
      minuto: typeof m.minute === 'number' ? m.minute : null,
    };
  });
}

/** Posición cruda de football-data.org → posición en español. */
function traducirPosicion(pos: string | undefined): Posicion {
  switch (pos) {
    case 'Goalkeeper':
      return 'Arquero';
    case 'Defence':
    case 'Defender':
      return 'Defensor';
    case 'Midfield':
    case 'Midfielder':
      return 'Mediocampista';
    case 'Offence':
    case 'Attacker':
    case 'Forward':
      return 'Delantero';
    default:
      return 'Otro';
  }
}

/** Edad en años a partir de la fecha de nacimiento "YYYY-MM-DD". */
function edadDesde(fechaNac: string | undefined): number | null {
  if (!fechaNac) return null;
  const d = new Date(fechaNac);
  if (isNaN(d.getTime())) return null;
  const hoy = new Date();
  let edad = hoy.getUTCFullYear() - d.getUTCFullYear();
  const m = hoy.getUTCMonth() - d.getUTCMonth();
  if (m < 0 || (m === 0 && hoy.getUTCDate() < d.getUTCDate())) edad--;
  return edad >= 0 && edad < 120 ? edad : null;
}

interface FdTeamFull {
  id?: number;
  name?: string;
  tla?: string;
  coach?: { name?: string };
  squad?: Array<{ name?: string; position?: string; dateOfBirth?: string; nationality?: string }>;
}

export async function getTeamsApi(): Promise<TeamFull[]> {
  // Dos fuentes: /teams trae plantel + DT; /standings da el grupo. Se cruzan por id.
  const [teamsData, standingsData] = await Promise.all([
    fetchFd<{ teams?: FdTeamFull[] }>('/competitions/WC/teams'),
    fetchFd<{ standings?: FdStandingsTable[] }>('/competitions/WC/standings'),
  ]);

  const grupoPorId = new Map<number, string>();
  for (const bloque of standingsData.standings ?? []) {
    if (bloque.type && bloque.type !== 'TOTAL') continue;
    for (const fila of bloque.table ?? []) {
      const id = (fila.team as { id?: number } | undefined)?.id;
      if (typeof id === 'number') grupoPorId.set(id, letraGrupo(bloque.group));
    }
  }

  const teams = Array.isArray(teamsData.teams) ? teamsData.teams : [];
  return teams.map((t) => {
    const squad: Player[] = (Array.isArray(t.squad) ? t.squad : []).map((p) => ({
      nombre: p.name ?? 'Jugador',
      posicion: traducirPosicion(p.position),
      edad: edadDesde(p.dateOfBirth),
      nacionalidad: nombreEspanol(p.nationality),
    }));
    return {
      nombre: nombreEspanol(t.name) || 'Equipo',
      code: codigoPais({ name: t.name, tla: t.tla }),
      grupo: typeof t.id === 'number' ? grupoPorId.get(t.id) ?? '' : '',
      squad,
      dt: t.coach?.name ?? '',
    };
  });
}

export async function getStandingsApi(): Promise<StandingGroup[]> {
  const data = await fetchFd<{ standings?: FdStandingsTable[] }>('/competitions/WC/standings');
  const standings = Array.isArray(data.standings) ? data.standings : [];
  return standings
    .filter((s) => s.type === 'TOTAL' || s.type === undefined)
    .map((s) => ({
      grupo: letraGrupo(s.group),
      equipos: (Array.isArray(s.table) ? s.table : []).map((fila, j) => ({
        pos: fila.position ?? j + 1,
        nombre: nombreEspanol(fila.team?.name) || 'Equipo',
        code: codigoPais(fila.team),
        pj: fila.playedGames ?? 0,
        pts: fila.points ?? 0,
        g: fila.won ?? 0,
        e: fila.draw ?? 0,
        p: fila.lost ?? 0,
        gf: fila.goalsFor ?? 0,
        gc: fila.goalsAgainst ?? 0,
        dif: fila.goalDifference ?? 0,
      })),
    }));
}
