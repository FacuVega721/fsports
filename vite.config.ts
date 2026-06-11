import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Directorio de este archivo (la carpeta del proyecto), para leer .env.local
// sin depender de desde dónde se ejecute el dev server.
const projectDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(({ mode }) => {
  // Token solo para el proxy de desarrollo (sale de .env.local, no del bundle).
  const env = loadEnv(mode, projectDir, '');
  const token = env.VITE_FOOTBALL_DATA_TOKEN ?? '';

  return {
    // Proxy de desarrollo: el cliente pega a /api/football (mismo origen) y
    // Vite reenvía a football-data.org agregando el token. Espeja lo que hace
    // el Worker en producción, así no hay problemas de CORS en local.
    server: {
      proxy: {
        '/api/football': {
          target: 'https://api.football-data.org/v4',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/football/, ''),
          headers: token ? { 'X-Auth-Token': token } : undefined,
        },
      },
    },
    plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'FSports',
        short_name: 'FSports',
        description: 'Fútbol y Fórmula 1, con otro estilo. Resultados al instante, con el sello de FSports.',
        lang: 'es',
        theme_color: '#0A0A0A',
        background_color: '#0A0A0A',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
    ],
  };
});
