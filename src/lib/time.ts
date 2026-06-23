/**
 * Utilidades de tiempo. La app guarda y agrupa todo en UTC-3 (Argentina) —
 * es la fuente de verdad para "hoy", ordenamiento y fixture. Para MOSTRAR
 * el horario, `convertirAZona` lo traduce a la zona detectada del visitante
 * (ver TimezoneContext / useHoraLocal); si es Argentina, no cambia nada.
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

const ZONA_DEFAULT = 'America/Argentina/Buenos_Aires';

/** Detecta la zona horaria IANA del navegador; cae a Argentina si no se puede determinar. */
export function detectarZonaHoraria(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || ZONA_DEFAULT;
  } catch {
    return ZONA_DEFAULT;
  }
}

/** "America/Argentina/Buenos_Aires" → "GMT-3" (offset legible para mostrar al usuario). */
export function etiquetaZona(tz: string): string {
  try {
    const partes = new Intl.DateTimeFormat('es-AR', {
      timeZone: tz,
      timeZoneName: 'shortOffset',
    }).formatToParts(new Date());
    return partes.find((p) => p.type === 'timeZoneName')?.value ?? tz;
  } catch {
    return tz;
  }
}

/**
 * Offset de una zona respecto a UTC, en minutos, para un instante dado.
 * Se usa para comparar zonas por su offset real (no por nombre de string):
 * el navegador puede reportar el alias "America/Buenos_Aires" en vez del
 * nombre canónico "America/Argentina/Buenos_Aires" — ambos son UTC-3, pero
 * un string-compare exacto no lo detectaría.
 */
function offsetMinutos(tz: string, instante: Date): number {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).formatToParts(instante);
  const get = (t: string) => Number(partes.find((p) => p.type === t)?.value ?? 0);
  const hora = get('hour') === 24 ? 0 : get('hour');
  const comoUtc = Date.UTC(get('year'), get('month') - 1, get('day'), hora, get('minute'), get('second'));
  return Math.round((comoUtc - instante.getTime()) / 60000);
}

/** True si `tz` tiene el mismo offset que Argentina (UTC-3) ahora mismo. */
export function esOffsetArgentina(tz: string): boolean {
  try {
    return offsetMinutos(tz, new Date()) === -180;
  } catch {
    return tz === ZONA_DEFAULT;
  }
}

/**
 * Convierte fecha+hora en UTC-3 (Argentina, formato nativo de la app) a la zona
 * horaria indicada. `distinta` indica si la fecha local cambió respecto al día
 * de Argentina (cruce de medianoche), para poder avisarlo en la UI.
 */
export function convertirAZona(
  fecha: string,
  hora: string,
  tz: string,
): { fecha: string; hora: string; distinta: boolean } {
  if (!tz || esOffsetArgentina(tz)) return { fecha, hora, distinta: false };

  const [anio, mes, dia] = fecha.split('-').map(Number);
  const [hh, mm] = hora.split(':').map(Number);
  if ([anio, mes, dia, hh, mm].some((n) => isNaN(n))) return { fecha, hora, distinta: false };

  // La app guarda todo en UTC-3 → el instante UTC real es ARG + 3 horas.
  const instanteUtc = new Date(Date.UTC(anio, mes - 1, dia, hh + 3, mm));
  if (isNaN(instanteUtc.getTime())) return { fecha, hora, distinta: false };

  let partes: Intl.DateTimeFormatPart[];
  try {
    partes = new Intl.DateTimeFormat('es-AR', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(instanteUtc);
  } catch {
    return { fecha, hora, distinta: false };
  }

  const get = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? '';
  const horaLocal = get('hour') === '24' ? '00' : get('hour');
  const fechaLocal = `${get('year')}-${get('month')}-${get('day')}`;

  return { fecha: fechaLocal, hora: `${horaLocal}:${get('minute')}`, distinta: fechaLocal !== fecha };
}
