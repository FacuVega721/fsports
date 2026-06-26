import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { AdminProvider } from './contexts/AdminContext';
import { TimezoneProvider } from './contexts/TimezoneContext';
import AdminPage from './pages/AdminPage';
import ContentPage from './pages/ContentPage';
import F1Page from './pages/F1Page';
import FootballPage from './pages/FootballPage';
import HomePage from './pages/HomePage';
import LinksPage from './pages/LinksPage';
import MatchPage from './pages/MatchPage';
import PrivacidadPage from './pages/PrivacidadPage';
import ReportPage from './pages/ReportPage';
import ScoutPage from './pages/ScoutPage';
import TerminosPage from './pages/TerminosPage';

/** Sube al tope y reproduce la transición de entrada al cambiar de ruta. */
function AnimatedRoutes() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div key={location.pathname} className="page-transition">
      <Routes location={location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/futbol" element={<FootballPage />} />
        <Route path="/f1" element={<F1Page />} />
        <Route path="/contenido" element={<ContentPage />} />
        <Route path="/futbol/partido/:id" element={<MatchPage />} />
        <Route path="/scout" element={<ScoutPage />} />
        <Route path="/r/:id" element={<ReportPage />} />
        <Route path="/terminos" element={<TerminosPage />} />
        <Route path="/privacidad" element={<PrivacidadPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/links" element={<LinksPage />} />
        {/* Cualquier ruta desconocida vuelve a la portada: nunca una página rota */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <TimezoneProvider>
      <AdminProvider>
        <Header />
        <ErrorBoundary>
          <AnimatedRoutes />
        </ErrorBoundary>
        <Footer />
      </AdminProvider>
    </TimezoneProvider>
  );
}
