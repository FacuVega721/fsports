/**
 * Utilidades de tiempo. REGLA DE LA CASA: todos los horarios de FSports
 * se muestran en UTC-3 (Argentina), fijo — NO la zona horaria del navegador.
 */

const ARG_OFFSET_MS = 3 * 60 * 60 * 1000;

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

/** Convierte un instante UTC (ISO string) a fecha y hora en UTC-3. */
export function utcToArg(utcIso: string): { fecha: string; hora: string } {
  const d = new Date(utcIso);
  if (isNaN(d.getTime())) return { fecha: '', hora: '' };
  const arg = new Date(d.getTime() - ARG_OFFSET_MS);
  return {
    fecha: `${arg.getUTCFullYear()}-${pad(arg.getUTCMonth() + 1)}-${pad(arg.getUTCDate())}`,
    hora: `${pad(arg.getUTCHours())}:${pad(arg.getUTCMinutes())}`,
  };
}

/** La fecha de "hoy" en UTC-3, formato YYYY-MM-DD. */
export function hoyArg(): string {
  const arg = new Date(Date.now() - ARG_OFFSET_MS);
  return `${arg.getUTCFullYear()}-${pad(arg.getUTCMonth() + 1)}-${pad(arg.getUTCDate())}`;
}

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/**
 * Formatea una fecha YYYY-MM-DD como "Jueves 11 de junio".
 * Parsea a mano para evitar corrimientos de zona horaria.
 */
export function formatFecha(fecha: string): string {
  const partes = fecha.split('-').map(Number);
  if (partes.length !== 3 || partes.some(isNaN)) return fecha;
  const [anio, mes, dia] = partes;
  const d = new Date(Date.UTC(anio, mes - 1, dia));
  return `${DIAS[d.getUTCDay()]} ${dia} de ${MESES[mes - 1]}`;
}

/** Formatea un rango de fechas YYYY-MM-DD como "12 al 14 de junio" (o "30 de jun. al 1 de jul." si cruza de mes). */
export function formatRangoFechas(inicio: string, fin: string): string {
  const pInicio = inicio.split('-').map(Number);
  const pFin = fin.split('-').map(Number);
  if (pInicio.length !== 3 || pFin.length !== 3 || pInicio.some(isNaN) || pFin.some(isNaN)) {
    return formatFecha(fin);
  }
  const [, mesI, diaI] = pInicio;
  const [, mesF, diaF] = pFin;
  if (inicio === fin) return `${diaF} de ${MESES[mesF - 1]}`;
  if (mesI === mesF) return `${diaI} al ${diaF} de ${MESES[mesF - 1]}`;
  return `${diaI} de ${MESES[mesI - 1]} al ${diaF} de ${MESES[mesF - 1]}`;
}

/** True si "hoy" (UTC-3) cae entre `inicio` y `fin` (fechas YYYY-MM-DD), inclusive. */
export function enRango(inicio: string, fin: string): boolean {
  const hoy = hoyArg();
  return hoy >= inicio && hoy <= fin;
}

/** Días que faltan (en UTC-3) hasta una fecha YYYY-MM-DD. Negativo si ya pasó. */
export function diasHasta(fecha: string): number {
  const partes = fecha.split('-').map(Number);
  if (partes.length !== 3 || partes.some(isNaN)) return 0;
  const [anio, mes, dia] = partes;
  const objetivo = Date.UTC(anio, mes - 1, dia);
  const hoy = hoyArg().split('-').map(Number);
  const hoyUtc = Date.UTC(hoy[0], hoy[1] - 1, hoy[2]);
  return Math.round((objetivo - hoyUtc) / 86400000);
}
