import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  Clock,
  Copy,
  ExternalLink,
  Flag,
  Gauge,
  Home,
  LogOut,
  Search,
  ShieldCheck,
  Trophy,
  Tv,
} from 'lucide-react';
import { EditablePost } from '../components/content/EditablePost';
import { useAdmin } from '../contexts/AdminContext';
import { useMatches, useMatchDetail, useF1Next, useF1Last, useF1Race } from '../hooks/useData';
import {
  largoX,
  LIMITE_X,
  postAgenda,
  postHorarioF1,
  postPoleF1,
  postProximaF1,
  postResultadoCompleto,
  postResultadoF1,
  postResultadoF1Completo,
} from '../lib/social';
import { formatFecha, hoyArg } from '../lib/time';
import { Logo } from '../components/ui/Logo';
import styles from './AdminPage.module.css';

// ── Vista previa estilo X, con contador de caracteres ─────────────────────────

function XPreviewCard({ label, texto, momento }: { label: string; texto: string; momento?: string }) {
  const [copiado, setCopiado] = useState(false);
  const largo = largoX(texto);
  const sobrepasado = largo > LIMITE_X;
  const cerca = !sobrepasado && largo > LIMITE_X - 20;

  async function copiar() {
    await navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2200);
  }

  return (
    <div className={styles.xCard}>
      <div className={styles.xCardLabel}>
        <span>{label}</span>
        {momento && <span className={styles.xCardMomento}>{momento}</span>}
      </div>

      <div className={styles.xBody}>
        <div className={styles.xAvatar}>FS</div>
        <div className={styles.xContenido}>
          <div className={styles.xHeader}>
            <span className={styles.xNombre}>FSports</span>
            <span className={styles.xHandle}>@oficialfsports</span>
          </div>
          <p className={styles.xTexto}>{texto}</p>
        </div>
      </div>

      <div className={styles.xFooter}>
        <span
          className={`${styles.xContador} ${sobrepasado ? styles.xContadorOver : cerca ? styles.xContadorCerca : ''}`}
        >
          {largo} / {LIMITE_X}
        </span>
        <button
          type="button"
          className={`${styles.copiarBtn} ${copiado ? styles.copiadoOk : ''}`}
          onClick={copiar}
        >
          {copiado ? (
            <><CheckCircle size={13} /> Copiado!</>
          ) : (
            <><Copy size={13} /> Copiar</>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Placeholder para herramientas que todavía no tienen datos ────────────────

function ProximamenteCard({ titulo, detalle }: { titulo: string; detalle: string }) {
  return (
    <div className={styles.proximamente}>
      <Clock size={15} className={styles.proximamenteIcono} aria-hidden="true" />
      <div>
        <p className={styles.proximamenteTitulo}>{titulo}</p>
        <p className={styles.proximamenteDetalle}>{detalle}</p>
      </div>
    </div>
  );
}

// ── Sección por categoría (Fútbol / F1), con encabezado propio ───────────────

function Categoria({ icono, titulo, children }: { icono: ReactNode; titulo: string; children: ReactNode }) {
  return (
    <section className={styles.categoria}>
      <h2 className={styles.categoriaTitulo}>
        {icono}
        {titulo}
      </h2>
      <div className={styles.categoriaBody}>{children}</div>
    </section>
  );
}

// ── Scout Intelligence: listado de todos los informes ya generados ───────────

interface ReporteAdmin {
  id: string;
  player_name: string;
  locale: string;
  created_at: string;
}

function ScoutReportes() {
  const [reportes, setReportes] = useState<ReporteAdmin[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/scout/admin/reports')
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d: { reports: ReporteAdmin[] }) => setReportes(d.reports))
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <ProximamenteCard
        titulo="Informes generados"
        detalle="No se pudo cargar el listado. En desarrollo local la sesión admin es simulada (sin cookie real); probá en producción."
      />
    );
  }
  if (!reportes) return <p className={styles.empty}>Cargando informes...</p>;
  if (reportes.length === 0) {
    return <p className={styles.empty}>Todavía no se generó ningún informe.</p>;
  }

  return (
    <ul className={styles.reportesLista}>
      {reportes.map((r) => (
        <li key={r.id} className={styles.reporteRow}>
          <div className={styles.reporteInfo}>
            <span className={styles.reporteNombre}>{r.player_name}</span>
            <span className={styles.reporteMeta}>
              {r.locale.toUpperCase()} ·{' '}
              {new Date(`${r.created_at.replace(' ', 'T')}Z`).toLocaleString('es-AR', {
                dateStyle: 'short',
                timeStyle: 'short',
              })}
            </span>
          </div>
          <a
            href={`/r/${r.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.reporteLink}
          >
            Ver <ExternalLink size={12} aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  );
}

// ── Resultado de partido: marcador + goleadores automáticos, comentario editable ──

function ResultadoTool({ matchId }: { matchId: string }) {
  const query = useMatchDetail(matchId);
  if (query.isPending || !query.data) return null;
  const m = query.data;
  return (
    <EditablePost
      titulo={`${m.local} ${m.golesLocal ?? 0}-${m.golesVisitante ?? 0} ${m.visitante}`}
      texto={postResultadoCompleto(m)}
    />
  );
}

// ── Dashboard (vista autenticada) ─────────────────────────────────────────────

function Dashboard() {
  const { logout } = useAdmin();
  const matches = useMatches();
  const proxima = useF1Next();
  const ultima = useF1Last();
  const raceFull = useF1Race(proxima.data?.ronda ?? null);
  const hoy = hoyArg();

  const matchesHoy = (matches.data ?? []).filter((m) => m.fecha === hoy);
  const finalizadosHoy = matchesHoy.filter((m) => m.estado === 'finalizado');
  const agendaPost = matchesHoy.length > 0 ? postAgenda(matchesHoy) : null;

  const previaF1Post = proxima.data ? postProximaF1(proxima.data) : null;
  const horarioF1Post = proxima.data?.horarios?.length ? postHorarioF1(proxima.data) : null;
  const poleF1Post = raceFull.data?.pole ? postPoleF1(raceFull.data) : null;
  const resultadoF1CompletoPost =
    raceFull.data && raceFull.data.resultados.length > 0 ? postResultadoF1Completo(raceFull.data) : null;
  const resultadoF1Post = ultima.data ? postResultadoF1(ultima.data) : null;

  const sesionQuali = proxima.data?.horarios?.find((s) => s.tipo === 'Clasificación');
  const sesionCarrera = proxima.data?.horarios?.find((s) => s.tipo === 'Carrera');

  const cargando = matches.isPending || proxima.isPending || ultima.isPending;

  return (
    <div className={styles.dashboard}>
      {/* Header del panel */}
      <header className={styles.dashHeader}>
        <div className={styles.dashBrand}>
          <Logo />
          <div className={styles.dashTitulo}>
            <span className={styles.dashKicker}>Panel de administración</span>
            <div className={styles.dashBadge}>
              <ShieldCheck size={11} />
              Admin
            </div>
          </div>
        </div>
        <button type="button" className={styles.logoutBtn} onClick={logout}>
          <LogOut size={14} />
          Cerrar sesión
        </button>
      </header>

      {/* Nav rápida al sitio */}
      <nav className={styles.siteNav}>
        <Link to="/" className={styles.siteNavLink}><Home size={13} />Inicio</Link>
        <Link to="/futbol" className={styles.siteNavLink}><Flag size={13} />Fútbol</Link>
        <Link to="/f1" className={styles.siteNavLink}><Tv size={13} />Fórmula 1</Link>
        <Link to="/contenido" className={styles.siteNavLink}><Copy size={13} />Contenido</Link>
        <Link to="/scout" className={styles.siteNavLink}><Search size={13} />Scout</Link>
      </nav>

      {/* Contenido */}
      <div className={styles.content}>
        {cargando ? (
          <p className={styles.empty}>Cargando datos...</p>
        ) : (
          <>
            {/* ── FÚTBOL ── */}
            <Categoria icono={<Trophy size={14} aria-hidden="true" />} titulo="Fútbol">
              {agendaPost ? (
                <XPreviewCard label={`Agenda del día · ${matchesHoy.length} partido${matchesHoy.length !== 1 ? 's' : ''}`} texto={agendaPost} />
              ) : (
                <ProximamenteCard
                  titulo="Agenda del día"
                  detalle="Se habilita automáticamente cuando hay partidos programados para hoy."
                />
              )}

              {finalizadosHoy.length > 0 && finalizadosHoy.map((m) => (
                <ResultadoTool key={m.id} matchId={m.id} />
              ))}
            </Categoria>

            {/* ── FÓRMULA 1 ── */}
            <Categoria icono={<Gauge size={14} aria-hidden="true" />} titulo="Fórmula 1">
              {previaF1Post && (
                <XPreviewCard label={`Previa · ${proxima.data?.gp}`} texto={previaF1Post} />
              )}

              {horarioF1Post && (
                <XPreviewCard label={`Horarios del finde · ${proxima.data?.gp}`} texto={horarioF1Post} />
              )}

              {poleF1Post ? (
                <XPreviewCard label={`Pole position · ${raceFull.data?.gp}`} texto={poleF1Post} />
              ) : sesionQuali ? (
                <ProximamenteCard
                  titulo="Pole position"
                  detalle={`Se habilita después de la clasificación · ${formatFecha(sesionQuali.fecha)}, ${sesionQuali.hora}hs`}
                />
              ) : null}

              {resultadoF1CompletoPost ? (
                <section className={styles.subseccion}>
                  <h3 className={styles.subseccionTitle}>Resultado de carrera</h3>
                  <EditablePost
                    titulo={`Resultado · ${raceFull.data?.gp}`}
                    texto={resultadoF1CompletoPost}
                  />
                </section>
              ) : sesionCarrera ? (
                <ProximamenteCard
                  titulo="Resultado de carrera (completo)"
                  detalle={`Se habilita después de la carrera · ${formatFecha(sesionCarrera.fecha)}, ${sesionCarrera.hora}hs`}
                />
              ) : null}

              {resultadoF1Post && (
                <XPreviewCard label={`Resultado (resumen) · ${ultima.data?.gp}`} texto={resultadoF1Post} />
              )}
            </Categoria>

            {/* ── SCOUT INTELLIGENCE ── */}
            <Categoria icono={<Search size={14} aria-hidden="true" />} titulo="Scout Intelligence">
              <ScoutReportes />
            </Categoria>
          </>
        )}
      </div>
    </div>
  );
}

// ── Formulario de login ───────────────────────────────────────────────────────

function LoginForm() {
  const { login } = useAdmin();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const ok = await login(pin);
    if (!ok) {
      setError(true);
      setPin('');
    }
    setLoading(false);
  }

  return (
    <div className={styles.loginWrap}>
      <div className={styles.loginCard}>
        <div className={styles.loginLogo}>
          <Logo />
        </div>
        <p className={styles.loginKicker}>Acceso restringido</p>

        <form className={styles.loginForm} onSubmit={handleSubmit}>
          <input
            className={`${styles.pinInput} ${error ? styles.pinError : ''}`}
            type="password"
            inputMode="numeric"
            placeholder="••••••"
            value={pin}
            onChange={(e) => { setPin(e.target.value); setError(false); }}
            maxLength={12}
            autoFocus
            autoComplete="current-password"
          />
          {error && <p className={styles.errorMsg}>PIN incorrecto. Intentá de nuevo.</p>}
          <button
            className={styles.loginBtn}
            type="submit"
            disabled={loading || pin.length === 0}
          >
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const { isAdmin, loadingAuth } = useAdmin();

  if (loadingAuth) return null;

  return isAdmin ? <Dashboard /> : <LoginForm />;
}
