import { useState, useEffect } from 'react';
import { CalendarDays, ChevronRight, MapPin, Trophy, X } from 'lucide-react';
import type { NextRace, SesionF1 } from '../../lib/types';
import { enRango, formatFecha, formatRangoFechas } from '../../lib/time';
import { useHoraLocal } from '../../hooks/useHoraLocal';
import { CircuitoHistoriaPanel } from './CircuitoHistoria';
import { Flag } from '../ui/Flag';
import { LiveDot } from '../ui/LiveDot';
import styles from './NextRaceCard.module.css';

/* ── Countdown ── */
interface Cd { dias: number; horas: number; minutos: number; segundos: number; vencido: boolean }

function calcCd(fecha: string, hora: string): Cd {
  const [y, m, d] = fecha.split('-').map(Number);
  const [hh, mm] = hora.split(':').map(Number);
  const target = Date.UTC(y, m - 1, d, hh + 3, mm, 0);
  const diff = target - Date.now();
  if (diff <= 0) return { dias: 0, horas: 0, minutos: 0, segundos: 0, vencido: true };
  const s = Math.floor(diff / 1000);
  return { dias: Math.floor(s / 86400), horas: Math.floor((s % 86400) / 3600), minutos: Math.floor((s % 3600) / 60), segundos: s % 60, vencido: false };
}

function CountdownBadge({ fecha, hora }: { fecha: string; hora: string }) {
  const [cd, setCd] = useState(() => calcCd(fecha, hora));
  useEffect(() => {
    const id = setInterval(() => setCd(calcCd(fecha, hora)), 1000);
    return () => clearInterval(id);
  }, [fecha, hora]);
  if (cd.vencido) return null;
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <span className={styles.countdown}>
      Faltan{' '}
      {cd.dias > 0 && <><b>{cd.dias}</b><em>d</em>{' '}</>}
      <b>{pad(cd.horas)}</b><em>h</em>{' '}
      <b>{pad(cd.minutos)}</b><em>m</em>{' '}
      <b>{pad(cd.segundos)}</b><em>s</em>
    </span>
  );
}

/* ── Fila de sesión (FP1, Clasificación, Carrera...), con hora local ── */
function SesionFila({ sesion: s }: { sesion: SesionF1 }) {
  const local = useHoraLocal(s.fecha, s.hora);
  return (
    <li className={s.tipo === 'Carrera' ? styles.principal : undefined}>
      <span className={styles.sesionTipo}>{s.tipo}</span>
      <span className={styles.sesionFecha}>{formatFecha(local.fecha)}</span>
      <span className={styles.sesionHora}>{local.hora}</span>
    </li>
  );
}

/* ── Modal con el horario completo ── */
function NextRaceModal({ race, onClose }: { race: NextRace; onClose: () => void }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey); };
  }, [onClose]);

  const inicioFinde = race.horarios?.[0]?.fecha ?? race.fecha;
  const finFinde   = race.horarios?.[race.horarios.length - 1]?.fecha ?? race.fecha;
  const rango = race.horarios && race.horarios.length > 0
    ? formatRangoFechas(inicioFinde, finFinde)
    : formatFecha(race.fecha);

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label={`Detalle ${race.gp}`}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        <div className={styles.modalCabecera}>
          <div className={styles.modalTitulo}>
            <Flag code={race.code} title={race.gp} />
            <div>
              <span className="kicker">{race.ronda ? `Round ${race.ronda}` : 'Próximo GP'}</span>
              <h2 className={styles.modalGp}>{race.gp}</h2>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className={styles.modalMeta}>
          <span><MapPin size={12} aria-hidden="true" /> {race.circuito}</span>
          <span><CalendarDays size={12} aria-hidden="true" /> {rango}</span>
        </div>

        {race.pole && (
          <div className={styles.modalPole}>
            <Trophy size={14} className={styles.iconPole} aria-hidden="true" />
            <div>
              <span className={styles.dLabel}>Pole position</span>
              <span className={styles.dValor}>{race.pole.piloto} <span className={styles.dTiempo}>{race.pole.tiempo}</span></span>
            </div>
          </div>
        )}

        {race.horarios && race.horarios.length > 0 && (
          <ul className={styles.modalSesiones}>
            {race.horarios.map((s) => (
              <SesionFila key={s.tipo} sesion={s} />
            ))}
          </ul>
        )}

        {race.historiaCircuito && (
          <div className={styles.modalHistoria}>
            <span className="kicker">Historia del circuito</span>
            <CircuitoHistoriaPanel historia={race.historiaCircuito} palmares={race.palmares} />
          </div>
        )}

      </div>
    </div>
  );
}

/* ── Card compacta ── */
export function NextRaceCard({ race }: { race: NextRace }) {
  const [modalAbierto, setModalAbierto] = useState(false);

  const inicioFinde = race.horarios?.[0]?.fecha ?? race.fecha;
  const finFinde   = race.horarios?.[race.horarios.length - 1]?.fecha ?? race.fecha;
  const enCurso    = !!race.fecha && enRango(inicioFinde, race.fecha);
  const rango      = race.horarios && race.horarios.length > 0
    ? formatRangoFechas(inicioFinde, finFinde)
    : formatFecha(race.fecha);
  const kicker = enCurso ? 'GP en curso' : race.ronda ? `Round ${race.ronda}` : 'Próximo GP';

  return (
    <>
      <section
        className={`${styles.card} ${enCurso ? styles.cardVivo : ''} texture`}
        aria-label={`Próxima carrera: ${race.gp}`}
      >
        {/* Fila meta */}
        <div className={styles.metaRow}>
          {enCurso && <LiveDot />}
          <span className={styles.metaKicker}>{kicker}</span>
          <span className={styles.metaSep}>·</span>
          <MapPin size={11} className={styles.metaIcon} aria-hidden="true" />
          <span className={styles.metaTexto}>{race.circuito}</span>
          <span className={styles.metaSep}>·</span>
          <CalendarDays size={11} className={styles.metaIcon} aria-hidden="true" />
          <span className={styles.metaTexto}>{rango}</span>
        </div>

        {/* Nombre del GP */}
        <h2 className={styles.gp}>
          <Flag code={race.code} title={race.gp} />
          {race.gp}
        </h2>

        {/* Pie: countdown + botón */}
        <div className={styles.footerRow}>
          {enCurso
            ? <span className={styles.cuentaVivo}>En curso</span>
            : <CountdownBadge fecha={race.fecha} hora={race.hora} />
          }
          <button type="button" className={styles.verDetalleBtn} onClick={() => setModalAbierto(true)}>
            Ver detalle <ChevronRight size={12} aria-hidden="true" />
          </button>
        </div>
      </section>

      {modalAbierto && <NextRaceModal race={race} onClose={() => setModalAbierto(false)} />}
    </>
  );
}
