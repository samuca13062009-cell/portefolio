'use strict';
// Servidor do portefólio. Node.js puro, sem dependências externas.

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { renderer, ROUTES, esc } = require('./lib/render');

const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const DATA = path.join(ROOT, 'data');

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
const SITE_URL = (process.env.SITE_URL || `http://localhost:${PORT}`).replace(/\/$/, '');
const BREVO = {
  key: process.env.BREVO_API_KEY || '',
  senderEmail: process.env.BREVO_SENDER_EMAIL || '',
  senderName: process.env.BREVO_SENDER_NAME || 'Portefólio',
  to: process.env.CONTACT_TO || '',
  listId: Number(process.env.BREVO_LIST_ID) || 0,
};
const brevoReady = Boolean(BREVO.key && BREVO.senderEmail && BREVO.to);

// ---------- Dados ----------
const readJson = (file, fallback) => {
  try { return JSON.parse(fs.readFileSync(path.join(DATA, file), 'utf8')); } catch { return fallback; }
};
// Escreve para um ficheiro temporário e só depois substitui, para nunca deixar JSON a meio.
function writeJson(file, value) {
  const target = path.join(DATA, file);
  const tmp = `${target}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2));
  fs.renameSync(tmp, target);
}
const getContent = () => readJson('content.json', null);

// ---------- Estatísticas de visitas ----------
let stats = readJson('stats.json', {});
let statsDirty = false;
function countVisit(pathname, req) {
  if (/bot|crawl|spider|headless/i.test(req.headers['user-agent'] || '')) return;
  const day = new Date().toISOString().slice(0, 10);
  stats[day] = stats[day] || {};
  stats[day][pathname] = (stats[day][pathname] || 0) + 1;
  statsDirty = true;
}
setInterval(() => {
  if (!statsDirty) return;
  statsDirty = false;
  try { writeJson('stats.json', stats); } catch (e) { console.error('Estatísticas:', e.message); }
}, 15000).unref();

// ---------- Limitação de pedidos ----------
const hits = new Map();
function rateLimited(ip, max, windowMs) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  if (list.length >= max) { hits.set(ip, list); return true; }
  list.push(now);
  hits.set(ip, list);
  return false;
}
setInterval(() => {
  const now = Date.now();
  for (const [ip, list] of hits) if (!list.some((t) => now - t < 600000)) hits.delete(ip);
}, 600000).unref();

// ---------- Respostas ----------
const SECURITY = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; script-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
};
function send(res, status, body, headers = {}) {
  res.writeHead(status, { ...SECURITY, ...headers });
  res.end(body);
}
const sendHtml = (res, status, html) => send(res, status, html, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
const sendJson = (res, status, obj) => send(res, status, JSON.stringify(obj), { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });

const MIME = {
  '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.pdf': 'application/pdf', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8',
};
function serveStatic(res, pathname) {
  const ext = path.extname(pathname).toLowerCase();
  if (!MIME[ext]) return false;
  const file = path.normalize(path.join(PUBLIC, pathname));
  if (!file.startsWith(PUBLIC + path.sep)) return false;
  let data;
  try { data = fs.readFileSync(file); } catch { return false; }
  send(res, 200, data, { 'Content-Type': MIME[ext], 'Cache-Control': 'public, max-age=3600' });
  return true;
}

// ---------- Contacto + Brevo ----------
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
function validateContact(b) {
  const clean = (v) => (typeof v === 'string' ? v.trim() : '');
  const data = { name: clean(b.name), email: clean(b.email), subject: clean(b.subject), message: clean(b.message) };
  const errors = {};
  if (data.name.length < 2 || data.name.length > 80) errors.name = true;
  if (!EMAIL_RE.test(data.email) || data.email.length > 120) errors.email = true;
  if (data.subject.length < 2 || data.subject.length > 120) errors.subject = true;
  if (data.message.length < 10 || data.message.length > 4000) errors.message = true;
  return { data, errors };
}

async function brevo(endpoint, payload) {
  const r = await fetch(`https://api.brevo.com/v3/${endpoint}`, {
    method: 'POST',
    headers: { 'api-key': BREVO.key, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(8000),
  });
  if (!r.ok) throw new Error(`Brevo ${endpoint} respondeu ${r.status}: ${(await r.text()).slice(0, 200)}`);
}

async function sendViaBrevo(m) {
  await brevo('smtp/email', {
    sender: { email: BREVO.senderEmail, name: BREVO.senderName },
    to: [{ email: BREVO.to }],
    replyTo: { email: m.email, name: m.name },
    subject: `[Portefólio] ${m.subject}`,
    htmlContent: `<p><strong>Nome:</strong> ${esc(m.name)}<br><strong>Email:</strong> ${esc(m.email)}<br><strong>Assunto:</strong> ${esc(m.subject)}</p><p>${esc(m.message).replace(/\n/g, '<br>')}</p>`,
  });
  if (BREVO.listId) {
    await brevo('contacts', {
      email: m.email, attributes: { NOME: m.name }, listIds: [BREVO.listId], updateEnabled: true,
    }).catch((e) => console.error(e.message));
  }
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

async function handleContact(req, res, ip) {
  if (!(req.headers['content-type'] || '').startsWith('application/json')) return sendJson(res, 415, { ok: false });
  if (rateLimited(ip, 5, 600000)) return sendJson(res, 429, { ok: false, error: 'rate' });
  let body;
  try { body = JSON.parse(await readBody(req, 10000)); } catch { return sendJson(res, 400, { ok: false }); }
  if (!body || typeof body !== 'object') return sendJson(res, 400, { ok: false });
  // Campo-armadilha: as pessoas não o veem; os bots preenchem-no.
  if (body.website) return sendJson(res, 200, { ok: true });
  const { data, errors } = validateContact(body);
  if (Object.keys(errors).length) return sendJson(res, 422, { ok: false, error: 'validation', fields: errors });

  const message = { id: crypto.randomUUID(), date: new Date().toISOString(), ...data, read: false, delivery: 'pendente' };
  if (brevoReady) {
    try { await sendViaBrevo(data); message.delivery = 'enviado'; } catch (e) { message.delivery = 'falhou'; console.error(e.message); }
  } else {
    message.delivery = 'brevo-por-configurar';
  }
  try {
    const all = readJson('messages.json', []);
    all.unshift(message);
    writeJson('messages.json', all);
  } catch (e) {
    console.error('Mensagens:', e.message);
    if (message.delivery !== 'enviado') return sendJson(res, 500, { ok: false, error: 'server' });
  }
  sendJson(res, 200, { ok: true });
}

// ---------- Páginas ----------
function matchPage(pathname) {
  for (const lang of ['pt', 'en']) {
    const R = ROUTES[lang];
    for (const key of ['home', 'about', 'projects', 'cv', 'cvPrint', 'contact']) {
      if (pathname === R[key]) return { lang, key };
    }
    if (pathname.startsWith(R.projects + '/')) {
      const slug = pathname.slice(R.projects.length + 1);
      if (/^[a-z0-9-]+$/.test(slug)) return { lang, key: 'project', slug };
    }
  }
  return null;
}

function sitemap(content) {
  const urls = [];
  for (const lang of ['pt', 'en']) {
    const R = ROUTES[lang];
    urls.push(R.home, R.about, R.projects, R.cv, R.contact);
    for (const p of content.projects) if (p.published !== false) urls.push(`${R.projects}/${p.slug}`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>${esc(SITE_URL + u)}</loc></url>`).join('\n')}\n</urlset>\n`;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    let pathname = decodeURIComponent(url.pathname);
    const ip = req.socket.remoteAddress || '';

    if (pathname === '/api/contact') {
      if (req.method !== 'POST') return sendJson(res, 405, { ok: false });
      return await handleContact(req, res, ip);
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Método não permitido', { 'Content-Type': 'text/plain; charset=utf-8' });

    const content = getContent();
    if (!content) return send(res, 500, 'Conteúdo em falta (data/content.json).', { 'Content-Type': 'text/plain; charset=utf-8' });

    if (pathname === '/robots.txt') return send(res, 200, `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${SITE_URL}/sitemap.xml\n`, { 'Content-Type': 'text/plain; charset=utf-8' });
    if (pathname === '/sitemap.xml') return send(res, 200, sitemap(content), { 'Content-Type': 'application/xml; charset=utf-8' });

    if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.slice(0, -1);
    const page = matchPage(pathname);
    if (page) {
      const r = renderer(content, page.lang, SITE_URL);
      const html = page.key === 'project' ? r.project(page.slug) : r[page.key]();
      if (html) {
        if (page.key !== 'cvPrint') countVisit(pathname, req);
        return sendHtml(res, 200, html);
      }
    }
    if (serveStatic(res, pathname)) return;

    const lang = pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'pt';
    sendHtml(res, 404, renderer(content, lang, SITE_URL).notFound(pathname));
  } catch (e) {
    console.error(e);
    if (!res.headersSent) send(res, 500, 'Erro interno', { 'Content-Type': 'text/plain; charset=utf-8' });
    else res.end();
  }
});

server.listen(PORT, () => {
  console.log(`Portefólio em http://localhost:${PORT}`);
  if (!brevoReady) console.log('Aviso: Brevo por configurar (.env). As mensagens ficam só guardadas em data/messages.json.');
});
