import { Link } from 'react-router-dom';
import { ChevronRight, Flag, Trophy } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { useF1Next, useMatches } from '../hooks/useData';
import { diasHasta, hoyArg } from '../lib/time';
import styles from './HomePage.module.css';

export default function HomePage() {
  const matches = useMatches();
  const proxima = useF1Next();

  // Teaser de fútbol: en vivo / partidos de hoy
  const hoy = hoyArg();
  const data = matches.data ?? [];
  const enVivo = data.filter((m) => m.estado === 'en_vivo' || m.estado === 'entretiempo').length;
  const hoyN = data.filter((m) => m.fecha === hoy).length;
  const teaserFutbol = enVivo > 0
    ? `${enVivo} en vivo ahora`
    : hoyN > 0
      ? `${hoyN} partidos hoy`
      : 'Fixture, grupos y eliminatoria';

  // Teaser de F1: próximo GP
  const gp = proxima.data;
  const dias = gp?.fecha ? diasHasta(gp.fecha) : null;
  const teaserF1 = gp
    ? dias === 0
      ? `${gp.gp} · ¡es hoy!`
      : dias && dias > 0
        ? `${gp.gp} · faltan ${dias} días`
        : gp.gp
    : 'Calendario, resultados y equipos';

  return (
    <div className={`container ${styles.home}`}>
      <header className={`${styles.hero} texture`}>
        <div className={styles.logoBig}>
          <Logo />
        </div>
        <p className={styles.tagline}>Fanáticos del deporte.</p>
      </header>

      <div className={styles.portales}>
        <Link to="/futbol" className={`${styles.portal} ${styles.futbol}`}>
          <Trophy className={styles.icono} aria-hidden="true" />
          <span className="kicker">Fútbol</span>
          <h2 className={styles.titulo}>Copa Mundial 2026</h2>
          <p className={styles.teaser}>
            {enVivo > 0 && <span className={styles.vivo} />}
            {teaserFutbol}
          </p>
          <span className={styles.entrar}>
            Entrar <ChevronRight size={16} aria-hidden="true" />
          </span>
        </Link>

        <Link to="/f1" className={`${styles.portal} ${styles.f1}`}>
          <Flag className={styles.icono} aria-hidden="true" />
          <span className="kicker">Fórmula 1</span>
          <h2 className={styles.titulo}>Temporada 2026</h2>
          <p className={styles.teaser}>{teaserF1}</p>
          <span className={styles.entrar}>
            Entrar <ChevronRight size={16} aria-hidden="true" />
          </span>
        </Link>
      </div>
    </div>
  );
}
