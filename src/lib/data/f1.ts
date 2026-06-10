import { F1_API_BASE } from '../config';
import { utcToArg } from '../time';
import type { ConstructorStanding, DriverStanding, LastRace, NextRace } from '../types';

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

interface ErgastRace {
  raceName?: string;
  date?: string;
  time?: string;
  Circuit?: { circuitName?: string; Location?: { country?: string; locality?: string } };
  Results?: Array<{
    position?: string;
    status?: string;
    Driver?: { givenName?: string; familyName?: string };
    Constructor?: { name?: string };
    Time?: { time?: string };
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
          Driver?: { givenName?: string; familyName?: string };
          Constructors?: Array<{ name?: string }>;
        }>;
        ConstructorStandings?: Array<{
          position?: string;
          points?: string;
          Constructor?: { name?: string };
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
