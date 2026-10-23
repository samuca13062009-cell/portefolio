'use strict';
// Núcleo do site, igual no servidor local (server.js) e no Netlify (netlify/functions/site.mjs).
// Recebe um pedido simplificado e devolve { status, headers, body }.

const crypto = require('crypto');
const { renderer, ROUTES, CV_PDF, esc } = require('./render');
const createAdmin = require('./admin');
const { PRIVACY_VERSION } = require('./legal');
const SEED_CONTENT = require('../data/content.json');

const RETENTION_DAYS = 365;
const STATS_DAYS = 400;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const EMAIL_OK = (v) => typeof v === 'string' && /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/.test(v.trim());

const SECURITY = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; script-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
};

function createApp({ store, siteUrl, env = process.env, local = false, root }) {
  const SITE_URL = siteUrl.replace(/\/$/, '');
  const secure = SITE_URL.startsWith('https://');
  const headersBase = secure ? { ...SECURITY, 'Strict-Transport-Security': 'max-age=31536000' } : { ...SECURITY };
  const BREVO = {
    key: env.BREVO_API_KEY || '',
    senderEmail: env.BREVO_SENDER_EMAIL || '',
    senderName: env.BREVO_SENDER_NAME || 'Portefólio',
    to: env.CONTACT_TO || '',
  };
  const brevoReady = Boolean(BREVO.key && BREVO.senderEmail && EMAIL_OK(BREVO.to));
  const PUBLIC_EMAIL = EMAIL_OK(env.PUBLIC_EMAIL) ? env.PUBLIC_EMAIL.trim() : '';

  // ---------- Respostas ----------
  const reply = (status, body, headers = {}) => ({ status, body, headers: { ...headersBase, ...headers } });
  const html = (status, body) => reply(status, body, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
  const json = (status, obj, extra = {}) => reply(status, JSON.stringify(obj), { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra });
  const text = (status, body, type = 'text/plain; charset=utf-8') => reply(status, body, { 'Content-Type': type });

  // ---------- Dados ----------
  const getContent = async () => store.get('content', SEED_CONTENT);

  async function countVisit(key, req) {
    // Só conta visitas reais: não conta robôs e ferramentas, nem o servidor local (são testes do dono),
    // nem quem tem sessão iniciada no backoffice.
    if (local) return;
    if (/bot|crawl|spider|headless|lighthouse|curl|wget|python|node-fetch|undici|axios|go-http|java//i.test(req.headers['user-agent'] || '')) return;
    if (/(?:^|;s*)sid=/.test(req.headers.cookie || '')) return;
    try {
      const stats = await store.get('stats', {});
      const day = new Date().toISOString().slice(0, 10);
      stats[day] = stats[day] || {};
      stats[day][key] = (stats[day][key] || 0) + 1;
      const oldest = new Date(Date.now() - STATS_DAYS * 86400000).toISOString().slice(0, 10);
      for (const d of Object.keys(stats)) if (d < oldest) delete stats[d];
      await store.set('stats', stats);
    } catch (e) { console.error('Estatísticas:', e.message); }
  }

  // Limite de pedidos por IP, guardado no armazenamento para funcionar também sem servidor contínuo.
  // Cada entrada dura no máximo 15 minutos.
  // mode: 'hit' conta este pedido (por omissão), 'check' só verifica, 'clear' esquece as tentativas.
  async function rateLimited(key, max, windowMs, mode = 'hit') {
    const now = Date.now();
    try {
      // HMAC com um segredo aleatório deste site: o IP não fica guardado nem é recuperável.
      let secret = await store.get('secret', null);
      if (!secret) { secret = crypto.randomBytes(32).toString('hex'); await store.set('secret', secret); }
      const id = crypto.createHmac('sha256', secret).update(key).digest('hex').slice(0, 32);
      const all = await store.get('ratelimit', {});
      for (const k of Object.keys(all)) {
        all[k] = all[k].filter((t) => now - t < 900000);
        if (!all[k].length) delete all[k];
      }
      const list = mode === 'clear' ? [] : (all[id] || []).filter((t) => now - t < windowMs);
      const blocked = list.length >= max;
      if (!blocked && mode === 'hit') list.push(now);
      if (list.length) all[id] = list; else delete all[id];
      await store.set('ratelimit', all);
      return blocked;
    } catch (e) {
      console.error('Limite de pedidos:', e.message);
      return false;
    }
  }

  async function purgeOldMessages() {
    const all = await store.get('messages', []);
    const limit = Date.now() - RETENTION_DAYS * 86400000;
    const kept = all.filter((m) => Date.parse(m.date) >= limit);
    if (kept.length !== all.length) await store.set('messages', kept);
    return kept;
  }

  // ---------- Contacto + Brevo ----------
  function validateContact(b) {
    const clean = (v) => (typeof v === 'string' ? v.trim() : '');
    const line = (v) => clean(v).replace(/[\r\n\t]+/g, ' ');
    const data = { name: line(b.name), email: clean(b.email), subject: line(b.subject), message: clean(b.message) };
    const errors = {};
    if (data.name.length < 2 || data.name.length > 80) errors.name = true;
    if (!EMAIL_RE.test(data.email) || data.email.length > 120) errors.email = true;
    if (data.subject.length < 2 || data.subject.length > 120) errors.subject = true;
    if (data.message.length < 10 || data.message.length > 4000) errors.message = true;
    if (b.consent !== true) errors.consent = true;
    return { data, errors };
  }

  async function sendViaBrevo(m) {
    const r = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': BREVO.key, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        sender: { email: BREVO.senderEmail, name: BREVO.senderName },
        to: [{ email: BREVO.to }],
        replyTo: { email: m.email, name: m.name },
        subject: `[Portefólio] ${m.subject}`,
        htmlContent: `<p><strong>Nome:</strong> ${esc(m.name)}<br><strong>Email:</strong> ${esc(m.email)}<br><strong>Assunto:</strong> ${esc(m.subject)}</p><p>${esc(m.message).replace(/\n/g, '<br>')}</p>`,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) throw new Error(`Brevo respondeu ${r.status}: ${(await r.text()).slice(0, 200)}`);
  }

  async function handleContact(req) {
    if (!(req.headers['content-type'] || '').startsWith('application/json')) return json(415, { ok: false });
    if (await rateLimited(`contact:${req.ip}`, 5, 600000)) return json(429, { ok: false, error: 'rate' });
    let body;
    try { body = JSON.parse(await req.text(10000)); } catch { return json(400, { ok: false }); }
    if (!body || typeof body !== 'object') return json(400, { ok: false });
    // Campo-armadilha: as pessoas não o veem; os bots preenchem-no.
    if (body.website) return json(200, { ok: true });
    const { data, errors } = validateContact(body);
    if (Object.keys(errors).length) return json(422, { ok: false, error: 'validation', fields: errors });

    const now = new Date().toISOString();
    const message = {
      id: crypto.randomUUID(), date: now, ...data, read: false, delivery: 'pendente',
      consent: { at: now, policy: PRIVACY_VERSION },
    };
    if (brevoReady) {
      try { await sendViaBrevo(data); message.delivery = 'enviado'; } catch (e) { message.delivery = 'falhou'; console.error(e.message); }
    } else {
      message.delivery = 'brevo-por-configurar';
    }
    try {
      const all = await purgeOldMessages();
      all.unshift(message);
      await store.set('messages', all);
    } catch (e) {
      console.error('Mensagens:', e.message);
      if (message.delivery !== 'enviado') return json(500, { ok: false, error: 'server' });
    }
    return json(200, { ok: true });
  }

  // ---------- Backoffice ----------
  const admin = createAdmin({ store, json, rateLimited, getContent, purgeOldMessages, secure, local, root, env });

  // ---------- Páginas ----------
  function matchPage(pathname) {
    for (const lang of ['pt', 'en']) {
      const R = ROUTES[lang];
      for (const key of ['home', 'about', 'projects', 'cv', 'cvPrint', 'contact', 'privacy', 'terms', 'cookies']) {
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
      urls.push(R.home, R.about, R.projects, R.cv, R.contact, R.privacy, R.terms, R.cookies);
      for (const p of content.projects) if (p.published !== false) urls.push(`${R.projects}/${p.slug}`);
    }
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>${esc(SITE_URL + u)}</loc></url>`).join('\n')}\n</urlset>\n`;
  }

  // Devolve null quando o pedido não é para o site gerado (por exemplo, um ficheiro estático).
  async function handle(req) {
    let pathname = req.path;
    try {
      if (pathname.startsWith('/api/admin/')) return await admin.handle(req, pathname.slice('/api/admin/'.length));
      if (pathname === '/api/contact') {
        if (req.method !== 'POST') return json(405, { ok: false });
        return await handleContact(req);
      }
      if (req.method !== 'GET' && req.method !== 'HEAD') return text(405, 'Método não permitido');

      // Descarga do CV: conta e reencaminha para o PDF estático.
      const dl = pathname.match(/^\/cv\/descarregar\/(pt|en)$/);
      if (dl) {
        await countVisit('cv-pdf', req);
        return reply(302, '', { Location: CV_PDF[dl[1]], 'Cache-Control': 'no-store' });
      }

      const content = await getContent();
      if (pathname === '/robots.txt') return text(200, `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin\nSitemap: ${SITE_URL}/sitemap.xml\n`);
      if (pathname === '/sitemap.xml') return text(200, sitemap(content), 'application/xml; charset=utf-8');

      if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.slice(0, -1);
      const page = matchPage(pathname);
      if (page) {
        const r = renderer(content, page.lang, SITE_URL, req.query.get('tema') || '', { publicEmail: PUBLIC_EMAIL });
        const out = page.key === 'project' ? r.project(page.slug) : r[page.key]();
        if (out) {
          if (page.key !== 'cvPrint') await countVisit(pathname, req);
          return html(200, out);
        }
      }
      return null;
    } catch (e) {
      console.error(e);
      return serverError(req);
    }
  }

  // Página de erro do próprio site; se até isso falhar, um texto simples.
  function serverError(req) {
    try {
      const lang = req.path === '/en' || String(req.path).startsWith('/en/') ? 'en' : 'pt';
      return html(500, renderer(SEED_CONTENT, lang, SITE_URL, '', { publicEmail: PUBLIC_EMAIL }).serverError(req.path));
    } catch {
      return text(500, 'Erro no servidor. Tente de novo daqui a um momento. / Server error. Try again in a moment.');
    }
  }

  async function notFound(req) {
    const content = await getContent();
    const lang = req.path === '/en' || req.path.startsWith('/en/') ? 'en' : 'pt';
    return html(404, renderer(content, lang, SITE_URL, '', { publicEmail: PUBLIC_EMAIL }).notFound(req.path));
  }

  return { handle, notFound, serverError, admin, brevoReady, headersBase, countVisit };
}

module.exports = { createApp };
