import { hoyArg } from '../time';
import type {
  ConstructorStanding,
  DataSource,
  DriverStanding,
  LastRace,
  Match,
  NextRace,
  Player,
  StandingGroup,
  TeamFull,
} from '../types';

/**
 * MODO 'demo': datos de ejemplo abundantes para desarrollo y capturas.
 * Las fechas se calculan RELATIVAS a hoy, así la pestaña "Hoy" siempre
 * tiene partidos, "Resultados" tiene historia y "Próximos" tiene futuro.
 */

function fechaRelativa(dias: number): string {
  const [anio, mes, dia] = hoyArg().split('-').map(Number);
  const d = new Date(Date.UTC(anio, mes - 1, dia + dias));
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

// Partidos de fase de grupos (fase y ciudad se agregan más abajo)
const GRUPOS_DEMO: Omit<Match, 'fase' | 'ciudad' | 'tv' | 'jornada' | 'arbitro'>[] = [
  // ── Ayer: resultados ──
  { id: 'd1', fecha: fechaRelativa(-1), hora: '13:00', estado: 'finalizado', local: 'México', localCode: 'mx', golesLocal: 2, visitante: 'Sudáfrica', visitanteCode: 'za', golesVisitante: 0, grupo: 'A', estadio: 'Estadio Azteca', minuto: null },
  { id: 'd2', fecha: fechaRelativa(-1), hora: '16:00', estado: 'finalizado', local: 'Corea del Sur', localCode: 'kr', golesLocal: 1, visitante: 'Escocia', visitanteCode: 'gb-sct', golesVisitante: 1, grupo: 'A', estadio: 'Estadio Akron, Guadalajara', minuto: null },
  { id: 'd3', fecha: fechaRelativa(-1), hora: '19:00', estado: 'finalizado', local: 'Canadá', localCode: 'ca', golesLocal: 3, visitante: 'Honduras', visitanteCode: 'hn', golesVisitante: 1, grupo: 'B', estadio: 'BMO Field, Toronto', minuto: null },
  // ── Hoy: en vivo + programados + un final temprano ──
  { id: 'd4', fecha: fechaRelativa(0), hora: '10:00', estado: 'finalizado', local: 'Suiza', localCode: 'ch', golesLocal: 2, visitante: 'Gales', visitanteCode: 'gb-wls', golesVisitante: 2, grupo: 'B', estadio: 'Lincoln Financial Field, Filadelfia', minuto: null },
  { id: 'd5', fecha: fechaRelativa(0), hora: '13:00', estado: 'en_vivo', local: 'Brasil', localCode: 'br', golesLocal: 1, visitante: 'Marruecos', visitanteCode: 'ma', golesVisitante: 0, grupo: 'C', estadio: 'MetLife Stadium, Nueva York', minuto: 67 },
  { id: 'd6', fecha: fechaRelativa(0), hora: '16:00', estado: 'entretiempo', local: 'Estados Unidos', localCode: 'us', golesLocal: 0, visitante: 'Paraguay', visitanteCode: 'py', golesVisitante: 1, grupo: 'D', estadio: 'SoFi Stadium, Los Ángeles', minuto: 45 },
  { id: 'd7', fecha: fechaRelativa(0), hora: '19:00', estado: 'programado', local: 'Japón', localCode: 'jp', golesLocal: null, visitante: 'Túnez', visitanteCode: 'tn', golesVisitante: null, grupo: 'C', estadio: 'AT&T Stadium, Dallas', minuto: null },
  { id: 'd8', fecha: fechaRelativa(0), hora: '22:00', estado: 'programado', local: 'Países Bajos', localCode: 'nl', golesLocal: null, visitante: 'Costa Rica', visitanteCode: 'cr', golesVisitante: null, grupo: 'D', estadio: 'Levi’s Stadium, San Francisco', minuto: null },
  // ── Mañana y pasado: próximos ──
  { id: 'd9', fecha: fechaRelativa(1), hora: '16:00', estado: 'programado', local: 'Argentina', localCode: 'ar', golesLocal: null, visitante: 'Argelia', visitanteCode: 'dz', golesVisitante: null, grupo: 'J', estadio: 'Hard Rock Stadium, Miami', minuto: null },
  { id: 'd10', fecha: fechaRelativa(1), hora: '13:00', estado: 'programado', local: 'Francia', localCode: 'fr', golesLocal: null, visitante: 'Senegal', visitanteCode: 'sn', golesVisitante: null, grupo: 'E', estadio: 'Gillette Stadium, Boston', minuto: null },
  { id: 'd11', fecha: fechaRelativa(1), hora: '19:00', estado: 'programado', local: 'España', localCode: 'es', golesLocal: null, visitante: 'Uzbekistán', visitanteCode: 'uz', golesVisitante: null, grupo: 'F', estadio: 'NRG Stadium, Houston', minuto: null },
  { id: 'd12', fecha: fechaRelativa(2), hora: '16:00', estado: 'programado', local: 'Inglaterra', localCode: 'gb-eng', golesLocal: null, visitante: 'Jamaica', visitanteCode: 'jm', golesVisitante: null, grupo: 'G', estadio: 'Arrowhead Stadium, Kansas City', minuto: null },
  { id: 'd13', fecha: fechaRelativa(2), hora: '19:00', estado: 'programado', local: 'Alemania', localCode: 'de', golesLocal: null, visitante: 'Ecuador', visitanteCode: 'ec', golesVisitante: null, grupo: 'H', estadio: 'Mercedes-Benz Stadium, Atlanta', minuto: null },
];

// Partidos de eliminatoria de ejemplo (la ciudad se agrega más abajo)
const ELIMINATORIA_DEMO: Omit<Match, 'ciudad' | 'tv' | 'jornada' | 'arbitro'>[] = [
  { id: 'k1', fecha: fechaRelativa(10), hora: '16:00', estado: 'programado', local: 'Argentina', localCode: 'ar', golesLocal: null, visitante: 'Suiza', visitanteCode: 'ch', golesVisitante: null, grupo: '', fase: 'dieciseisavos', estadio: 'Hard Rock Stadium, Miami', minuto: null },
  { id: 'k2', fecha: fechaRelativa(10), hora: '20:00', estado: 'programado', local: 'Brasil', localCode: 'br', golesLocal: null, visitante: 'Corea del Sur', visitanteCode: 'kr', golesVisitante: null, grupo: '', fase: 'dieciseisavos', estadio: 'MetLife Stadium, Nueva York', minuto: null },
  { id: 'k3', fecha: fechaRelativa(14), hora: '16:00', estado: 'programado', local: 'Argentina', localCode: 'ar', golesLocal: null, visitante: 'Países Bajos', visitanteCode: 'nl', golesVisitante: null, grupo: '', fase: 'octavos', estadio: 'AT&T Stadium, Dallas', minuto: null },
  { id: 'k4', fecha: fechaRelativa(18), hora: '16:00', estado: 'programado', local: 'Argentina', localCode: 'ar', golesLocal: null, visitante: 'Francia', visitanteCode: 'fr', golesVisitante: null, grupo: '', fase: 'cuartos', estadio: 'SoFi Stadium, Los Ángeles', minuto: null },
  { id: 'k5', fecha: fechaRelativa(22), hora: '16:00', estado: 'programado', local: 'Argentina', localCode: 'ar', golesLocal: null, visitante: 'España', visitanteCode: 'es', golesVisitante: null, grupo: '', fase: 'semifinal', estadio: 'MetLife Stadium, Nueva York', minuto: null },
  { id: 'k6', fecha: fechaRelativa(25), hora: '16:00', estado: 'programado', local: 'Por definir', localCode: '', golesLocal: null, visitante: 'Por definir', visitanteCode: '', golesVisitante: null, grupo: '', fase: 'tercer_puesto', estadio: 'Estadio de Miami', minuto: null },
  { id: 'k7', fecha: fechaRelativa(26), hora: '16:00', estado: 'programado', local: 'Por definir', localCode: '', golesLocal: null, visitante: 'Por definir', visitanteCode: '', golesVisitante: null, grupo: '', fase: 'final', estadio: 'MetLife Stadium, Nueva York', minuto: null },
];

const MATCHES: Match[] = [
  ...GRUPOS_DEMO.map((m) => ({ ...m, fase: 'grupos' as const, ciudad: '', tv: [], jornada: 1, arbitro: '' })),
  ...ELIMINATORIA_DEMO.map((m) => ({ ...m, ciudad: '', tv: [], jornada: null, arbitro: '' })),
];

// Filas base (sin las stats detalladas); se completan con derivarStats abajo.
type FilaBase = { pos: number; nombre: string; code: string; pj: number; pts: number };

const STANDINGS_RAW: Array<{ grupo: string; equipos: FilaBase[] }> = [
  {
    grupo: 'A',
    equipos: [
      { pos: 1, nombre: 'México', code: 'mx', pj: 1, pts: 3 },
      { pos: 2, nombre: 'Corea del Sur', code: 'kr', pj: 1, pts: 1 },
      { pos: 3, nombre: 'Escocia', code: 'gb-sct', pj: 1, pts: 1 },
      { pos: 4, nombre: 'Sudáfrica', code: 'za', pj: 1, pts: 0 },
    ],
  },
  {
    grupo: 'B',
    equipos: [
      { pos: 1, nombre: 'Canadá', code: 'ca', pj: 1, pts: 3 },
      { pos: 2, nombre: 'Suiza', code: 'ch', pj: 1, pts: 1 },
      { pos: 3, nombre: 'Gales', code: 'gb-wls', pj: 1, pts: 1 },
      { pos: 4, nombre: 'Honduras', code: 'hn', pj: 1, pts: 0 },
    ],
  },
  {
    grupo: 'C',
    equipos: [
      { pos: 1, nombre: 'Brasil', code: 'br', pj: 0, pts: 0 },
      { pos: 2, nombre: 'Japón', code: 'jp', pj: 0, pts: 0 },
      { pos: 3, nombre: 'Marruecos', code: 'ma', pj: 0, pts: 0 },
      { pos: 4, nombre: 'Túnez', code: 'tn', pj: 0, pts: 0 },
    ],
  },
  {
    grupo: 'J',
    equipos: [
      { pos: 1, nombre: 'Argentina', code: 'ar', pj: 0, pts: 0 },
      { pos: 2, nombre: 'Argelia', code: 'dz', pj: 0, pts: 0 },
      { pos: 3, nombre: 'Austria', code: 'at', pj: 0, pts: 0 },
      { pos: 4, nombre: 'Jordania', code: 'jo', pj: 0, pts: 0 },
    ],
  },
];

// Deriva stats coherentes (G/E/P/GF/GC/DIF) a partir de pj y pts, solo para el demo.
const STANDINGS: StandingGroup[] = STANDINGS_RAW.map((grupo) => ({
  grupo: grupo.grupo,
  equipos: grupo.equipos.map((f) => {
    const g = f.pts === 3 ? 1 : 0;
    const e = f.pts === 1 ? 1 : 0;
    const p = f.pj - g - e;
    const gf = g * 2 + e; // números plausibles de muestra
    const gc = p * 2 + e;
    return { ...f, g, e, p, gf, gc, dif: gf - gc };
  }),
}));

// Plantel de muestra (solo Argentina) para ver la sección en modo demo.
const PLANTEL_ARG: Player[] = [
  { nombre: 'Emiliano Martínez', posicion: 'Arquero', edad: 33, nacionalidad: 'Argentina', dorsal: 23 },
  { nombre: 'Gerónimo Rulli', posicion: 'Arquero', edad: 34, nacionalidad: 'Argentina', dorsal: 12 },
  { nombre: 'Nahuel Molina', posicion: 'Defensor', edad: 28, nacionalidad: 'Argentina', dorsal: 26 },
  { nombre: 'Cristian Romero', posicion: 'Defensor', edad: 28, nacionalidad: 'Argentina', dorsal: 13 },
  { nombre: 'Nicolás Otamendi', posicion: 'Defensor', edad: 38, nacionalidad: 'Argentina', dorsal: 19 },
  { nombre: 'Nicolás Tagliafico', posicion: 'Defensor', edad: 33, nacionalidad: 'Argentina', dorsal: 3 },
  { nombre: 'Rodrigo De Paul', posicion: 'Mediocampista', edad: 32, nacionalidad: 'Argentina', dorsal: 7 },
  { nombre: 'Enzo Fernández', posicion: 'Mediocampista', edad: 25, nacionalidad: 'Argentina', dorsal: 24 },
  { nombre: 'Alexis Mac Allister', posicion: 'Mediocampista', edad: 27, nacionalidad: 'Argentina', dorsal: 20 },
  { nombre: 'Lionel Messi', posicion: 'Delantero', edad: 38, nacionalidad: 'Argentina', dorsal: 10 },
  { nombre: 'Julián Álvarez', posicion: 'Delantero', edad: 26, nacionalidad: 'Argentina', dorsal: 9 },
  { nombre: 'Lautaro Martínez', posicion: 'Delantero', edad: 28, nacionalidad: 'Argentina', dorsal: 22 },
];

const TEAMS: TeamFull[] = STANDINGS.flatMap((g) =>
  g.equipos.map((e) => ({
    nombre: e.nombre,
    code: e.code,
    grupo: g.grupo,
    squad: e.nombre === 'Argentina' ? PLANTEL_ARG : [],
    dt: e.nombre === 'Argentina' ? 'Lionel Scaloni' : '',
  })),
);

const ULTIMA_CARRERA: LastRace = {
  gp: 'GP de Canadá',
  code: 'ca',
  circuito: 'Circuit Gilles Villeneuve',
  resultados: [
    { pos: 1, piloto: 'Max Verstappen', equipo: 'Red Bull', tiempo: '1:33:24.567' },
    { pos: 2, piloto: 'Lando Norris', equipo: 'McLaren', tiempo: '+4.183' },
    { pos: 3, piloto: 'Charles Leclerc', equipo: 'Ferrari', tiempo: '+9.764' },
    { pos: 4, piloto: 'Oscar Piastri', equipo: 'McLaren', tiempo: '+15.301' },
    { pos: 5, piloto: 'Franco Colapinto', equipo: 'Alpine', tiempo: '+22.876' },
    { pos: 6, piloto: 'George Russell', equipo: 'Mercedes', tiempo: '+28.110' },
    { pos: 7, piloto: 'Lewis Hamilton', equipo: 'Ferrari', tiempo: '+33.405' },
    { pos: 8, piloto: 'Fernando Alonso', equipo: 'Aston Martin', tiempo: '+41.962' },
    { pos: 9, piloto: 'Carlos Sainz', equipo: 'Williams', tiempo: '+47.220' },
    { pos: 10, piloto: 'Pierre Gasly', equipo: 'Alpine', tiempo: '+1 vuelta' },
  ],
};

const PROXIMA_CARRERA: NextRace = {
  gp: 'GP de España',
  code: 'es',
  circuito: 'Circuit de Barcelona-Catalunya',
  fecha: fechaRelativa(12),
  hora: '10:00',
};

const PILOTOS: DriverStanding[] = [
  { pos: 1, nombre: 'M. Verstappen', pts: 161, equipo: 'Red Bull' },
  { pos: 2, nombre: 'L. Norris', pts: 148, equipo: 'McLaren' },
  { pos: 3, nombre: 'C. Leclerc', pts: 132, equipo: 'Ferrari' },
  { pos: 4, nombre: 'O. Piastri', pts: 121, equipo: 'McLaren' },
  { pos: 5, nombre: 'G. Russell', pts: 98, equipo: 'Mercedes' },
  { pos: 6, nombre: 'F. Colapinto', pts: 74, equipo: 'Alpine' },
  { pos: 7, nombre: 'L. Hamilton', pts: 70, equipo: 'Ferrari' },
  { pos: 8, nombre: 'F. Alonso', pts: 52, equipo: 'Aston Martin' },
  { pos: 9, nombre: 'C. Sainz', pts: 44, equipo: 'Williams' },
  { pos: 10, nombre: 'P. Gasly', pts: 31, equipo: 'Alpine' },
];

const CONSTRUCTORES: ConstructorStanding[] = [
  { pos: 1, nombre: 'McLaren', pts: 269 },
  { pos: 2, nombre: 'Red Bull', pts: 203 },
  { pos: 3, nombre: 'Ferrari', pts: 202 },
  { pos: 4, nombre: 'Mercedes', pts: 144 },
  { pos: 5, nombre: 'Alpine', pts: 105 },
  { pos: 6, nombre: 'Aston Martin', pts: 71 },
  { pos: 7, nombre: 'Williams', pts: 58 },
];

export const demoSource: DataSource = {
  futbolTitulo: 'FIFA World Cup 2026',
  f1Temporada: '2026',
  getMatches: async () => MATCHES,
  getStandings: async () => STANDINGS,
  getScorers: async () => [],
  getTeams: async () => TEAMS,
  getF1Last: async () => ULTIMA_CARRERA,
  getF1Next: async () => PROXIMA_CARRERA,
  getF1Drivers: async () => PILOTOS,
  getF1Constructors: async () => CONSTRUCTORES,
  getF1Calendar: async () => [],
  getF1Race: async () => null,
  getF1Teams: async () => [],
  getMatchDetail: async (id) => {
    const m = MATCHES.find((m) => m.id === id);
    return m ? { ...m, eventos: [], h2h: [] } : null;
  },
};
