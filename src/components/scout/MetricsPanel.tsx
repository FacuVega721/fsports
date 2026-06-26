import { useState } from 'react';
import { Info } from 'lucide-react';
import { Flag } from '../ui/Flag';
import { codigoBandera, paisEspanol } from '../../lib/scout/banderas';
import styles from './MetricsPanel.module.css';

export interface PlayerProfile {
  kind: 'comp' | 'agg';
  name: string;
  position: string;
  positionGroup: string;
  team: string;
  nationality: string;
  age: number | null;
  competition: string;
  season: string;
  minutes: number;
  matches: number;
  per90: Record<string, number>;
  percentiles: Record<string, number>;
}

// Catálogo de métricas: clave → etiqueta, agrupadas por categoría. Espeja el
// formateador del Worker (worker/scout/format.ts).
const CATEGORIES: { title: string; keys: [string, string][] }[] = [
  {
    title: 'Ofensivas',
    keys: [
      ['goals', 'Goles'],
      ['xg', 'xG'],
      ['shots', 'Tiros'],
      ['assists', 'Asistencias'],
      ['xa', 'xA'],
      ['keyPasses', 'Pases clave'],
      ['dribblesCompleted', 'Regates'],
    ],
  },
  {
    title: 'Construcción',
    keys: [
      ['passesCompleted', 'Pases completados'],
      ['passAccuracy', '% acierto de pase'],
      ['progressivePassesProxy', 'Pases largos'],
    ],
  },
  {
    title: 'Defensivas',
    keys: [
      ['tackles', 'Entradas'],
      ['interceptions', 'Intercepciones'],
      ['recoveries', 'Recuperaciones'],
      ['pressures', 'Presiones'],
      ['clearances', 'Despejes'],
    ],
  },
];

// Definición de cada métrica (tooltip al pasar el mouse).
const METRIC_DESC: Record<string, string> = {
  goals: 'Goles marcados cada 90 minutos.',
  xg: 'Goles esperados (xG): calidad de las ocasiones de gol que genera, cada 90′.',
  shots: 'Remates al arco cada 90′.',
  assists: 'Asistencias (pase que termina en gol) cada 90′.',
  xa: 'Asistencias esperadas (xA): peligro que genera con el último pase, cada 90′.',
  keyPasses: 'Pases que terminan en un remate de un compañero, cada 90′.',
  dribblesCompleted: 'Regates exitosos (gambetas ganadas) cada 90′.',
  passesCompleted: 'Pases completados con éxito cada 90′.',
  passAccuracy: 'Porcentaje de pases que llegan a destino.',
  progressivePassesProxy: 'Pases largos (≥32 m) completados: aproximación a su juego de progresión, cada 90′.',
  tackles: 'Entradas / quites cada 90′.',
  interceptions: 'Intercepciones (cortar un pase rival) cada 90′.',
  recoveries: 'Recuperaciones de balón cada 90′.',
  pressures: 'Presiones sobre el rival con la pelota, cada 90′.',
  clearances: 'Despejes cada 90′.',
};

const GROUP_LABEL: Record<string, string> = {
  GK: 'arqueros',
  DEF: 'defensores',
  MID: 'mediocampistas',
  FWD: 'delanteros',
};

const LEYENDA_COLORES: { cls: keyof typeof TIER_CLASSES; label: string }[] = [
  { cls: 'alto', label: '80–100 · elite' },
  { cls: 'medio', label: '60–79 · muy bueno' },
  { cls: 'neutro', label: '40–59 · promedio' },
  { cls: 'bajo', label: '0–39 · flojo' },
];

const TIER_CLASSES = {
  alto: styles.alto,
  medio: styles.medio,
  neutro: styles.neutro,
  bajo: styles.bajo,
} as const;

function tier(pct: number): string {
  if (pct >= 80) return styles.alto;
  if (pct >= 60) return styles.medio;
  if (pct >= 40) return styles.neutro;
  return styles.bajo;
}

function valueLabel(key: string, v: number): string {
  if (key === 'passAccuracy') return `${v.toFixed(0)}%`;
  return v.toFixed(2);
}

export function MetricsPanel({ profile }: { profile: PlayerProfile }) {
  const grupo = GROUP_LABEL[profile.positionGroup] ?? 'su posición';
  const [guiaAbierta, setGuiaAbierta] = useState(false);
  return (
    <section className={styles.panel}>
      <div className={styles.identidad}>
        <Flag code={codigoBandera(profile.nationality)} title={paisEspanol(profile.nationality)} />
        <div>
          <span className={styles.nombre}>{profile.name}</span>
          <span className={styles.meta}>
            {paisEspanol(profile.nationality)} · {profile.position}
            {profile.age ? ` · ${profile.age} años` : ''}
          </span>
        </div>
      </div>
      <header className={styles.cabecera}>
        <div className={styles.cabeceraFila}>
          <h3>Perfil estadístico {profile.kind === 'agg' ? '· Histórico' : `· ${profile.competition} ${profile.season}`}</h3>
          <button
            type="button"
            className={styles.guiaToggle}
            onClick={() => setGuiaAbierta((v) => !v)}
            aria-expanded={guiaAbierta}
          >
            <Info size={13} aria-hidden="true" />
            Referencias
          </button>
        </div>
        <p>
          Muestra: {Math.round(profile.minutes)}′ en {profile.matches} partidos
          {profile.kind === 'agg' ? ` (${profile.season})` : ` · ${profile.competition} ${profile.season}`}
        </p>
      </header>

      {/* Guía de lectura: qué es cada número y cada color (colapsada por defecto) */}
      {guiaAbierta && (
        <div className={styles.guia}>
          <p>
            Cada métrica muestra el valor <strong>por 90 minutos</strong> del jugador y
            su <strong>percentil</strong> (0–100) frente a los demás {grupo}{' '}
            {profile.kind === 'agg'
              ? 'de los torneos internacionales recientes'
              : `de ${profile.competition} ${profile.season}`}
            . Por ejemplo, un percentil de 90 significa que rinde mejor que el 90% de
            los {grupo} en esa métrica. La barra y su color reflejan ese percentil.
          </p>
          <ul className={styles.leyendaColores}>
            {LEYENDA_COLORES.map((l) => (
              <li key={l.label}>
                <span className={`${styles.swatch} ${TIER_CLASSES[l.cls]}`} />
                {l.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Encabezados de columna */}
      <div className={styles.colHeaders}>
        <span>Métrica</span>
        <span className={styles.colBar}>Percentil vs. {grupo}</span>
        <span className={styles.colVal}>por 90′</span>
        <span className={styles.colPct}>Pct</span>
      </div>

      {CATEGORIES.map((cat) => {
        const rows = cat.keys.filter(([k]) => profile.per90[k] !== undefined);
        if (rows.length === 0) return null;
        return (
          <div key={cat.title} className={styles.categoria}>
            <span className={styles.catTitulo}>{cat.title}</span>
            <ul className={styles.metricas}>
              {rows.map(([key, label]) => {
                const pct = profile.percentiles[key] ?? 0;
                return (
                  <li key={key} className={styles.metrica}>
                    <span className={styles.etiqueta} title={METRIC_DESC[key] ?? ''}>
                      {label}
                    </span>
                    <div className={styles.barra}>
                      <div
                        className={`${styles.relleno} ${tier(pct)}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className={styles.valor} title="Valor por 90 minutos">
                      {valueLabel(key, profile.per90[key])}
                    </span>
                    <span className={styles.pct} title="Percentil (0–100)">{pct}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </section>
  );
}
