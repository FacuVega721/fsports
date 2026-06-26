/**
 * Convierte un PlayerProfile (per90 + percentiles) en la `{tabla_metricas}`
 * agrupada por categoría que arma el user prompt (ver docs/scout/PROMPT.md).
 */
import type { PlayerProfile } from './data/source';
import type { PlayerPromptInput } from './prompt';

const CATEGORIES: { title: string; keys: [string, string][] }[] = [
  {
    title: 'OFENSIVAS',
    keys: [
      ['goals', 'Goles'],
      ['xg', 'xG'],
      ['shots', 'Tiros'],
      ['assists', 'Asistencias'],
      ['xa', 'xA'],
      ['keyPasses', 'Pases clave'],
      ['dribblesCompleted', 'Regates completados'],
    ],
  },
  {
    title: 'CONSTRUCCIÓN',
    keys: [
      ['passesCompleted', 'Pases completados'],
      ['passAccuracy', '% acierto de pase'],
      ['progressivePassesProxy', 'Pases largos / progresión'],
    ],
  },
  {
    title: 'DEFENSIVAS',
    keys: [
      ['tackles', 'Entradas'],
      ['interceptions', 'Intercepciones'],
      ['recoveries', 'Recuperaciones'],
      ['pressures', 'Presiones'],
      ['clearances', 'Despejes'],
    ],
  },
];

function line(profile: PlayerProfile, key: string, label: string): string {
  const v = profile.per90[key] ?? 0;
  const pct = profile.percentiles[key];
  const pctTxt = pct === undefined ? '' : ` (percentil ${pct})`;
  if (key === 'passAccuracy') return `- ${label}: ${v.toFixed(0)}%${pctTxt}`;
  return `- ${label}: ${v.toFixed(2)} por 90${pctTxt}`;
}

export function buildMetricsTable(profile: PlayerProfile): string {
  const blocks = CATEGORIES.map((cat) => {
    const rows = cat.keys
      .filter(([k]) => profile.per90[k] !== undefined)
      .map(([k, label]) => line(profile, k, label));
    return `${cat.title}\n${rows.join('\n')}`;
  });
  return blocks.join('\n\n');
}

/** Arma el input del prompt a partir del perfil. StatsBomb Open Data no trae
 * edad; club = selección, liga = competición + temporada de la muestra. */
export function profileToPromptInput(
  profile: PlayerProfile,
  locale: 'es' | 'en',
): PlayerPromptInput {
  const league =
    profile.kind === 'agg'
      ? `Histórico · ${profile.season}`
      : `${profile.competition} ${profile.season}`;
  return {
    playerName: profile.name,
    position: profile.position,
    age: profile.age ?? undefined,
    club: profile.team,
    league,
    minutes: Math.round(profile.minutes),
    metricsTable: buildMetricsTable(profile),
    locale,
  };
}
