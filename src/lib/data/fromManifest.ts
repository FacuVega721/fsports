import { MANIFEST } from '../../data/manifest';
import type {
  ConstructorStanding,
  DataSource,
  DriverStanding,
  EstadoPartido,
  FasePartido,
  LastRace,
  Match,
  NextRace,
  StandingGroup,
  TeamFull,
} from '../types';

/**
 * Adaptador del MODO 'manual': convierte src/data/manifest.ts a los tipos
 * normalizados, VALIDANDO cada campo. Si en el manifest falta un dato o
 * está mal escrito, acá se reemplaza por un valor por defecto sensato:
 * la web nunca se rompe por un error de tipeo.
 */

function texto(v: unknown, def: string): string {
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : def;
}

function numero(v: unknown, def: number): number {
  return typeof v === 'number' && isFinite(v) ? v : def;
}

function numeroONull(v: unknown): number | null {
  return typeof v === 'number' && isFinite(v) ? v : null;
}

function estado(v: unknown): EstadoPartido {
  return v === 'en_vivo' || v === 'entretiempo' || v === 'finalizado' ? v : 'programado';
}

const FASES_VALIDAS: FasePartido[] = [
  'grupos', 'dieciseisavos', 'octavos', 'cuartos', 'semifinal', 'tercer_puesto', 'final',
];

function fase(v: unknown): FasePartido {
  return FASES_VALIDAS.includes(v as FasePartido) ? (v as FasePartido) : 'grupos';
}

function normalizarMatches(): Match[] {
  const partidos = Array.isArray(MANIFEST.futbol?.partidos) ? MANIFEST.futbol.partidos : [];
  return partidos.map((p, i) => ({
    id: texto(p?.id, `manual-${i}`),
    fecha: texto(p?.fecha, ''),
    hora: texto(p?.hora, '--:--'),
    estado: estado(p?.estado),
    local: texto(p?.local, 'Equipo local'),
    localCode: texto(p?.localCode, '').toLowerCase(),
    golesLocal: numeroONull(p?.golesLocal),
    visitante: texto(p?.visitante, 'Equipo visitante'),
    visitanteCode: texto(p?.visitanteCode, '').toLowerCase(),
    golesVisitante: numeroONull(p?.golesVisitante),
    grupo: texto(p?.grupo, ''),
    fase: fase(p?.fase),
    estadio: texto(p?.estadio, ''),
    ciudad: texto(p?.ciudad, ''),
    tv: Array.isArray(p?.tv) ? p.tv.filter((x): x is string => typeof x === 'string') : [],
    minuto: numeroONull(p?.minuto),
  }));
}

function normalizarStandings(): StandingGroup[] {
  const grupos = Array.isArray(MANIFEST.futbol?.posiciones) ? MANIFEST.futbol.posiciones : [];
  return grupos.map((g, i) => ({
    grupo: texto(g?.grupo, `${i + 1}`),
    equipos: (Array.isArray(g?.equipos) ? g.equipos : []).map((e, j) => {
      const gf = numero(e?.gf, 0);
      const gc = numero(e?.gc, 0);
      return {
        pos: numero(e?.pos, j + 1),
        nombre: texto(e?.nombre, 'Equipo'),
        code: texto(e?.code, '').toLowerCase(),
        pj: numero(e?.pj, 0),
        pts: numero(e?.pts, 0),
        g: numero(e?.g, 0),
        e: numero(e?.e, 0),
        p: numero(e?.p, 0),
        gf,
        gc,
        dif: numero(e?.dif, gf - gc),
      };
    }),
  }));
}

/** Países derivados de las posiciones del manifest (sin plantel: eso es solo de la API). */
function normalizarTeams(): TeamFull[] {
  return normalizarStandings().flatMap((g) =>
    g.equipos.map((e) => ({
      nombre: e.nombre,
      code: e.code,
      grupo: g.grupo,
      squad: [],
      dt: '',
    })),
  );
}

function normalizarUltimaCarrera(): LastRace | null {
  const c = MANIFEST.f1?.ultimaCarrera;
  if (!c) return null;
  return {
    gp: texto(c.gp, 'Último GP'),
    code: texto(c.code, '').toLowerCase(),
    circuito: texto(c.circuito, ''),
    resultados: (Array.isArray(c.podio) ? c.podio : []).map((r, i) => ({
      pos: numero(r?.pos, i + 1),
      piloto: texto(r?.piloto, 'Piloto'),
      equipo: texto(r?.equipo, ''),
      tiempo: texto(r?.tiempo, '—'),
    })),
  };
}

function normalizarProximaCarrera(): NextRace | null {
  const c = MANIFEST.f1?.proximaCarrera;
  if (!c) return null;
  return {
    gp: texto(c.gp, 'Próximo GP'),
    code: texto(c.code, '').toLowerCase(),
    circuito: texto(c.circuito, ''),
    fecha: texto(c.fecha, ''),
    hora: texto(c.hora, '--:--'),
  };
}

function normalizarPilotos(): DriverStanding[] {
  const pilotos = Array.isArray(MANIFEST.f1?.pilotos) ? MANIFEST.f1.pilotos : [];
  return pilotos.map((p, i) => ({
    pos: numero(p?.pos, i + 1),
    nombre: texto(p?.nombre, 'Piloto'),
    pts: numero(p?.pts, 0),
    equipo: texto(p?.equipo, ''),
  }));
}

function normalizarConstructores(): ConstructorStanding[] {
  const equipos = Array.isArray(MANIFEST.f1?.constructores) ? MANIFEST.f1.constructores : [];
  return equipos.map((e, i) => ({
    pos: numero(e?.pos, i + 1),
    nombre: texto(e?.nombre, 'Equipo'),
    pts: numero(e?.pts, 0),
  }));
}

export const manifestSource: DataSource = {
  futbolTitulo: texto(MANIFEST.futbol?.competicion, 'Fútbol'),
  f1Temporada: texto(MANIFEST.f1?.temporada, ''),
  getMatches: async () => normalizarMatches(),
  getStandings: async () => normalizarStandings(),
  getTeams: async () => normalizarTeams(),
  getF1Last: async () => normalizarUltimaCarrera(),
  getF1Next: async () => normalizarProximaCarrera(),
  getF1Drivers: async () => normalizarPilotos(),
  getF1Constructors: async () => normalizarConstructores(),
};
