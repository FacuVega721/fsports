import { createContext, useContext, useMemo } from 'react';
import { detectarZonaHoraria } from '../lib/time';

const TimezoneCtx = createContext<string>('America/Argentina/Buenos_Aires');

/** Detecta la zona horaria del navegador una sola vez y la expone a toda la app. */
export function TimezoneProvider({ children }: { children: React.ReactNode }) {
  const tz = useMemo(() => detectarZonaHoraria(), []);
  return <TimezoneCtx.Provider value={tz}>{children}</TimezoneCtx.Provider>;
}

export function useTimezone(): string {
  return useContext(TimezoneCtx);
}
