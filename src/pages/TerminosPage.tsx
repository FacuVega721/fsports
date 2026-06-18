import { Link } from 'react-router-dom';
import styles from './TerminosPage.module.css';

export default function TerminosPage() {
  return (
    <div className={`container ${styles.pagina}`}>
      <Link to="/" className={styles.volver}>← Volver al inicio</Link>
      <article className={styles.articulo}>
        <header className={styles.cabecera}>
          <span className="kicker">Legal</span>
          <h1>Términos y condiciones</h1>
        </header>

        <div className={styles.seccion}>
          <h2>1. Naturaleza del sitio</h2>
          <p>
            FSports es un sitio de información deportiva creado por fanáticos del deporte,
            sin fines comerciales, publicitarios ni de apuestas. El contenido está destinado
            exclusivamente al entretenimiento e información personal de sus visitantes.
            FSports no tiene afiliación oficial con ninguna federación, liga, equipo ni
            organización deportiva.
          </p>
        </div>

        <div className={styles.seccion}>
          <h2>2. Exactitud de la información</h2>
          <p>
            Los datos que se muestran en este sitio (resultados, fixtures, standings,
            estadísticas, calendarios) se obtienen de fuentes externas a través de APIs
            públicas y pueden presentar demoras, inconsistencias o errores. FSports no
            garantiza la exactitud, completitud ni actualización en tiempo real de ningún
            dato publicado. No se debe tomar ninguna decisión basada exclusivamente en la
            información disponible en este sitio.
          </p>
        </div>

        <div className={styles.seccion}>
          <h2>3. Fuentes de datos</h2>
          <p>
            Los datos de fútbol son provistos por{' '}
            <a
              href="https://www.football-data.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              football-data.org
            </a>
            , sujetos a sus propios términos de uso. Los datos de Fórmula 1 son provistos
            por{' '}
            <a
              href="https://jolpi.ca"
              target="_blank"
              rel="noopener noreferrer"
            >
              Jolpica-F1
            </a>
            , API pública sin restricción de uso. FSports utiliza estas fuentes respetando
            sus condiciones de servicio.
          </p>
        </div>

        <div className={styles.seccion}>
          <h2>4. Propiedad intelectual</h2>
          <p>
            Los nombres, logotipos, marcas y denominaciones de competiciones deportivas
            (Copa Mundial FIFA, Fórmula 1, entre otras) son propiedad exclusiva de sus
            respectivos titulares. Su mención en este sitio tiene fines únicamente
            informativos y no implica ningún tipo de patrocinio, endorsement ni relación
            comercial.
          </p>
        </div>

        <div className={styles.seccion}>
          <h2>5. Uso personal</h2>
          <p>
            El contenido de FSports es de uso personal e intransferible. Queda prohibida
            la reproducción, distribución o uso comercial del contenido sin autorización
            expresa. El uso del sitio implica la aceptación de estos términos.
          </p>
        </div>

        <div className={styles.seccion}>
          <h2>6. Exoneración de responsabilidad</h2>
          <p>
            FSports no se responsabiliza por daños o perjuicios derivados del uso o la
            imposibilidad de uso del sitio, ni por la exactitud de la información provista.
            El servicio se ofrece "tal como está", sin garantías de ningún tipo.
          </p>
        </div>

        <div className={styles.seccion}>
          <h2>7. Cambios y contacto</h2>
          <p>
            Estos términos pueden actualizarse en cualquier momento. Para consultas o
            reportes, podés contactarnos a través de nuestras redes sociales{' '}
            <strong>@oficialfsports</strong>.
          </p>
        </div>
      </article>
    </div>
  );
}
