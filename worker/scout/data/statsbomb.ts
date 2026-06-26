/**
 * StatsBombSource: lee perfiles ya pre-procesados desde la tabla `players` de
 * D1 (cargada por scripts/ingest-statsbomb.ts). No toca la fuente cruda.
 */
import type {
  DataSource,
  PlayerProfile,
  PlayerSample,
  PlayerSummary,
  SearchFilters,
} from './source';

interface PlayerRow {
  id: string;
  player_key: string;
  player_name: string;
  team_name: string;
  competition_name: string;
  season_name: string;
  position: string;
  position_group: string;
  nationality: string;
  age: number | null;
  minutes: number;
  matches: number;
  per90_json: string;
  percentiles_json: string;
}

function toSummary(r: PlayerRow): PlayerSummary {
  return {
    id: r.id,
    playerKey: r.player_key,
    name: r.player_name,
    team: r.team_name,
    position: r.position,
    nationality: r.nationality,
    age: r.age ?? null,
    competition: r.competition_name,
    season: r.season_name,
  };
}

export class StatsBombSource implements DataSource {
  constructor(private db: D1Database) {}

  async searchPlayers(query: string, filters?: SearchFilters): Promise<PlayerSummary[]> {
    // El dropdown lista un perfil por jugador: el histórico (kind='agg').
    const where: string[] = [`kind = 'agg'`];
    const binds: unknown[] = [];
    if (query.trim()) {
      where.push('player_name LIKE ?');
      binds.push(`%${query.trim()}%`);
    }
    if (filters?.positionGroup) {
      where.push('position_group = ?');
      binds.push(filters.positionGroup);
    }
    if (filters?.nationality) {
      where.push('nationality = ?');
      binds.push(filters.nationality);
    }
    const { results } = await this.db
      .prepare(
        `SELECT id, player_key, player_name, team_name, position, nationality, age, competition_name, season_name
         FROM players WHERE ${where.join(' AND ')} ORDER BY player_name ASC LIMIT 1000`,
      )
      .bind(...binds)
      .all<PlayerRow>();
    return results.map(toSummary);
  }

  async listSamples(playerKey: string): Promise<PlayerSample[]> {
    const { results } = await this.db
      .prepare(
        `SELECT id, kind, competition_name, season_name, minutes, matches
         FROM players WHERE player_key = ?
         ORDER BY (kind = 'agg') DESC, minutes DESC`,
      )
      .bind(playerKey)
      .all<{
        id: string;
        kind: 'comp' | 'agg';
        competition_name: string;
        season_name: string;
        minutes: number;
        matches: number;
      }>();
    return results.map((r) => ({
      id: r.id,
      kind: r.kind,
      competition: r.competition_name,
      season: r.season_name,
      minutes: r.minutes,
      matches: r.matches,
    }));
  }

  async listNationalities(): Promise<string[]> {
    const { results } = await this.db
      .prepare(
        `SELECT DISTINCT nationality FROM players
         WHERE nationality IS NOT NULL AND nationality != '' ORDER BY nationality`,
      )
      .all<{ nationality: string }>();
    return results.map((r) => r.nationality);
  }

  async getPlayerProfile(id: string): Promise<PlayerProfile | null> {
    const r = await this.db
      .prepare(`SELECT * FROM players WHERE id = ?`)
      .bind(id)
      .first<PlayerRow>();
    if (!r) return null;
    return {
      ...toSummary(r),
      kind: (r as PlayerRow & { kind?: 'comp' | 'agg' }).kind ?? 'comp',
      positionGroup: r.position_group,
      minutes: r.minutes,
      matches: r.matches,
      per90: JSON.parse(r.per90_json) as Record<string, number>,
      percentiles: JSON.parse(r.percentiles_json) as Record<string, number>,
    };
  }
}
