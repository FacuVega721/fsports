/**
 * Escala semántica de percentiles/score de Scout, compartida entre el panel de
 * métricas (barras) y el anillo de progreso. Verde (mejor) → naranja (peor).
 * NO se usa el rojo de marca para no confundir identidad con "alerta".
 */

export type Tier = 'alto' | 'medio' | 'neutro' | 'bajo';

/** Umbrales: ≥80 alto · ≥60 medio · ≥40 neutro · <40 bajo. */
export function tier(pct: number): Tier {
  if (pct >= 80) return 'alto';
  if (pct >= 60) return 'medio';
  if (pct >= 40) return 'neutro';
  return 'bajo';
}

/** Color CSS (token) del tier — para SVG/inline styles que no pueden usar clases. */
export function tierColor(pct: number): string {
  switch (tier(pct)) {
    case 'alto':
      return 'var(--green)';
    case 'medio':
      return 'rgba(47, 214, 114, 0.6)';
    case 'neutro':
      return 'var(--text-dim)';
    case 'bajo':
      return 'var(--orange)';
  }
}

/** Etiqueta corta del tier, para leyendas. */
export function tierLabel(pct: number): string {
  switch (tier(pct)) {
    case 'alto':
      return 'Elite';
    case 'medio':
      return 'Muy bueno';
    case 'neutro':
      return 'Promedio';
    case 'bajo':
      return 'Flojo';
  }
}
