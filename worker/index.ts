/**
 * Worker de FSports.
 *
 * Hace dos cosas:
 *  1) Sirve el sitio estático (la carpeta dist/ vía el binding ASSETS).
 *  2) Actúa de PROXY para football-data.org en la ruta /api/football/*.
 *     El navegador no puede llamar a football-data.org directamente (CORS),
 *     así que el cliente llama a /api/football/... (mismo origen) y el Worker
 *     reenvía la petición agregando el token DESDE EL SERVIDOR. El token nunca
 *     se expone en el navegador ni en el bundle.
 *
 * El token se configura como variable del Worker en Cloudflare:
 *   FOOTBALL_DATA_TOKEN
 */

import { BUILD_TOKEN } from './token.generated';

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  FOOTBALL_DATA_TOKEN?: string;
}

const FOOTBALL_BASE = 'https://api.football-data.org/v4';
const PREFIX = '/api/football';

/** Token: primero el secret de runtime; si no, el inyectado en build. */
function resolverToken(env: Env): string {
  const rt = env.FOOTBALL_DATA_TOKEN ?? '';
  return rt.length > 0 ? rt : BUILD_TOKEN;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith(PREFIX)) {
      const upstreamPath = url.pathname.slice(PREFIX.length) || '/';
      const target = `${FOOTBALL_BASE}${upstreamPath}${url.search}`;
      try {
        const upstream = await fetch(target, {
          headers: { 'X-Auth-Token': resolverToken(env) },
        });
        // Reenviamos el cuerpo y el status; cacheamos 60s (respeta el límite
        // de 10 req/min de football-data.org).
        return new Response(upstream.body, {
          status: upstream.status,
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'public, max-age=60',
          },
        });
      } catch {
        return new Response(JSON.stringify({ error: 'proxy_failed' }), {
          status: 502,
          headers: { 'content-type': 'application/json' },
        });
      }
    }

    // Cualquier otra ruta: servir el sitio estático (con fallback SPA).
    return env.ASSETS.fetch(request);
  },
};
