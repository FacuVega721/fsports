import { Route, Routes } from 'react-router-dom';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import F1Page from './pages/F1Page';
import FootballPage from './pages/FootballPage';

export default function App() {
  return (
    <>
      <Header />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<FootballPage />} />
          <Route path="/f1" element={<F1Page />} />
          {/* Cualquier ruta desconocida vuelve al fútbol: nunca una página rota */}
          <Route path="*" element={<FootballPage />} />
        </Routes>
      </ErrorBoundary>
      <Footer />
    </>
  );
}
