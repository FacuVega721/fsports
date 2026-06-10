import { DATA_MODE } from '../config';
import type { DataSource } from '../types';
import { demoSource } from './demo';
import { manifestSource } from './fromManifest';
import {
  getF1ConstructorsApi,
  getF1DriversApi,
  getF1LastApi,
  getF1NextApi,
} from './f1';
import { getMatchesApi, getStandingsApi } from './football';

/**
 * Selector de modo de datos. ÚNICO punto donde se decide la fuente.
 * Los componentes importan `dataSource` y nunca saben de dónde vienen
 * los datos: manual (manifest), api (en vivo) o demo (ejemplo).
 */

const apiSource: DataSource = {
  futbolTitulo: 'Mundial 2026',
  f1Temporada: String(new Date().getFullYear()),
  getMatches: getMatchesApi,
  getStandings: getStandingsApi,
  getF1Last: getF1LastApi,
  getF1Next: getF1NextApi,
  getF1Drivers: getF1DriversApi,
  getF1Constructors: getF1ConstructorsApi,
};

const sources: Record<typeof DATA_MODE, DataSource> = {
  manual: manifestSource,
  api: apiSource,
  demo: demoSource,
};

export const dataSource: DataSource = sources[DATA_MODE];
