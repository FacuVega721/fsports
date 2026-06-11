// Genera worker/token.generated.ts a partir de la variable de entorno
// FOOTBALL_DATA_TOKEN disponible en el build (variable de build de Cloudflare).
// El archivo generado está en .gitignore: el token nunca se commitea.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const token = process.env.FOOTBALL_DATA_TOKEN ?? '';
const out = fileURLToPath(new URL('../worker/token.generated.ts', import.meta.url));

writeFileSync(
  out,
  `// ARCHIVO GENERADO EN BUILD — no editar, no commitear.\nexport const BUILD_TOKEN = ${JSON.stringify(token)};\n`,
);

console.log(`[gen-token] token de build ${token ? 'presente' : 'vacío'} (${token.length} chars)`);
