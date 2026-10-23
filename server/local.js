import { createServer } from 'node:http';
import { aiStatus, handleChat } from './ai.js';

const server = createServer(async (req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  const origin = req.headers.origin || '';
  if (/^http:\/\/(localhost|127\.0\.0\.1):517[3-9]$/.test(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  }
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  if (path === '/api/status' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(aiStatus()));
    return;
  }
  if (path === '/api/chat') {
    try {
      const result = await handleChat(req);
      res.writeHead(result.status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.body));
    } catch {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Erreur interne du service IA.' }));
    }
    return;
  }
  res.writeHead(404); res.end();
});

server.listen(Number(process.env.API_PORT || 3001), '127.0.0.1', () => {
  if (process.send) process.send('ready');
  else process.stdout.write('API locale sur http://127.0.0.1:3001\n');
});
