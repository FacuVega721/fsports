import { Route, Routes } from 'react-router-dom';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import F1Page from './pages/F1Page';
import FootballPage from './pages/FootballPage';
import HomePage from './pages/HomePage';

export default function App() {
  return (
    <>
      <Header />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/futbol" element={<FootballPage />} />
          <Route path="/f1" element={<F1Page />} />
          {/* Cualquier ruta desconocida vuelve a la portada: nunca una página rota */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </ErrorBoundary>
      <Footer />
    </>
  );
}
