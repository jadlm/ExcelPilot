import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { loadEnv } from 'vite';

const env = loadEnv('development', process.cwd(), '');
for (const key of ['AI_API_KEY', 'AI_MODEL', 'AI_API_URL']) if (env[key]) process.env[key] = env[key];
const api = spawn(process.execPath, ['server/local.js'], { stdio: ['inherit', 'inherit', 'inherit', 'ipc'] });
let vite;
api.on('message', message => {
  if (message !== 'ready' || vite) return;
  vite = spawn(process.execPath, [join(process.cwd(), 'node_modules', 'vite', 'bin', 'vite.js'), '--configLoader', 'runner', '--host', '0.0.0.0'], { stdio: 'inherit', env: process.env });
  vite.on('exit', code => { api.kill(); process.exitCode = code ?? 0; });
});
api.on('exit', code => { if (vite && !vite.killed) vite.kill(); if (!vite) process.exitCode = code ?? 0; });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { api.kill(signal); vite?.kill(signal); });
