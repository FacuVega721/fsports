import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSeo } from '../hooks/useSeo';
import { ReportView } from '../components/scout/ReportView';
import { MetricsPanel, type PlayerProfile } from '../components/scout/MetricsPanel';
import styles from './ReportPage.module.css';

interface SavedReport {
  id: string;
  player_name: string;
  locale: string;
  content: string;
  created_at: string;
  profile?: PlayerProfile | null;
}

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<SavedReport | null>(null);
  const [estado, setEstado] = useState<'cargando' | 'ok' | 'error'>('cargando');

  useSeo(
    report ? `Informe de scouting · ${report.player_name}` : 'Informe de scouting',
    report
      ? `Informe de scouting con IA de ${report.player_name}, generado por FSports Scout Intelligence.`
      : 'Informe de scouting de jugador generado con IA por FSports Scout Intelligence.',
    `/r/${id ?? ''}`,
  );

  useEffect(() => {
    if (!id) return;
    fetch(`/api/scout/r/${id}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: SavedReport) => {
        setReport(data);
        setEstado('ok');
      })
      .catch(() => setEstado('error'));
  }, [id]);

  return (
    <div className={`container ${styles.pagina}`}>
      <div className={styles.cabecera}>
        <span className="kicker">FSports Scout Intelligence</span>
        <Link to="/scout" className={styles.volver}>
          ← Generar otro informe
        </Link>
      </div>

      {estado === 'cargando' && <p className={styles.estado}>Cargando informe…</p>}
      {estado === 'error' && (
        <p className={styles.estado}>
          No encontramos este informe. Puede haber expirado o el enlace ser inválido.
        </p>
      )}
      {estado === 'ok' && report && (
        <>
          {report.profile && <MetricsPanel profile={report.profile} />}
          <ReportView markdown={report.content} />
        </>
      )}
    </div>
  );
}
