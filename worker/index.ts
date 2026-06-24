/**
 * Worker de FSports.
 *
 * Hace cuatro cosas:
 *  1) Sirve el sitio estático (la carpeta dist/ vía el binding ASSETS).
 *  2) Actúa de PROXY para football-data.org en la ruta /api/football/*.
 *     El navegador no puede llamar a football-data.org directamente (CORS),
 *     así que el cliente llama a /api/football/... (mismo origen) y el Worker
 *     reenvía la petición agregando el token DESDE EL SERVIDOR. El token nunca
 *     se expone en el navegador ni en el bundle.
 *  3) Autenticación de admin en /admin/login, /admin/verify, /admin/logout.
 *     El PIN se valida contra la variable ADMIN_PIN (nunca en el bundle);
 *     el secreto de firma HMAC vive en ADMIN_SECRET.
 *  4) Para crawlers (Google/Bing/redes sociales) reescribe el <title>/OG del
 *     HTML estático según la ruta, porque esos bots no ejecutan JavaScript y
 *     nunca verían los cambios que hace useSeo() del lado del cliente.
 *
 * Protecciones del proxy:
 *  - Solo acepta rutas del Mundial (/competitions/WC/*). Cualquier otro path → 403.
 *  - Solo acepta peticiones del propio sitio (Sec-Fetch-Site: same-origin).
 */

import { BUILD_TOKEN } from './token.generated';
import { ADMIN_PIN as BUILD_ADMIN_PIN, ADMIN_SECRET as BUILD_ADMIN_SECRET } from './admin.generated';

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  FOOTBALL_DATA_TOKEN?: string;
}

const FOOTBALL_BASE = 'https://api.football-data.org/v4';
const PREFIX = '/api/football';
// Rutas permitidas en el proxy: patrones exactos (no prefijos imprecisos).
const RUTAS_PERMITIDAS: RegExp[] = [
  /^\/competitions\/WC(\/[A-Za-z0-9]*)?$/,
  /^\/matches\/\d+(\/head2head)?$/,
];

const ADMIN_COOKIE = 'fsports_admin';
const TOKEN_EXPIRY_MS = 8 * 60 * 60 * 1000; // 8 horas

// ── SEO para bots: meta tags correctos por ruta sin ejecutar JS ───────────────
// Los crawlers de redes sociales (Twitterbot, facebookexternalhit, WhatsApp...)
// NO ejecutan JavaScript, así que nunca ven los <title>/OG que la SPA actualiza
// con useSeo(). Para esos bots (y para el primer pase, sin JS, de Google/Bing)
// el Worker reescribe el HTML estático con el meta correcto de cada ruta.

const BOT_UA = /bot|crawler|spider|facebookexternalhit|twitterbot|whatsapp|slackbot|discordbot|linkedinbot|telegrambot|embedly|quora link preview|pinterest|vkshare/i;

const RUTA_META: Record<string, { titulo: string; descripcion: string }> = {
  '/': {
    titulo: 'Mundial 2026 y Fórmula 1 en vivo',
    descripcion: 'Resultados, fixture y calendario del Mundial 2026 y la Fórmula 1, al instante y con otro estilo.',
  },
  '/futbol': {
    titulo: 'Mundial 2026 — Fixture, Grupos y Resultados',
    descripcion: 'Fixture completo, tabla de grupos, eliminatoria, goleadores y selecciones del Mundial 2026.',
  },
  '/f1': {
    titulo: 'Fórmula 1 — Calendario, Resultados y Campeonato',
    descripcion: 'Calendario de carreras, resultados, clasificación y campeonato de pilotos y constructores de la F1.',
  },
  '/terminos': {
    titulo: 'Términos y condiciones',
    descripcion: 'Términos y condiciones de uso de FSports.',
  },
  '/privacidad': {
    titulo: 'Política de privacidad',
    descripcion: 'Política de privacidad de FSports.',
  },
};

async function servirParaBot(request: Request, env: Env, pathname: string): Promise<Response> {
  const meta = RUTA_META[pathname];
  const base = await env.ASSETS.fetch(new Request(new URL('/', request.url)));
  if (!meta) return base;

  const titulo = `${meta.titulo} · FSports`;
  const urlCompleta = `https://oficialfsports.com${pathname}`;

  const transformado = new HTMLRewriter()
    .on('title', { element(el) { el.setInnerContent(titulo); } })
    .on('meta[name="description"]', { element(el) { el.setAttribute('content', meta.descripcion); } })
    .on('meta[property="og:title"]', { element(el) { el.setAttribute('content', titulo); } })
    .on('meta[property="og:description"]', { element(el) { el.setAttribute('content', meta.descripcion); } })
    .on('meta[property="og:url"]', { element(el) { el.setAttribute('content', urlCompleta); } })
    .on('meta[name="twitter:title"]', { element(el) { el.setAttribute('content', titulo); } })
    .on('meta[name="twitter:description"]', { element(el) { el.setAttribute('content', meta.descripcion); } })
    .on('link[rel="canonical"]', { element(el) { el.setAttribute('href', urlCompleta); } })
    .transform(base);

  // Sin cache de borde: cada ruta tiene meta distinto, no se puede compartir
  // la respuesta cacheada de otra ruta bajo la misma URL base.
  const respuesta = new Response(transformado.body, transformado);
  respuesta.headers.set('Cache-Control', 'no-store');
  return respuesta;
}

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

      if (!RUTAS_PERMITIDAS.some((r) => r.test(upstreamPath))) return forbidden();

      const secFetchSite = request.headers.get('Sec-Fetch-Site');
      if (secFetchSite !== 'same-origin') return forbidden();

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
      const pin = BUILD_ADMIN_PIN;
      const secret = BUILD_ADMIN_SECRET;
      if (!pin || !secret) return jsonResponse({ ok: false, error: 'not_configured' }, 503);

      let body: { pin?: string } = {};
      try {
        body = (await request.json()) as { pin?: string };
      } catch { /* body vacío */ }

      const pinMatches = body.pin
        ? (await hmacHex(secret, body.pin)) === (await hmacHex(secret, pin))
        : false;
      if (!pinMatches) {
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
      const secret = BUILD_ADMIN_SECRET;
      if (!secret) return jsonResponse({ ok: false });
      const raw = getCookie(request, ADMIN_COOKIE);
      if (!raw) return jsonResponse({ ok: false });
      try {
        const ok = await verificarToken(raw, secret); // getCookie() ya decodifica
        return jsonResponse({ ok });
      } catch {
        return jsonResponse({ ok: false });
      }
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

    // ── 5) Bots de SEO/redes: HTML con meta correcto por ruta, sin JS ─────────
    const userAgent = request.headers.get('User-Agent') ?? '';
    if (method === 'GET' && BOT_UA.test(userAgent)) {
      return servirParaBot(request, env, pathname);
    }

    // ── 6) Sitio estático (SPA fallback) ──────────────────────────────────────
    return env.ASSETS.fetch(request);
  },
};
