'use strict';
// Servidor local do portefólio. Node.js puro, sem dependências externas.
// No Netlify o mesmo núcleo (lib/app.js) corre em netlify/functions/site.mjs.

const http = require('http');
const fs = require('fs');
const path = require('path');
const { createApp } = require('./lib/app');
const { fileStore } = require('./lib/store');

const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');

// ---------- Configuração (.env) ----------
function loadEnv() {
  const file = path.join(ROOT, '.env');
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!m || line.trim().startsWith('#')) continue;
    if (process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
loadEnv();

const PORT = Number(process.env.PORT) || 4180;
// Pasta dos dados. Num alojamento com disco, DATA_DIR aponta para o disco persistente.
const DATA = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(ROOT, 'data');
const app = createApp({
  store: fileStore(DATA),
  siteUrl: process.env.SITE_URL || `http://localhost:${PORT}`,
  local: true,
  root: ROOT,
});

// ---------- Ficheiros estáticos ----------
const MIME = {
  '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.pdf': 'application/pdf', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
};
function readStatic(pathname) {
  if (pathname === '/admin' || pathname === '/admin/') pathname = '/admin/index.html';
  const ext = path.extname(pathname).toLowerCase();
  if (!MIME[ext]) return null;
  const file = path.normalize(path.join(PUBLIC, pathname));
  if (!file.startsWith(PUBLIC + path.sep)) return null;
  try {
    return {
      status: 200,
      body: fs.readFileSync(file),
      headers: {
        ...app.headersBase,
        'Content-Type': MIME[ext],
        'Cache-Control': /\.(css|js|html)$/.test(pathname) ? 'no-cache' : 'public, max-age=3600',
      },
    };
  } catch { return null; }
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) { reject(new Error('too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const request = {
      method: req.method,
      path: decodeURIComponent(url.pathname),
      query: url.searchParams,
      headers: req.headers,
      ip: req.socket.remoteAddress || '',
      text: (limit) => readBody(req, limit),
    };
    const out = (await app.handle(request))
      || ((req.method === 'GET' || req.method === 'HEAD') && readStatic(request.path))
      || (await app.notFound(request));
    res.writeHead(out.status, out.headers);
    res.end(req.method === 'HEAD' ? undefined : out.body);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Erro interno');
  }
});

server.listen(PORT, () => {
  console.log(`Portefólio em http://localhost:${PORT}`);
  if (!app.brevoReady) console.log('Aviso: Brevo por configurar (.env). As mensagens ficam só guardadas em data/messages.json.');
});
