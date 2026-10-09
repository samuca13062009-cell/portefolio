'use strict';
// Backoffice: autenticação por sessão e API de gestão de conteúdos.

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const SESSION_MS = 8 * 60 * 60 * 1000;
const COOKIE = 'sid';

// ---------- Limpeza dos dados recebidos ----------
const str = (v, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const bi = (v, max = 300) => {
  const pt = str(v && v.pt, max);
  return { pt, en: str(v && v.en, max) || pt };
};
const lines = (v, maxItems = 30, max = 600) => (Array.isArray(v) ? v : []).map((x) => str(x, max)).filter(Boolean).slice(0, maxItems);
const biLines = (v, maxItems, max) => {
  const pt = lines(v && v.pt, maxItems, max);
  const en = lines(v && v.en, maxItems, max);
  return { pt, en: en.length ? en : pt };
};
const url = (v) => { const s = str(v, 300); return /^https:\/\/[^\s"'<>]+$/.test(s) ? s : ''; };
const list = (v, max, fn) => (Array.isArray(v) ? v : []).slice(0, max).map(fn);
const slugify = (s) => str(s, 80).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

function cleanProject(p, categories) {
  if (!p || typeof p !== 'object') return null;
  const title = bi(p.title, 140);
  if (!title.pt) return null;
  return {
    slug: slugify(p.slug),
    published: p.published !== false,
    featured: p.featured === true,
    category: Object.prototype.hasOwnProperty.call(categories, p.category) ? p.category : Object.keys(categories)[0],
    cover: str(p.cover, 40),
    title,
    summary: bi(p.summary, 300),
    description: biLines(p.description, 10, 1200),
    features: biLines(p.features, 12, 200),
    tech: lines(p.tech, 12, 40),
    repo: url(p.repo),
  };
}

function cleanContent(b, current) {
  const site = b.site || {};
  const home = b.home || {};
  const about = b.about || {};
  return {
    ...current,
    site: {
      name: str(site.name, 80) || current.site.name,
      role: bi(site.role, 140),
      location: bi(site.location, 100),
      linkedin: url(site.linkedin),
      github: url(site.github),
      description: bi(site.description, 300),
    },
    home: {
      kicker: bi(home.kicker, 140),
      title: bi(home.title, 100),
      lead: bi(home.lead, 400),
      facts: list(home.facts, 8, (f) => ({ label: bi(f && f.label, 40), value: bi(f && f.value, 100) })),
    },
    about: { title: bi(about.title, 200), paragraphs: biLines(about.paragraphs, 10, 1200) },
    experience: list(b.experience, 20, (e) => ({
      role: bi(e && e.role, 140), org: str(e && e.org, 140), period: bi(e && e.period, 60), bullets: biLines(e && e.bullets, 10, 300),
    })),
    education: list(b.education, 20, (e) => ({
      title: bi(e && e.title, 200), org: str(e && e.org, 140), period: bi(e && e.period, 60), note: bi(e && e.note, 200),
    })),
    skills: list(b.skills, 12, (g) => ({
      group: bi(g && g.group, 60),
      items: list(g && g.items, 30, (i) => {
        if (typeof i === 'string') return str(i, 60);
        const v = bi(i, 60);
        return v.pt === v.en ? v.pt : v;
      }).filter((i) => (typeof i === 'string' ? i : i.pt)),
    })),
    languages: list(b.languages, 10, (l) => ({ name: bi(l && l.name, 40), level: bi(l && l.level, 40) })),
  };
}

module.exports = function createAdmin(ctx) {
  const { ROOT, readJson, writeJson, sendJson, readBody, rateLimited, getStats, secureCookies } = ctx;
  const FIRST_PW = path.join(ROOT, 'PRIMEIRA-PALAVRA-PASSE.txt');
  const sessions = new Map();
  const hash = (password, salt) => crypto.scryptSync(password, salt, 64);

  // Na primeira execução cria a conta e deixa a palavra-passe inicial num ficheiro local.
  if (!readJson('admin.json', null)) {
    const password = crypto.randomBytes(12).toString('base64url');
    const salt = crypto.randomBytes(16).toString('hex');
    writeJson('admin.json', { user: 'admin', salt, hash: hash(password, salt).toString('hex') });
    fs.writeFileSync(FIRST_PW, `Backoffice do portefólio\r\nUtilizador: admin\r\nPalavra-passe inicial: ${password}\r\n\r\nMuda-a em Backoffice > Conta. Este ficheiro é apagado quando o fizeres.\r\n`);
    console.log('Conta de administração criada. A palavra-passe inicial está em PRIMEIRA-PALAVRA-PASSE.txt');
  }

  setInterval(() => {
    const now = Date.now();
    for (const [id, s] of sessions) if (s.expires < now) sessions.delete(id);
  }, 600000).unref();

  function getSession(req) {
    const m = (req.headers.cookie || '').match(new RegExp(`(?:^|;\\s*)${COOKIE}=([a-f0-9]{64})`));
    const s = m && sessions.get(m[1]);
    if (!s) return null;
    if (s.expires < Date.now()) { sessions.delete(m[1]); return null; }
    s.expires = Date.now() + SESSION_MS;
    return { id: m[1], ...s };
  }
  const cookie = (value, maxAge) => `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secureCookies ? '; Secure' : ''}`;

  async function login(req, res, ip) {
    if (rateLimited(`login:${ip}`, 5, 900000)) return sendJson(res, 429, { ok: false, error: 'rate' });
    let b;
    try { b = JSON.parse(await readBody(req, 2000)); } catch { return sendJson(res, 400, { ok: false }); }
    const admin = readJson('admin.json', null);
    const user = str(b && b.user, 80);
    const password = typeof (b && b.password) === 'string' ? b.password.slice(0, 200) : '';
    const given = hash(password, admin.salt);
    const expected = Buffer.from(admin.hash, 'hex');
    const ok = crypto.timingSafeEqual(given, expected) && user === admin.user;
    if (!ok) return sendJson(res, 401, { ok: false, error: 'credentials' });
    const id = crypto.randomBytes(32).toString('hex');
    const csrf = crypto.randomBytes(24).toString('hex');
    sessions.set(id, { user: admin.user, csrf, expires: Date.now() + SESSION_MS });
    res.setHeader('Set-Cookie', cookie(id, SESSION_MS / 1000));
    sendJson(res, 200, { ok: true, user: admin.user, csrf });
  }

  function dashboard(content) {
    const stats = getStats();
    const messages = readJson('messages.json', []);
    const days = [];
    const pages = {};
    let visits = 0;
    let cv = 0;
    for (let i = 29; i >= 0; i -= 1) {
      const day = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      let total = 0;
      for (const [p, n] of Object.entries(stats[day] || {})) {
        if (p === 'cv-pdf') { cv += n; continue; }
        total += n;
        pages[p] = (pages[p] || 0) + n;
      }
      visits += total;
      days.push({ day, total });
    }
    const month = new Date().toISOString().slice(0, 7);
    return {
      projects: {
        published: content.projects.filter((p) => p.published !== false).length,
        draft: content.projects.filter((p) => p.published === false).length,
      },
      messages: {
        unread: messages.filter((m) => !m.read).length,
        month: messages.filter((m) => m.date.startsWith(month)).length,
        recent: messages.slice(0, 5),
      },
      visits: { total: visits, days, top: Object.entries(pages).sort((a, b) => b[1] - a[1]).slice(0, 5) },
      cvDownloads: cv,
    };
  }

  let cvBuilding = false;
  function buildCv(res) {
    if (cvBuilding) return sendJson(res, 409, { ok: false, error: 'busy' });
    cvBuilding = true;
    const child = spawn(process.execPath, [path.join(ROOT, 'tools', 'build-cv.js')], { stdio: 'ignore' });
    const timer = setTimeout(() => child.kill(), 60000);
    child.on('exit', (code) => { clearTimeout(timer); cvBuilding = false; sendJson(res, code === 0 ? 200 : 500, { ok: code === 0 }); });
    child.on('error', () => { clearTimeout(timer); cvBuilding = false; sendJson(res, 500, { ok: false }); });
  }

  // Devolve true quando o pedido era do backoffice e já foi respondido.
  async function handle(req, res, pathname, ip) {
    if (!pathname.startsWith('/api/admin/')) return false;
    const route = pathname.slice('/api/admin/'.length);
    const method = req.method;

    if (route === 'login' && method === 'POST') { await login(req, res, ip); return true; }

    const session = getSession(req);
    if (!session) { sendJson(res, 401, { ok: false, error: 'auth' }); return true; }
    if (route === 'session' && method === 'GET') { sendJson(res, 200, { ok: true, user: session.user, csrf: session.csrf }); return true; }

    // Tudo o que altera dados exige o token da sessão, para travar pedidos forjados por outros sites.
    if (method !== 'GET') {
      const token = String(req.headers['x-csrf-token'] || '');
      const good = token.length === session.csrf.length && crypto.timingSafeEqual(Buffer.from(token), Buffer.from(session.csrf));
      if (!good) { sendJson(res, 403, { ok: false, error: 'csrf' }); return true; }
    }

    if (route === 'logout' && method === 'POST') {
      sessions.delete(session.id);
      res.setHeader('Set-Cookie', cookie('', 0));
      sendJson(res, 200, { ok: true });
      return true;
    }

    let body = {};
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      try { body = JSON.parse((await readBody(req, 300000)) || '{}'); } catch { sendJson(res, 400, { ok: false }); return true; }
      if (!body || typeof body !== 'object') { sendJson(res, 400, { ok: false }); return true; }
    }
    const content = readJson('content.json', null);

    if (route === 'dashboard' && method === 'GET') { sendJson(res, 200, { ok: true, ...dashboard(content) }); return true; }
    if (route === 'content' && method === 'GET') { sendJson(res, 200, { ok: true, content }); return true; }
    if (route === 'content' && method === 'PUT') {
      const next = cleanContent(body, content);
      writeJson('content.json', next);
      sendJson(res, 200, { ok: true, content: next });
      return true;
    }
    if (route === 'cv-pdf' && method === 'POST') { buildCv(res); return true; }

    if (route === 'password' && method === 'POST') {
      const admin = readJson('admin.json', null);
      const current = typeof body.current === 'string' ? body.current.slice(0, 200) : '';
      const next = typeof body.next === 'string' ? body.next : '';
      if (!crypto.timingSafeEqual(hash(current, admin.salt), Buffer.from(admin.hash, 'hex'))) { sendJson(res, 422, { ok: false, error: 'current' }); return true; }
      if (next.length < 10 || next.length > 200) { sendJson(res, 422, { ok: false, error: 'weak' }); return true; }
      const salt = crypto.randomBytes(16).toString('hex');
      writeJson('admin.json', { user: admin.user, salt, hash: hash(next, salt).toString('hex') });
      for (const id of sessions.keys()) if (id !== session.id) sessions.delete(id);
      fs.rmSync(FIRST_PW, { force: true });
      sendJson(res, 200, { ok: true });
      return true;
    }

    if (route === 'projects' && method === 'POST') {
      const p = cleanProject(body, content.categories);
      if (!p) { sendJson(res, 422, { ok: false, error: 'validation' }); return true; }
      let slug = p.slug || slugify(p.title.pt) || 'projeto';
      for (let n = 2; content.projects.some((x) => x.slug === slug); n += 1) slug = `${(p.slug || slugify(p.title.pt) || 'projeto')}-${n}`;
      p.slug = slug;
      content.projects.push(p);
      writeJson('content.json', content);
      sendJson(res, 201, { ok: true, project: p });
      return true;
    }
    const pm = route.match(/^projects\/([a-z0-9-]+)$/);
    if (pm) {
      const i = content.projects.findIndex((x) => x.slug === pm[1]);
      if (i < 0) { sendJson(res, 404, { ok: false }); return true; }
      if (method === 'PUT') {
        const p = cleanProject({ ...body, slug: pm[1] }, content.categories);
        if (!p) { sendJson(res, 422, { ok: false, error: 'validation' }); return true; }
        content.projects[i] = p;
        writeJson('content.json', content);
        sendJson(res, 200, { ok: true, project: p });
        return true;
      }
      if (method === 'DELETE') {
        content.projects.splice(i, 1);
        writeJson('content.json', content);
        sendJson(res, 200, { ok: true });
        return true;
      }
    }

    if (route === 'messages' && method === 'GET') { sendJson(res, 200, { ok: true, messages: readJson('messages.json', []) }); return true; }
    const mm = route.match(/^messages\/([a-f0-9-]{36})$/);
    if (mm) {
      const all = readJson('messages.json', []);
      const i = all.findIndex((m) => m.id === mm[1]);
      if (i < 0) { sendJson(res, 404, { ok: false }); return true; }
      if (method === 'PATCH') { all[i].read = body.read === true; writeJson('messages.json', all); sendJson(res, 200, { ok: true, message: all[i] }); return true; }
      if (method === 'DELETE') { all.splice(i, 1); writeJson('messages.json', all); sendJson(res, 200, { ok: true }); return true; }
    }

    sendJson(res, 404, { ok: false });
    return true;
  }

  return { handle };
};
