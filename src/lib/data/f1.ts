import { HISTORIAL_EQUIPOS } from '../../data/equipos-f1';
import { F1_API_BASE } from '../config';
import { hoyArg, utcToArg } from '../time';
import type {
  ConstructorStanding,
  DriverStanding,
  EstadoCarrera,
  F1DriverInfo,
  F1Team,
  LastRace,
  NextRace,
  RaceCalendar,
  RaceFull,
  RaceResultRow,
  ResultadoEstado,
} from '../types';

/**
 * Adaptador de Jolpica-F1 (formato Ergast) → tipos normalizados.
 *
 * Las respuestas vienen muy anidadas. Forma cruda (simplificada):
 * {
 *   "MRData": {
 *     "RaceTable": {
 *       "Races": [{
 *         "raceName": "Spanish Grand Prix",
 *         "Circuit": { "circuitName": "...", "Location": { "country": "Spain" } },
 *         "date": "2026-06-22", "time": "13:00:00Z",       // en UTC → convertimos a UTC-3
 *         "Results": [{
 *           "position": "1",
 *           "Driver": { "givenName": "Max", "familyName": "Verstappen" },
 *           "Constructor": { "name": "Red Bull" },
 *           "Time": { "time": "1:33:24.567" },              // solo líder y misma vuelta
 *           "status": "Finished"                             // o "+1 Lap", "Engine"...
 *         }]
 *       }]
 *     },
 *     "StandingsTable": { "StandingsLists": [{ "DriverStandings": [...] }] }
 *   }
 * }
 */

interface ErgastDriver {
  givenName?: string;
  familyName?: string;
  code?: string;
  permanentNumber?: string;
  dateOfBirth?: string;
  nationality?: string;
}

interface ErgastConstructor {
  constructorId?: string;
  name?: string;
  nationality?: string;
  url?: string;
}

interface ErgastRace {
  round?: string;
  raceName?: string;
  date?: string;
  time?: string;
  Sprint?: unknown;
  Circuit?: { circuitName?: string; Location?: { country?: string; locality?: string } };
  Results?: Array<{
    position?: string;
    positionText?: string;
    points?: string;
    grid?: string;
    laps?: string;
    status?: string;
    Driver?: ErgastDriver;
    Constructor?: ErgastConstructor;
    Time?: { time?: string };
    FastestLap?: { rank?: string; Time?: { time?: string } };
  }>;
  QualifyingResults?: Array<{
    Driver?: ErgastDriver;
    Constructor?: ErgastConstructor;
    Q1?: string;
    Q2?: string;
    Q3?: string;
  }>;
}

interface ErgastResponse {
  MRData?: {
    RaceTable?: { Races?: ErgastRace[] };
    StandingsTable?: {
      StandingsLists?: Array<{
        DriverStandings?: Array<{
          position?: string;
          points?: string;
          Driver?: ErgastDriver;
          Constructors?: ErgastConstructor[];
        }>;
        ConstructorStandings?: Array<{
          position?: string;
          points?: string;
          Constructor?: ErgastConstructor;
        }>;
      }>;
    };
  };
}

/** País del circuito → código ISO-2 para la bandera. */
const PAIS_GP: Record<string, string> = {
  Australia: 'au', Austria: 'at', Azerbaijan: 'az', Bahrain: 'bh', Belgium: 'be',
  Brazil: 'br', Canada: 'ca', China: 'cn', France: 'fr', Germany: 'de',
  Hungary: 'hu', Italy: 'it', Japan: 'jp', Mexico: 'mx', Monaco: 'mc',
  Netherlands: 'nl', Portugal: 'pt', Qatar: 'qa', 'Saudi Arabia': 'sa',
  Singapore: 'sg', Spain: 'es', UAE: 'ae', 'United Arab Emirates': 'ae',
  UK: 'gb', 'United Kingdom': 'gb', USA: 'us', 'United States': 'us',
};

/** Nombre del GP en español. Si no está en el mapa, se adapta el nombre en inglés. */
const NOMBRE_GP: Record<string, string> = {
  'Australian Grand Prix': 'GP de Australia',
  'Austrian Grand Prix': 'GP de Austria',
  'Azerbaijan Grand Prix': 'GP de Azerbaiyán',
  'Bahrain Grand Prix': 'GP de Bahréin',
  'Barcelona Grand Prix': 'GP de Barcelona',
  'Belgian Grand Prix': 'GP de Bélgica',
  'British Grand Prix': 'GP de Gran Bretaña',
  'Canadian Grand Prix': 'GP de Canadá',
  'Chinese Grand Prix': 'GP de China',
  'Dutch Grand Prix': 'GP de Países Bajos',
  'Emilia Romagna Grand Prix': 'GP de Emilia-Romaña',
  'Hungarian Grand Prix': 'GP de Hungría',
  'Italian Grand Prix': 'GP de Italia',
  'Japanese Grand Prix': 'GP de Japón',
  'Las Vegas Grand Prix': 'GP de Las Vegas',
  'Madrid Grand Prix': 'GP de Madrid',
  'Mexico City Grand Prix': 'GP de México',
  'Mexican Grand Prix': 'GP de México',
  'Miami Grand Prix': 'GP de Miami',
  'Monaco Grand Prix': 'GP de Mónaco',
  'Qatar Grand Prix': 'GP de Qatar',
  'Saudi Arabian Grand Prix': 'GP de Arabia Saudita',
  'Singapore Grand Prix': 'GP de Singapur',
  'Spanish Grand Prix': 'GP de España',
  'United States Grand Prix': 'GP de Estados Unidos',
  'Abu Dhabi Grand Prix': 'GP de Abu Dabi',
  'São Paulo Grand Prix': 'GP de San Pablo',
  'Brazilian Grand Prix': 'GP de Brasil',
};

function nombreGp(raceName: string | undefined): string {
  if (!raceName) return 'Gran Premio';
  return NOMBRE_GP[raceName] ?? raceName.replace('Grand Prix', 'GP');
}

function codigoGp(race: ErgastRace): string {
  const country = race.Circuit?.Location?.country ?? '';
  // Las Vegas y Miami reportan "USA"/"United States", ya cubiertos por el mapa
  return PAIS_GP[country] ?? '';
}

async function fetchJolpica(path: string): Promise<ErgastResponse> {
  const res = await fetch(`${F1_API_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`Jolpica-F1 respondió ${res.status} en ${path}`);
  }
  return (await res.json()) as ErgastResponse;
}

/** Nacionalidad (demónimo en inglés, como la da la API) → código ISO-2 para bandera. */
const NACIONALIDAD: Record<string, string> = {
  Argentine: 'ar', Australian: 'au', Austrian: 'at', Belgian: 'be', Brazilian: 'br',
  British: 'gb', Canadian: 'ca', Chinese: 'cn', Danish: 'dk', Dutch: 'nl',
  Finnish: 'fi', French: 'fr', German: 'de', Italian: 'it', Japanese: 'jp',
  Mexican: 'mx', Monegasque: 'mc', 'New Zealander': 'nz', Polish: 'pl', Russian: 'ru',
  Spanish: 'es', Swedish: 'se', Swiss: 'ch', Thai: 'th', American: 'us',
  Emirati: 'ae', Estonian: 'ee',
};

function codigoNacionalidad(nac: string | undefined): string {
  return nac ? NACIONALIDAD[nac] ?? '' : '';
}

/** Edad en años a partir de "YYYY-MM-DD". */
function edadDesde(fechaNac: string | undefined): number | null {
  if (!fechaNac) return null;
  const d = new Date(fechaNac);
  if (isNaN(d.getTime())) return null;
  const [ay, am, ad] = hoyArg().split('-').map(Number);
  let edad = ay - d.getUTCFullYear();
  const m = am - 1 - d.getUTCMonth();
  if (m < 0 || (m === 0 && ad < d.getUTCDate())) edad--;
  return edad >= 0 && edad < 120 ? edad : null;
}

function nombrePiloto(d: { givenName?: string; familyName?: string } | undefined): string {
  return `${d?.givenName ?? ''} ${d?.familyName ?? ''}`.trim() || 'Piloto';
}

/** "+1 Lap" → "+1 vuelta", "+2 Laps" → "+2 vueltas". */
function traducirStatus(status: string | undefined): string {
  if (!status) return '—';
  const lap = status.match(/^\+(\d+) Lap/);
  if (lap) return `+${lap[1]} ${lap[1] === '1' ? 'vuelta' : 'vueltas'}`;
  if (status === 'Finished') return 'Finalizó';
  if (/disqualified/i.test(status)) return 'Descalificado';
  if (/did not start|withdrew/i.test(status)) return 'No largó';
  return 'Abandono'; // Accident, Engine, Collision, Gearbox, etc.
}

/** Deriva el estado del resultado a partir de positionText y status. */
function estadoResultado(positionText: string | undefined, status: string | undefined): ResultadoEstado {
  if (status === 'Finished' || /^\+\d+ Lap/.test(status ?? '')) return 'ok';
  if (positionText === 'D' || /disqualified/i.test(status ?? '')) return 'dsq';
  if (positionText === 'W' || /did not start|withdrew/i.test(status ?? '')) return 'dns';
  if (positionText === 'N' || positionText === 'F' || /not classified/i.test(status ?? '')) return 'nc';
  return 'dnf';
}

const TEXTO_ESTADO: Record<ResultadoEstado, string> = {
  ok: '', dnf: 'DNF', dns: 'DNS', dsq: 'DSQ', nc: 'NC',
};

/** Calendario completo de la temporada. */
export async function getF1CalendarApi(): Promise<RaceCalendar[]> {
  const data = await fetchJolpica('/current.json');
  const races = data.MRData?.RaceTable?.Races ?? [];
  const hoy = hoyArg();
  return races.map((r) => {
    const { fecha, hora } = utcToArg(`${r.date}T${r.time ?? '12:00:00Z'}`);
    const estado: EstadoCarrera =
      fecha < hoy ? 'finalizada' : fecha === hoy ? 'en_curso' : 'proxima';
    return {
      ronda: Number(r.round ?? 0),
      gp: nombreGp(r.raceName),
      code: codigoGp(r),
      circuito: r.Circuit?.circuitName ?? '',
      ciudad: r.Circuit?.Location?.locality ?? '',
      fecha,
      hora,
      estado,
      esSprint: !!r.Sprint,
    };
  });
}

/** Detalle de una carrera por ronda (resultados + pole + vuelta rápida). */
export async function getF1RaceApi(ronda: number): Promise<RaceFull | null> {
  const [resData, qData] = await Promise.all([
    fetchJolpica(`/current/${ronda}/results.json`),
    fetchJolpica(`/current/${ronda}/qualifying.json`).catch(() => ({}) as ErgastResponse),
  ]);
  const race = resData.MRData?.RaceTable?.Races?.[0];
  if (!race) return null;

  const resultados: RaceResultRow[] = (race.Results ?? []).map((r, i) => {
    const estado = estadoResultado(r.positionText, r.status);
    const clasificado = estado === 'ok';
    return {
      pos: clasificado ? Number(r.position ?? i + 1) : null,
      posTexto: clasificado ? String(r.position ?? i + 1) : TEXTO_ESTADO[estado],
      piloto: nombrePiloto(r.Driver),
      code: r.Driver?.code ?? '',
      equipo: r.Constructor?.name ?? '',
      grilla: r.grid != null ? Number(r.grid) : null,
      vueltas: r.laps != null ? Number(r.laps) : null,
      tiempo: r.Time?.time ?? traducirStatus(r.status),
      estado,
      puntos: Number(r.points ?? 0),
    };
  });

  // Pole = P1 de la clasificación
  const polePos = qData.MRData?.RaceTable?.Races?.[0]?.QualifyingResults?.[0];
  const pole = polePos
    ? {
        piloto: nombrePiloto(polePos.Driver),
        equipo: polePos.Constructor?.name ?? '',
        tiempo: polePos.Q3 || polePos.Q2 || polePos.Q1 || '',
      }
    : null;

  // Vuelta rápida = la marcada con rank "1"
  const flRow = (race.Results ?? []).find((r) => r.FastestLap?.rank === '1');
  const vueltaRapida = flRow
    ? { piloto: nombrePiloto(flRow.Driver), tiempo: flRow.FastestLap?.Time?.time ?? '' }
    : null;

  const { fecha } = utcToArg(`${race.date}T${race.time ?? '12:00:00Z'}`);
  return {
    ronda,
    gp: nombreGp(race.raceName),
    code: codigoGp(race),
    circuito: race.Circuit?.circuitName ?? '',
    ciudad: race.Circuit?.Location?.locality ?? '',
    fecha,
    pole,
    vueltaRapida,
    resultados,
  };
}

/** Equipos con su detalle: pilotos, nacionalidad, puntos, reseña. */
export async function getF1TeamsApi(): Promise<F1Team[]> {
  const [consData, drvData] = await Promise.all([
    fetchJolpica('/current/constructorStandings.json'),
    fetchJolpica('/current/driverStandings.json'),
  ]);

  // Pilotos agrupados por equipo (constructorId)
  const pilotosPorEquipo = new Map<string, F1DriverInfo[]>();
  for (const d of drvData.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? []) {
    const cid = d.Constructors?.[0]?.constructorId ?? '';
    if (!cid) continue;
    const info: F1DriverInfo = {
      nombre: nombrePiloto(d.Driver),
      code: d.Driver?.code ?? '',
      numero: d.Driver?.permanentNumber ?? '',
      nacionalidadCode: codigoNacionalidad(d.Driver?.nationality),
      nacionalidad: d.Driver?.nationality ?? '',
      edad: edadDesde(d.Driver?.dateOfBirth),
      puntos: Number(d.points ?? 0),
    };
    if (!pilotosPorEquipo.has(cid)) pilotosPorEquipo.set(cid, []);
    pilotosPorEquipo.get(cid)!.push(info);
  }

  const lista = consData.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? [];
  return lista.map((c, i) => {
    const cid = c.Constructor?.constructorId ?? '';
    return {
      id: cid,
      nombre: c.Constructor?.name ?? 'Equipo',
      nacionalidadCode: codigoNacionalidad(c.Constructor?.nationality),
      nacionalidad: c.Constructor?.nationality ?? '',
      pos: Number(c.position ?? i + 1),
      puntos: Number(c.points ?? 0),
      wikipedia: c.Constructor?.url ?? '',
      pilotos: pilotosPorEquipo.get(cid) ?? [],
      historial: HISTORIAL_EQUIPOS[cid] ?? '',
    };
  });
}

export async function getF1LastApi(): Promise<LastRace | null> {
  const data = await fetchJolpica('/current/last/results.json');
  const race = data.MRData?.RaceTable?.Races?.[0];
  if (!race) return null;
  return {
    gp: nombreGp(race.raceName),
    code: codigoGp(race),
    circuito: race.Circuit?.circuitName ?? '',
    resultados: (race.Results ?? []).map((r, i) => ({
      pos: Number(r.position ?? i + 1),
      piloto: `${r.Driver?.givenName ?? ''} ${r.Driver?.familyName ?? ''}`.trim() || 'Piloto',
      equipo: r.Constructor?.name ?? '',
      // El tiempo solo existe para el líder y autos en la misma vuelta;
      // para el resto usamos el status ("+1 Lap", "Engine", "Accident"...)
      tiempo: r.Time?.time ?? r.status ?? '—',
    })),
  };
}

export async function getF1NextApi(): Promise<NextRace | null> {
  const data = await fetchJolpica('/current/next.json');
  const race = data.MRData?.RaceTable?.Races?.[0];
  if (!race) return null;
  // date + time vienen separados y en UTC: "2026-06-22" + "13:00:00Z"
  const { fecha, hora } = utcToArg(`${race.date}T${race.time ?? '12:00:00Z'}`);
  return {
    gp: nombreGp(race.raceName),
    code: codigoGp(race),
    circuito: race.Circuit?.circuitName ?? '',
    fecha,
    hora,
  };
}

export async function getF1DriversApi(): Promise<DriverStanding[]> {
  const data = await fetchJolpica('/current/driverStandings.json');
  const lista = data.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
  return lista.map((d, i) => ({
    pos: Number(d.position ?? i + 1),
    nombre: `${(d.Driver?.givenName ?? '').charAt(0)}. ${d.Driver?.familyName ?? 'Piloto'}`,
    pts: Number(d.points ?? 0),
    equipo: d.Constructors?.[0]?.name ?? '',
  }));
}

export async function getF1ConstructorsApi(): Promise<ConstructorStanding[]> {
  const data = await fetchJolpica('/current/constructorStandings.json');
  const lista = data.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? [];
  return lista.map((c, i) => ({
    pos: Number(c.position ?? i + 1),
    nombre: c.Constructor?.name ?? 'Equipo',
    pts: Number(c.points ?? 0),
  }));
}
