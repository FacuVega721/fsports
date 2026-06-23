import { useTimezone } from '../contexts/TimezoneContext';
import { convertirAZona } from '../lib/time';

/**
 * Convierte una fecha+hora en UTC-3 (formato nativo de la app) a la zona horaria
 * detectada del visitante. Si es Argentina, devuelve los valores sin tocar.
 */
export function useHoraLocal(fecha: string, hora: string): { fecha: string; hora: string; distinta: boolean } {
  const tz = useTimezone();
  return convertirAZona(fecha, hora, tz);
}
