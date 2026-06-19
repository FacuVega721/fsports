/**
 * Worker de FSports.
 *
 * Hace tres cosas:
 *  1) Sirve el sitio estático (la carpeta dist/ vía el binding ASSETS).
 *  2) Actúa de PROXY para football-data.org en la ruta /api/football/*.
 *     El navegador no puede llamar a football-data.org directamente (CORS),
 *     así que el cliente llama a /api/football/... (mismo origen) y el Worker
 *     reenvía la petición agregando el token DESDE EL SERVIDOR. El token nunca
 *     se expone en el navegador ni en el bundle.
 *  3) Autenticación de admin en /admin/login, /admin/verify, /admin/logout.
 *     El PIN se valida contra la variable ADMIN_PIN (nunca en el bundle);
 *     el secreto de firma HMAC vive en ADMIN_SECRET.
 *
 * Protecciones del proxy:
 *  - Solo acepta rutas del Mundial (/competitions/WC/*). Cualquier otro path → 403.
 *  - Solo acepta peticiones del propio sitio (Sec-Fetch-Site: same-origin).
 */

import { BUILD_TOKEN } from './token.generated';

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  FOOTBALL_DATA_TOKEN?: string;
  ADMIN_PIN?: string;
  ADMIN_SECRET?: string;
}

const FOOTBALL_BASE = 'https://api.football-data.org/v4';
const PREFIX = '/api/football';
const RUTA_PERMITIDA = '/competitions/WC';

const ADMIN_COOKIE = 'fsports_admin';
const TOKEN_EXPIRY_MS = 8 * 60 * 60 * 1000; // 8 horas

// ── Helpers de token HMAC ─────────────────────────────────────────────────────

async function hmacHex(secret: string, msg: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(msg));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function crearToken(secret: string): Promise<string> {
  const ts = Date.now().toString();
  const sig = await hmacHex(secret, ts);
  return `${ts}.${sig}`;
}

async function verificarToken(token: string, secret: string): Promise<boolean> {
  const dot = token.indexOf('.');
  if (dot === -1) return false;
  const ts = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const age = Date.now() - parseInt(ts, 10);
  if (isNaN(age) || age > TOKEN_EXPIRY_MS || age < 0) return false;
  const expected = await hmacHex(secret, ts);
  return sig === expected;
}

function getCookie(request: Request, name: string): string | null {
  const header = request.headers.get('Cookie') ?? '';
  const re = new RegExp(`(?:^|;\\s*)${name}=([^;]+)`);
  const m = header.match(re);
  return m ? decodeURIComponent(m[1]) : null;
}

// ── Helpers genéricos ─────────────────────────────────────────────────────────

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function forbidden(): Response {
  return jsonResponse({ error: 'forbidden' }, 403);
}

/** Token: primero el secret de runtime; si no, el inyectado en build. */
function resolverToken(env: Env): string {
  const rt = env.FOOTBALL_DATA_TOKEN ?? '';
  return rt.length > 0 ? rt : BUILD_TOKEN;
}

// ── Handler principal ─────────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname, method } = { pathname: url.pathname, method: request.method };

    // ── 1) Proxy football-data.org ────────────────────────────────────────────
    if (pathname.startsWith(PREFIX)) {
      const upstreamPath = pathname.slice(PREFIX.length) || '/';

      if (!upstreamPath.startsWith(RUTA_PERMITIDA)) return forbidden();

      const secFetchSite = request.headers.get('Sec-Fetch-Site');
      if (secFetchSite !== null && secFetchSite !== 'same-origin') return forbidden();

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
        return jsonResponse({ error: 'proxy_failed' }, 502);
      }
    }

    // ── 2) Admin: login ───────────────────────────────────────────────────────
    if (pathname === '/admin/login' && method === 'POST') {
      const pin = env.ADMIN_PIN ?? '';
      const secret = env.ADMIN_SECRET ?? '';
      if (!pin || !secret) return jsonResponse({ ok: false, error: 'not_configured' }, 503);

      let body: { pin?: string } = {};
      try {
        body = (await request.json()) as { pin?: string };
      } catch { /* body vacío */ }

      if (!body.pin || body.pin !== pin) {
        return jsonResponse({ ok: false }, 401);
      }

      const token = await crearToken(secret);
      return new Response(JSON.stringify({ ok: true }), {
        headers: {
          'content-type': 'application/json',
          'set-cookie': `${ADMIN_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`,
        },
      });
    }

    // ── 3) Admin: verify ──────────────────────────────────────────────────────
    if (pathname === '/admin/verify' && method === 'GET') {
      const secret = env.ADMIN_SECRET ?? '';
      if (!secret) return jsonResponse({ ok: false });
      const raw = getCookie(request, ADMIN_COOKIE);
      if (!raw) return jsonResponse({ ok: false });
      const ok = await verificarToken(decodeURIComponent(raw), secret);
      return jsonResponse({ ok });
    }

    // ── 4) Admin: logout ──────────────────────────────────────────────────────
    if (pathname === '/admin/logout' && method === 'POST') {
      return new Response(JSON.stringify({ ok: true }), {
        headers: {
          'content-type': 'application/json',
          'set-cookie': `${ADMIN_COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`,
        },
      });
    }

    // ── 5) Sitio estático (SPA fallback) ──────────────────────────────────────
    return env.ASSETS.fetch(request);
  },
};
