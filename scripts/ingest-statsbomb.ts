/**
 * Ingesta de StatsBomb Open Data → perfiles de jugador para FSports Scout.
 *
 * Procesa TODA una competición (todos los partidos, ambos equipos), construye
 * el perfil agregado por-90 de cada jugador con minutos suficientes, calcula
 * percentiles por grupo de posición (GK/DEF/MID/FWD) y genera el SQL de carga
 * para la tabla `players` de D1 (worker/scout/db/seed.generated.sql).
 *
 * Uso:  npm run scout:ingest
 * Luego: npx wrangler d1 execute fsports-scout-db --file=worker/scout/db/seed.generated.sql --local   (y --remote)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { posicionEspanol } from "../worker/scout/posiciones";

const STATSBOMB_BASE =
  "https://raw.githubusercontent.com/statsbomb/open-data/master/data";

// Competiciones a procesar: torneos internacionales recientes y comparables
// entre sí (mismo nivel de élite), ver docs/scout/PROJECT_SPEC.md §4.
const SOURCE = "statsbomb";
interface Competicion {
  id: number;
  season: number;
  name: string;
  seasonName: string;
}
const COMPETICIONES: Competicion[] = [
  { id: 223, season: 282, name: "Copa América", seasonName: "2024" },
  { id: 43, season: 106, name: "Mundial", seasonName: "2022" },
  { id: 55, season: 282, name: "Eurocopa", seasonName: "2024" },
];

// Mínimo de minutos para tener un perfil estable y entrar en la población de
// percentiles. Una muestra chica da percentiles ruidosos.
const MIN_MINUTES = 150;

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_FILE = join(ROOT, "worker", "scout", "db", "seed.generated.sql");

// Cruce de edad: planteles del Mundial 2026 (football-data.org, en vivo).
const FOOTBALL_DATA_BASE = "https://api.football-data.org/v4";

/** Lee VITE_FOOTBALL_DATA_TOKEN de .env.local (mismo token que usa el sitio). */
function leerToken(): string {
  try {
    const env = readFileSync(join(ROOT, ".env.local"), "utf8");
    const m = env.match(/VITE_FOOTBALL_DATA_TOKEN\s*=\s*(.+)/);
    return m ? m[1].trim() : "";
  } catch {
    return "";
  }
}

function normalizarNombre(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z ]/g, "")
    .trim();
}

function edadDesde(dob: string | undefined): number | null {
  if (!dob) return null;
  const n = new Date(dob);
  if (isNaN(n.getTime())) return null;
  const hoy = new Date();
  let edad = hoy.getFullYear() - n.getFullYear();
  const m = hoy.getMonth() - n.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < n.getDate())) edad--;
  return edad;
}

interface WcSquadPlayer {
  name?: string;
  dateOfBirth?: string;
}
interface WcTeam {
  squad?: WcSquadPlayer[];
}

interface EdadIndice {
  exact: Map<string, Set<number>>;
  byTokens: { toks: Set<string>; age: number }[];
}

/** Índice de edad desde los planteles del Mundial 2026, tolerante a colisiones:
 * guarda TODAS las edades por nombre para poder detectar ambigüedad. */
async function construirIndiceEdad(): Promise<EdadIndice> {
  const token = leerToken();
  const exact = new Map<string, Set<number>>();
  const byTokens: { toks: Set<string>; age: number }[] = [];
  if (!token) {
    console.log("Sin token football-data: no se cruza edad.");
    return { exact, byTokens };
  }
  try {
    const res = await fetch(`${FOOTBALL_DATA_BASE}/competitions/WC/teams`, {
      headers: { "X-Auth-Token": token },
    });
    if (!res.ok) throw new Error(`WC teams ${res.status}`);
    const data = (await res.json()) as { teams?: WcTeam[] };
    for (const t of data.teams ?? [])
      for (const p of t.squad ?? []) {
        const age = edadDesde(p.dateOfBirth);
        if (age === null || !p.name) continue;
        const n = normalizarNombre(p.name);
        if (!exact.has(n)) exact.set(n, new Set());
        exact.get(n)!.add(age);
        const toks = new Set(n.split(" ").filter(Boolean));
        if (toks.size >= 2) byTokens.push({ toks, age });
      }
    console.log(`Índice de edad Mundial 2026: ${exact.size} nombres únicos.`);
  } catch (e) {
    console.log(`No se pudo cruzar edad (${String(e)}).`);
  }
  return { exact, byTokens };
}

/** Devuelve la edad SOLO si el match es inequívoco. Ante colisión de nombres
 * (varios "Martínez") con edades distintas, devuelve null: una edad equivocada
 * es peor que ninguna. */
function matchEdad(nombreSB: string, idx: EdadIndice): number | null {
  const n = normalizarNombre(nombreSB);
  const stoks = new Set(n.split(" ").filter(Boolean));

  // Match exacto de nombre normalizado (si no es ambiguo).
  const ex = idx.exact.get(n);
  if (ex && ex.size === 1) return [...ex][0];

  // Subconjunto de tokens: junta candidatos cuyas edades coincidan todas.
  const edades = new Set<number>();
  for (const w of idx.byTokens)
    if ([...w.toks].every((t) => stoks.has(t))) edades.add(w.age);
  return edades.size === 1 ? [...edades][0] : null;
}

interface SBMatch {
  match_id: number;
  home_team: { home_team_name: string };
  away_team: { away_team_name: string };
}

interface SBLineupTeam {
  team_name: string;
  lineup: { player_id: number; country?: { name: string } }[];
}

interface SBEvent {
  id: string;
  minute: number;
  second: number;
  type: { id: number; name: string };
  team: { id: number; name: string };
  player?: { id: number; name: string };
  position?: { id: number; name: string };
  tactics?: { lineup: { player: { id: number; name: string } }[] };
  pass?: {
    length?: number;
    outcome?: { name: string };
    shot_assist?: boolean;
    goal_assist?: boolean;
    assisted_shot_id?: string;
  };
  shot?: { statsbomb_xg?: number; outcome?: { name: string } };
  dribble?: { outcome?: { name: string } };
  duel?: { type?: { name: string } };
  foul_committed?: { card?: { name: string } };
  substitution?: { replacement: { id: number; name: string } };
}

// Métricas por-90 que se calculan y reciben percentil (passAccuracy es % aparte).
const PER90_KEYS = [
  "goals",
  "xg",
  "shots",
  "assists",
  "xa",
  "keyPasses",
  "dribblesCompleted",
  "passesCompleted",
  "progressivePassesProxy", // pases largos completados como proxy de progresión
  "tackles",
  "interceptions",
  "recoveries",
  "pressures",
  "clearances",
] as const;
type Per90Key = (typeof PER90_KEYS)[number];

interface RawCounts extends Record<Per90Key, number> {
  passesAttempted: number;
}

function emptyCounts(): RawCounts {
  const c = {} as RawCounts;
  for (const k of PER90_KEYS) c[k] = 0;
  c.passesAttempted = 0;
  return c;
}

interface PlayerAgg {
  playerId: number;
  playerName: string;
  teamName: string;
  nationality: string;
  minutes: number;
  matches: number;
  positionTally: Map<string, number>;
  counts: RawCounts;
}

type PositionGroup = "GK" | "DEF" | "MID" | "FWD";

function positionGroup(pos: string | undefined): PositionGroup {
  if (!pos) return "MID";
  const p = pos.toLowerCase();
  if (p.includes("goalkeeper")) return "GK";
  if (p.includes("back")) return "DEF"; // incluye wing back
  if (p.includes("midfield")) return "MID";
  if (p.includes("wing") || p.includes("forward") || p.includes("striker"))
    return "FWD";
  return "MID";
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${STATSBOMB_BASE}/${path}`);
  if (!res.ok) throw new Error(`Fallo al descargar ${path}: ${res.status}`);
  return res.json() as Promise<T>;
}

/** Minutos jugados por un jugador en UN partido (Starting XI / Substitution / roja). */
function minutesPlayed(events: SBEvent[], playerId: number): number {
  const last = events[events.length - 1];
  const matchEnd = last.minute + last.second / 60;

  const started = events.some(
    (e) =>
      e.type.name === "Starting XI" &&
      e.tactics?.lineup.some((p) => p.player.id === playerId),
  );

  let start = 0;
  if (!started) {
    const subOn = events.find(
      (e) =>
        e.type.name === "Substitution" &&
        e.substitution?.replacement.id === playerId,
    );
    if (!subOn) return 0;
    start = subOn.minute + subOn.second / 60;
  }

  let end = matchEnd;
  const subOff = events.find(
    (e) => e.type.name === "Substitution" && e.player?.id === playerId,
  );
  if (subOff) end = subOff.minute + subOff.second / 60;

  const red = events.find(
    (e) =>
      e.player?.id === playerId &&
      e.type.name === "Foul Committed" &&
      (e.foul_committed?.card?.name === "Red Card" ||
        e.foul_committed?.card?.name === "Second Yellow"),
  );
  if (red) {
    const t = red.minute + red.second / 60;
    if (t < end) end = t;
  }

  return Math.max(0, end - start);
}

/** Acumula las métricas de todos los jugadores de un partido. */
function accumulateMatch(
  events: SBEvent[],
  nationByPlayer: Map<number, string>,
  byPlayer: Map<number, PlayerAgg>,
) {
  const shotXg = new Map<string, number>();
  for (const e of events) {
    if (e.type.name === "Shot") shotXg.set(e.id, e.shot?.statsbomb_xg ?? 0);
  }

  // Jugadores presentes en el partido (aparecen en algún evento con player).
  const present = new Set<number>();
  for (const e of events) if (e.player) present.add(e.player.id);

  // Nombres y minutos por jugador en este partido.
  for (const pid of present) {
    const min = minutesPlayed(events, pid);
    if (min <= 0) continue;
    const sample = events.find((e) => e.player?.id === pid);
    const name = sample?.player?.name ?? String(pid);
    const team = sample?.team?.name ?? "";

    let agg = byPlayer.get(pid);
    if (!agg) {
      agg = {
        playerId: pid,
        playerName: name,
        teamName: team,
        nationality: nationByPlayer.get(pid) ?? "",
        minutes: 0,
        matches: 0,
        positionTally: new Map(),
        counts: emptyCounts(),
      };
      byPlayer.set(pid, agg);
    }
    agg.minutes += min;
    agg.matches += 1;
    if (team) agg.teamName = team;
    if (!agg.nationality) agg.nationality = nationByPlayer.get(pid) ?? "";
  }

  // Conteo de eventos por jugador.
  for (const e of events) {
    if (!e.player) continue;
    const agg = byPlayer.get(e.player.id);
    if (!agg) continue; // jugador sin minutos válidos en este partido

    if (e.position?.name) {
      agg.positionTally.set(
        e.position.name,
        (agg.positionTally.get(e.position.name) ?? 0) + 1,
      );
    }

    const c = agg.counts;
    switch (e.type.name) {
      case "Shot":
        c.shots++;
        c.xg += e.shot?.statsbomb_xg ?? 0;
        if (e.shot?.outcome?.name === "Goal") c.goals++;
        break;
      case "Pass": {
        c.passesAttempted++;
        const completed = !e.pass?.outcome;
        if (completed) {
          c.passesCompleted++;
          if ((e.pass?.length ?? 0) >= 32) c.progressivePassesProxy++;
        }
        if (e.pass?.shot_assist) {
          c.keyPasses++;
          if (e.pass.assisted_shot_id)
            c.xa += shotXg.get(e.pass.assisted_shot_id) ?? 0;
        }
        if (e.pass?.goal_assist) c.assists++;
        break;
      }
      case "Dribble":
        if (e.dribble?.outcome?.name === "Complete") c.dribblesCompleted++;
        break;
      case "Duel":
        if (e.duel?.type?.name === "Tackle") c.tackles++;
        break;
      case "Interception":
        c.interceptions++;
        break;
      case "Ball Recovery":
        c.recoveries++;
        break;
      case "Pressure":
        c.pressures++;
        break;
      case "Clearance":
        c.clearances++;
        break;
    }
  }
}

function per90(value: number, minutes: number): number {
  return minutes > 0 ? (value / minutes) * 90 : 0;
}

/** Percentil (midrank) de `value` dentro de la población `pop` ordenada o no. */
function percentile(pop: number[], value: number): number {
  if (pop.length === 0) return 50;
  let below = 0;
  let equal = 0;
  for (const v of pop) {
    if (v < value) below++;
    else if (v === value) equal++;
  }
  return Math.round(((below + 0.5 * equal) / pop.length) * 100);
}

function mostFrequentPosition(tally: Map<string, number>): string {
  let best = "";
  let max = -1;
  for (const [pos, n] of tally) if (n > max) ((max = n), (best = pos));
  return best;
}

function sqlString(s: string): string {
  return `'${s.replace(/'/g, "''")}'`;
}

interface Profile {
  id: string;
  kind: "comp" | "agg";
  playerKey: number;
  playerName: string;
  teamName: string;
  nationality: string;
  position: string;
  group: PositionGroup;
  age: number | null;
  competition: string;
  season: string;
  minutes: number;
  matches: number;
  per90: Record<string, number>;
  percentiles: Record<string, number>;
}

function buildPer90(counts: RawCounts, minutes: number): Record<string, number> {
  const p90: Record<string, number> = {};
  for (const k of PER90_KEYS) p90[k] = per90(counts[k], minutes);
  p90.passAccuracy =
    counts.passesAttempted > 0
      ? (counts.passesCompleted / counts.passesAttempted) * 100
      : 0;
  return p90;
}

/** Calcula percentiles por grupo de posición sobre el conjunto dado. */
function computePercentiles(profiles: Profile[]) {
  const metricKeys = [...PER90_KEYS, "passAccuracy"];
  const groups: PositionGroup[] = ["GK", "DEF", "MID", "FWD"];
  for (const g of groups) {
    const inGroup = profiles.filter((p) => p.group === g);
    for (const key of metricKeys) {
      const pop = inGroup.map((p) => p.per90[key]);
      for (const p of inGroup) p.percentiles[key] = percentile(pop, p.per90[key]);
    }
  }
}

/** Suma los conteos/minutos de una competición al acumulado histórico global. */
function mergeAgg(into: Map<number, PlayerAgg>, from: Map<number, PlayerAgg>) {
  for (const [pid, a] of from) {
    let g = into.get(pid);
    if (!g) {
      g = {
        playerId: pid,
        playerName: a.playerName,
        teamName: a.teamName,
        nationality: a.nationality,
        minutes: 0,
        matches: 0,
        positionTally: new Map(),
        counts: emptyCounts(),
      };
      into.set(pid, g);
    }
    g.minutes += a.minutes;
    g.matches += a.matches;
    if (a.teamName) g.teamName = a.teamName;
    if (!g.nationality) g.nationality = a.nationality;
    for (const [pos, n] of a.positionTally)
      g.positionTally.set(pos, (g.positionTally.get(pos) ?? 0) + n);
    for (const k of Object.keys(a.counts) as (keyof RawCounts)[])
      g.counts[k] += a.counts[k];
  }
}

async function main() {
  // Índice de edad desde los planteles del Mundial 2026 (una vez, cruce por nombre).
  const idxEdad = await construirIndiceEdad();

  const global = new Map<number, PlayerAgg>(); // acumulado histórico
  const compCount = new Map<number, number>(); // # de competiciones por jugador
  const allProfiles: Profile[] = [];

  // ── Por competición ───────────────────────────────────────────────────────
  for (const comp of COMPETICIONES) {
    console.log(`\n${comp.name} ${comp.seasonName} (${comp.id}/${comp.season})`);
    const matches = await fetchJson<SBMatch[]>(
      `matches/${comp.id}/${comp.season}.json`,
    );
    const byPlayer = new Map<number, PlayerAgg>();
    for (const m of matches) {
      const nationByPlayer = new Map<number, string>();
      try {
        const lineups = await fetchJson<SBLineupTeam[]>(`lineups/${m.match_id}.json`);
        for (const team of lineups)
          for (const p of team.lineup)
            if (p.country?.name) nationByPlayer.set(p.player_id, p.country.name);
      } catch {
        /* sin lineup */
      }
      const events = await fetchJson<SBEvent[]>(`events/${m.match_id}.json`);
      accumulateMatch(events, nationByPlayer, byPlayer);
      process.stdout.write(".");
    }

    const compProfiles: Profile[] = [];
    for (const agg of byPlayer.values()) {
      compCount.set(agg.playerId, (compCount.get(agg.playerId) ?? 0) + 1);
      if (agg.minutes < MIN_MINUTES) continue;
      const posEn = mostFrequentPosition(agg.positionTally);
      compProfiles.push({
        id: `${SOURCE}:${comp.id}:${comp.season}:${agg.playerId}`,
        kind: "comp",
        playerKey: agg.playerId,
        playerName: agg.playerName,
        teamName: agg.teamName,
        nationality: agg.nationality,
        position: posicionEspanol(posEn),
        group: positionGroup(posEn),
        age: matchEdad(agg.playerName, idxEdad),
        competition: comp.name,
        season: comp.seasonName,
        minutes: agg.minutes,
        matches: agg.matches,
        per90: buildPer90(agg.counts, agg.minutes),
        percentiles: {},
      });
    }
    computePercentiles(compProfiles);
    allProfiles.push(...compProfiles);
    console.log(`\n  ${compProfiles.length} perfiles (≥${MIN_MINUTES}').`);
    mergeAgg(global, byPlayer);
  }

  // ── Histórico agregado ────────────────────────────────────────────────────
  const aggProfiles: Profile[] = [];
  for (const agg of global.values()) {
    if (agg.minutes < MIN_MINUTES) continue;
    const posEn = mostFrequentPosition(agg.positionTally);
    const n = compCount.get(agg.playerId) ?? 1;
    aggProfiles.push({
      id: `${SOURCE}:agg:${agg.playerId}`,
      kind: "agg",
      playerKey: agg.playerId,
      playerName: agg.playerName,
      teamName: agg.teamName,
      nationality: agg.nationality,
      position: posicionEspanol(posEn),
      group: positionGroup(posEn),
      age: matchEdad(agg.playerName, idxEdad),
      competition: "Histórico",
      season: `${n} ${n === 1 ? "competición" : "competiciones"}`,
      minutes: agg.minutes,
      matches: agg.matches,
      per90: buildPer90(agg.counts, agg.minutes),
      percentiles: {},
    });
  }
  computePercentiles(aggProfiles);
  allProfiles.push(...aggProfiles);

  const conEdad = aggProfiles.filter((p) => p.age !== null).length;
  console.log(
    `\nHistórico: ${aggProfiles.length} jugadores · ${conEdad} con edad ` +
      `(${Math.round((conEdad / aggProfiles.length) * 100)}%). Total filas: ${allProfiles.length}.`,
  );

  // ── SQL ───────────────────────────────────────────────────────────────────
  const round = (o: Record<string, number>) =>
    Object.fromEntries(Object.entries(o).map(([k, v]) => [k, Math.round(v * 1000) / 1000]));
  const lines: string[] = [
    "-- Generado por scripts/ingest-statsbomb.ts — NO editar a mano.",
    `-- ${allProfiles.length} filas · ${new Date().toISOString()}`,
    "",
  ];
  for (const p of allProfiles) {
    lines.push(
      "INSERT OR REPLACE INTO players " +
        "(id, source, kind, player_key, player_id, player_name, team_name, competition_name, season_name, position, position_group, nationality, age, minutes, matches, per90_json, percentiles_json) VALUES (" +
        [
          sqlString(p.id),
          sqlString(SOURCE),
          sqlString(p.kind),
          sqlString(String(p.playerKey)),
          sqlString(String(p.playerKey)),
          sqlString(p.playerName),
          sqlString(p.teamName),
          sqlString(p.competition),
          sqlString(p.season),
          sqlString(p.position),
          sqlString(p.group),
          sqlString(p.nationality),
          p.age === null ? "NULL" : p.age,
          Math.round(p.minutes),
          p.matches,
          sqlString(JSON.stringify(round(p.per90))),
          sqlString(JSON.stringify(p.percentiles)),
        ].join(", ") +
        ");",
    );
  }
  writeFileSync(OUT_FILE, lines.join("\n") + "\n", "utf8");
  console.log(`SQL escrito en ${OUT_FILE}`);

  // Sanity: Messi histórico.
  const messi = aggProfiles.find((p) => p.playerKey === 5503);
  if (messi) {
    console.log(
      `\nSanity — ${messi.playerName} histórico (${messi.season}, ${Math.round(messi.minutes)}'):`,
    );
    for (const k of ["goals", "xg", "keyPasses", "dribblesCompleted", "passAccuracy"])
      console.log(`  ${k}: ${messi.per90[k].toFixed(2)} (pct ${messi.percentiles[k]})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
