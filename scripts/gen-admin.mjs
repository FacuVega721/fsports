// Genera worker/admin.generated.ts a partir de las variables de build de Cloudflare:
//   ADMIN_PIN    — PIN numérico para el panel de administración
//   ADMIN_SECRET — Clave HMAC para firmar las cookies de sesión (cadena aleatoria larga)
// El archivo generado está en .gitignore: las credenciales nunca se commitean.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const pin    = process.env.ADMIN_PIN    ?? '';
const secret = process.env.ADMIN_SECRET ?? '';
const out = fileURLToPath(new URL('../worker/admin.generated.ts', import.meta.url));

writeFileSync(
  out,
  `// ARCHIVO GENERADO EN BUILD — no editar, no commitear.\n` +
  `export const ADMIN_PIN    = ${JSON.stringify(pin)};\n` +
  `export const ADMIN_SECRET = ${JSON.stringify(secret)};\n`,
);

const ok = pin && secret;
console.log(`[gen-admin] credenciales de admin ${ok ? 'presentes' : 'vacías (modo dev)'}`);
