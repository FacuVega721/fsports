import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Copy, Flag, Home, LogOut, ShieldCheck, Tv } from 'lucide-react';
import { EditablePost } from '../components/content/EditablePost';
import { useAdmin } from '../contexts/AdminContext';
import { useMatches, useMatchDetail, useF1Next, useF1Last } from '../hooks/useData';
import { postAgenda, postProximaF1, postResultadoCompleto, postResultadoF1 } from '../lib/social';
import { hoyArg } from '../lib/time';
import { Logo } from '../components/ui/Logo';
import styles from './AdminPage.module.css';

// ── Botón de copiar con feedback visual ───────────────────────────────────────

function CopiarBloque({ label, texto }: { label: string; texto: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    await navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2200);
  }

  return (
    <div className={styles.tool}>
      <div className={styles.toolHeader}>
        <span className={styles.toolLabel}>{label}</span>
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
      <pre className={styles.preview}>{texto}</pre>
    </div>
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
  const hoy = hoyArg();

  const matchesHoy = (matches.data ?? []).filter((m) => m.fecha === hoy);
  const finalizadosHoy = matchesHoy.filter((m) => m.estado === 'finalizado');
  const agendaPost = matchesHoy.length > 0 ? postAgenda(matchesHoy) : null;
  const previaF1Post = proxima.data ? postProximaF1(proxima.data) : null;
  const resultadoF1Post = ultima.data ? postResultadoF1(ultima.data) : null;

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
      </nav>

      {/* Contenido */}
      <div className={styles.content}>

        {/* Posts para redes */}
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitle}>Posts para redes sociales</h2>

          {matches.isPending || proxima.isPending || ultima.isPending ? (
            <p className={styles.empty}>Cargando datos...</p>
          ) : (
            <>
              {agendaPost ? (
                <CopiarBloque
                  label={`Agenda del día · ${matchesHoy.length} partido${matchesHoy.length !== 1 ? 's' : ''}`}
                  texto={agendaPost}
                />
              ) : (
                <div className={styles.emptyTool}>
                  <p>Agenda del día</p>
                  <span>No hay partidos hoy.</span>
                </div>
              )}

              {previaF1Post && (
                <CopiarBloque
                  label={`Previa F1 · ${proxima.data?.gp}`}
                  texto={previaF1Post}
                />
              )}

              {resultadoF1Post && (
                <CopiarBloque
                  label={`Resultado F1 · ${ultima.data?.gp}`}
                  texto={resultadoF1Post}
                />
              )}
            </>
          )}
        </section>

        {/* Resultado de partido: marcador + goleadores automático, comentario editable */}
        {finalizadosHoy.length > 0 && (
          <section className={styles.seccion}>
            <h2 className={styles.seccionTitle}>Resultado de partido</h2>
            {finalizadosHoy.map((m) => (
              <ResultadoTool key={m.id} matchId={m.id} />
            ))}
          </section>
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
