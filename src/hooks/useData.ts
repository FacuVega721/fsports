import { useQuery } from '@tanstack/react-query';
import { DATA_MODE } from '../lib/config';
import { dataSource } from '../lib/data';

/**
 * Hooks de datos. La frecuencia de actualización respeta los límites:
 * - football-data.org: 10 req/min → staleTime y refetchInterval de 60s, nunca menos.
 * - Jolpica-F1: staleTime de 5 min (los datos de F1 cambian poco fuera de carrera).
 * - En modo manual/demo no hay red: los datos no caducan nunca.
 */

const esApi = DATA_MODE === 'api';

const MINUTO = 60_000;
const CINCO_MINUTOS = 5 * MINUTO;

export function useMatches() {
  return useQuery({
    queryKey: ['matches', DATA_MODE],
    queryFn: () => dataSource.getMatches(),
    staleTime: esApi ? MINUTO : Infinity,
    refetchInterval: esApi ? MINUTO : false,
  });
}

export function useStandings() {
  return useQuery({
    queryKey: ['standings', DATA_MODE],
    queryFn: () => dataSource.getStandings(),
    staleTime: esApi ? CINCO_MINUTOS : Infinity,
  });
}

export function useScorers() {
  return useQuery({
    queryKey: ['scorers', DATA_MODE],
    queryFn: () => dataSource.getScorers(),
    staleTime: esApi ? CINCO_MINUTOS : Infinity,
  });
}

export function useTeams() {
  return useQuery({
    queryKey: ['teams', DATA_MODE],
    queryFn: () => dataSource.getTeams(),
    staleTime: esApi ? CINCO_MINUTOS : Infinity,
  });
}

export function useF1Calendar() {
  return useQuery({
    queryKey: ['f1-calendar', DATA_MODE],
    queryFn: () => dataSource.getF1Calendar(),
    staleTime: esApi ? CINCO_MINUTOS : Infinity,
  });
}

export function useF1Race(ronda: number | null) {
  return useQuery({
    queryKey: ['f1-race', DATA_MODE, ronda],
    queryFn: () => dataSource.getF1Race(ronda as number),
    enabled: ronda !== null,
    staleTime: esApi ? CINCO_MINUTOS : Infinity,
  });
}

export function useF1Teams() {
  return useQuery({
    queryKey: ['f1-teams', DATA_MODE],
    queryFn: () => dataSource.getF1Teams(),
    staleTime: esApi ? CINCO_MINUTOS : Infinity,
  });
}

export function useF1Last() {
  return useQuery({
    queryKey: ['f1-last', DATA_MODE],
    queryFn: () => dataSource.getF1Last(),
    staleTime: esApi ? CINCO_MINUTOS : Infinity,
  });
}

export function useF1Next() {
  return useQuery({
    queryKey: ['f1-next', DATA_MODE],
    queryFn: () => dataSource.getF1Next(),
    staleTime: esApi ? CINCO_MINUTOS : Infinity,
  });
}

export function useF1Drivers() {
  return useQuery({
    queryKey: ['f1-drivers', DATA_MODE],
    queryFn: () => dataSource.getF1Drivers(),
    staleTime: esApi ? CINCO_MINUTOS : Infinity,
  });
}

export function useF1Constructors() {
  return useQuery({
    queryKey: ['f1-constructors', DATA_MODE],
    queryFn: () => dataSource.getF1Constructors(),
    staleTime: esApi ? CINCO_MINUTOS : Infinity,
  });
}
