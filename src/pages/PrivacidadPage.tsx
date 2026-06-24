import { Link } from 'react-router-dom';
import { useSeo } from '../hooks/useSeo';
import styles from './TerminosPage.module.css';

export default function PrivacidadPage() {
  useSeo(
    'Política de privacidad',
    'Política de privacidad de FSports.',
    '/privacidad',
  );
  return (
    <div className={`container ${styles.pagina}`}>
      <Link to="/" className={styles.volver}>← Volver al inicio</Link>
      <article className={styles.articulo}>
        <header className={styles.cabecera}>
          <span className="kicker">Legal</span>
          <h1>Política de privacidad</h1>
        </header>

        <div className={styles.seccion}>
          <h2>1. Datos personales</h2>
          <p>
            FSports no solicita registro de usuarios, no pide email, ni recolecta datos
            personales de ningún tipo. No hay formularios de contacto ni newsletters. Las
            novedades del sitio se anuncian exclusivamente a través de nuestras redes
            sociales.
          </p>
        </div>

        <div className={styles.seccion}>
          <h2>2. Aplicación instalable (PWA) y almacenamiento local</h2>
          <p>
            FSports puede instalarse como aplicación (PWA). Para esto, el navegador guarda
            en el dispositivo una copia local de los archivos estáticos del sitio (íconos,
            estilos, código) mediante un service worker, para que cargue más rápido y
            funcione offline. Este almacenamiento es técnico, vive solo en tu dispositivo,
            y no se comparte con FSports ni con terceros.
          </p>
        </div>

        <div className={styles.seccion}>
          <h2>3. Cookies</h2>
          <p>
            FSports no usa cookies de seguimiento ni de publicidad. La única cookie que
            existe es técnica y de acceso restringido al panel de administración interno
            del sitio (protegida, de uso exclusivo del equipo de FSports); los visitantes
            no la reciben ni la necesitan para usar el sitio.
          </p>
        </div>

        <div className={styles.seccion}>
          <h2>4. Fuentes de datos externas</h2>
          <p>
            Los resultados y estadísticas que se muestran provienen de APIs públicas de
            terceros (football-data.org para fútbol, Jolpica-F1 para Fórmula 1). FSports
            actúa como intermediario para mostrar esa información; no se envían datos
            personales del visitante a estos servicios al navegar el sitio.
          </p>
        </div>

        <div className={styles.seccion}>
          <h2>5. Terceros y publicidad</h2>
          <p>
            FSports no utiliza herramientas de analítica de terceros (como Google Analytics)
            ni redes de publicidad. No compartimos información con nadie porque, simplemente,
            no la recolectamos.
          </p>
        </div>

        <div className={styles.seccion}>
          <h2>6. Cambios y contacto</h2>
          <p>
            Esta política puede actualizarse si el sitio incorpora nuevas funciones que
            impliquen el tratamiento de datos. Para consultas, podés contactarnos a través
            de nuestras redes sociales <strong>@oficialfsports</strong>.
          </p>
        </div>
      </article>
    </div>
  );
}
