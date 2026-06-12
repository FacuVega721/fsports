// Deploy de un comando: valida (build), commitea y pushea a main.
// Uso: npm run ship "mensaje de commit"
import { execSync } from 'node:child_process';

const msg = process.argv.slice(2).join(' ').trim() || 'update';
const trailer = 'Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>';
const run = (c) => execSync(c, { stdio: 'inherit' });

run('npm run build');
run('git add -A');
run(`git commit -q -m ${JSON.stringify(msg)} -m ${JSON.stringify(trailer)}`);
run('git push origin main');
console.log(`\n✅ Desplegado a main: ${msg}`);
