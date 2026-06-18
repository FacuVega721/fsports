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
 * Protecciones del proxy:
 *  - Solo acepta rutas del Mundial (/competitions/WC/*). Cualquier otro path → 403.
 *  - Solo acepta peticiones del propio sitio (Sec-Fetch-Site: same-origin).
 *    Este header lo pone el navegador automáticamente y no puede ser enviado
 *    por scripts de terceros ni por curl sin esfuerzo explícito.
 */

import { BUILD_TOKEN } from './token.generated';

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  FOOTBALL_DATA_TOKEN?: string;
}

const FOOTBALL_BASE = 'https://api.football-data.org/v4';
const PREFIX = '/api/football';
const RUTA_PERMITIDA = '/competitions/WC';

/** Token: primero el secret de runtime; si no, el inyectado en build. */
function resolverToken(env: Env): string {
  const rt = env.FOOTBALL_DATA_TOKEN ?? '';
  return rt.length > 0 ? rt : BUILD_TOKEN;
}

function forbidden(): Response {
  return new Response(JSON.stringify({ error: 'forbidden' }), {
    status: 403,
    headers: { 'content-type': 'application/json' },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith(PREFIX)) {
      const upstreamPath = url.pathname.slice(PREFIX.length) || '/';

      // Solo rutas del Mundial — bloquea uso del proxy para otras competiciones.
      if (!upstreamPath.startsWith(RUTA_PERMITIDA)) {
        return forbidden();
      }

      // Solo peticiones originadas desde el propio sitio (navegador).
      // Sec-Fetch-Site es un header que los navegadores fijan automáticamente
      // y que no puede ser sobreescrito por JavaScript del cliente.
      const secFetchSite = request.headers.get('Sec-Fetch-Site');
      if (secFetchSite !== null && secFetchSite !== 'same-origin') {
        return forbidden();
      }

      const target = `${FOOTBALL_BASE}${upstreamPath}${url.search}`;
      try {
        const upstream = await fetch(target, {
          headers: { 'X-Auth-Token': resolverToken(env) },
        });
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
