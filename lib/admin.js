'use strict';
// Backoffice: autenticação (sessão em cookie assinado) e API de gestão de conteúdos.

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { THEMES, pickTheme } = require('./themes');

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
    // Imagens já existentes em public/img (o backoffice ainda não carrega ficheiros novos).
    images: list(p.images, 6, (im) => ({ src: /^\/img\/[a-z0-9/_-]+$/.test(str(im && im.src, 120)) ? str(im.src, 120) : '', alt: bi(im && im.alt, 200),
      ...(Array.isArray(im && im.sizes) && im.sizes.length === 2 && im.sizes.every((n) => Number.isInteger(n) && n > 0 && n <= 4000) ? { sizes: im.sizes } : {}),
      ...(im && im.credit ? { credit: { author: str(im.credit.author, 120), license: str(im.credit.license, 40), licenseUrl: url(im.credit.licenseUrl), page: url(im.credit.page) } } : {}),
    })).filter((im) => im.src),
    role: bi(p.role, 100),
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
      theme: pickTheme(site.theme, current.site.theme),
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

// ---------- Sessões ----------
// A sessão vive num cookie assinado (HMAC), para funcionar também em funções sem memória (Netlify).
// A chave de assinatura deriva da palavra-passe guardada: mudá-la termina todas as sessões.
const sessionKey = (admin) => `${admin.salt}:${admin.hash}`;
const sign = (payload, key) => crypto.createHmac('sha256', key).update(payload).digest('base64url');
const sameText = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

function issueSession(admin) {
  const payload = Buffer.from(JSON.stringify({
    u: admin.user, exp: Date.now() + SESSION_MS, csrf: crypto.randomBytes(24).toString('hex'), n: crypto.randomBytes(8).toString('hex'),
  })).toString('base64url');
  return { token: `${payload}.${sign(payload, sessionKey(admin))}`, data: JSON.parse(Buffer.from(payload, 'base64url').toString()) };
}

function readSession(req, admin) {
  if (!admin) return null;
  const m = (req.headers.cookie || '').match(new RegExp(`(?:^|;\\s*)${COOKIE}=([A-Za-z0-9_-]+)\\.([A-Za-z0-9_-]+)`));
  if (!m || !sameText(m[2], sign(m[1], sessionKey(admin)))) return null;
  let data;
  try { data = JSON.parse(Buffer.from(m[1], 'base64url').toString()); } catch { return null; }
  if (!data || data.u !== admin.user || typeof data.exp !== 'number' || data.exp < Date.now()) return null;
  return data;
}

module.exports = function createAdmin(ctx) {
  const { store, json, rateLimited, getContent, purgeOldMessages, secure, local, root, env } = ctx;
  const FIRST_PW = root ? path.join(root, 'PRIMEIRA-PALAVRA-PASSE.txt') : '';
  const hash = (password, salt) => crypto.scryptSync(password, salt, 64);
  const cookie = (value, maxAge) => `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure ? '; Secure' : ''}`;
  const newAccount = (password) => {
    const salt = crypto.randomBytes(16).toString('hex');
    return { user: 'admin', salt, hash: hash(password, salt).toString('hex') };
  };

  // A conta é criada na primeira utilização. ADMIN_PASSWORD (variável de ambiente) define a
  // palavra-passe inicial num alojamento; localmente, sem ela, é gerada e posta num ficheiro.
  async function getAdmin() {
    let admin = await store.get('admin', null);
    if (admin) return admin;
    const envPassword = env.ADMIN_PASSWORD || '';
    if (envPassword.length >= 10) {
      admin = newAccount(envPassword);
      await store.set('admin', admin);
      console.log('Conta de administração criada com a palavra-passe de ADMIN_PASSWORD.');
      return admin;
    }
    if (local && FIRST_PW) {
      const password = crypto.randomBytes(12).toString('base64url');
      admin = newAccount(password);
      await store.set('admin', admin);
      fs.writeFileSync(FIRST_PW, `Backoffice do portefólio\r\nUtilizador: admin\r\nPalavra-passe inicial: ${password}\r\n\r\nMuda-a em Backoffice > Conta. Este ficheiro é apagado quando o fizeres.\r\n`);
      console.log('Conta de administração criada. A palavra-passe inicial está em PRIMEIRA-PALAVRA-PASSE.txt');
      return admin;
    }
    return null;
  }

  async function dashboard(content) {
    const stats = await store.get('stats', {});
    const messages = await purgeOldMessages();
    const days = [];
    const pages = {};
    let visits = 0;
    let cv = 0;
    let people = 0;
    for (let i = 29; i >= 0; i -= 1) {
      const day = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      let total = 0;
      let dayPeople = 0;
      for (const [p, n] of Object.entries(stats[day] || {})) {
        if (p === 'cv-pdf') { cv += n; continue; }
        if (p === '#visitantes') { dayPeople += n; continue; }
        total += n;
        pages[p] = (pages[p] || 0) + n;
      }
      visits += total;
      people += dayPeople;
      days.push({ day, total, people: dayPeople });
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
      visits: { total: visits, people, days, top: Object.entries(pages).sort((a, b) => b[1] - a[1]).slice(0, 5) },
      cvDownloads: cv,
      siteOnline: env.SITE_URL_ONLINE || '',
    };
  }

  // Publicar: envia os conteúdos e ficheiros do site para o GitHub; o Netlify publica a partir daí.
  // Comandos fixos, sem nada vindo do pedido. Só conteúdos (data/content.json) e public/.
  let publishing = false;
  const git = (args) => new Promise((resolve) => {
    const child = spawn('git', args, { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { out += d; });
    const timer = setTimeout(() => child.kill(), 90000);
    child.on('error', () => { clearTimeout(timer); resolve({ code: 1, out }); });
    child.on('exit', (code) => { clearTimeout(timer); resolve({ code, out }); });
  });
  const NETLIFY_CLI = path.join(process.env.APPDATA || '', 'npm', 'node_modules', 'netlify-cli', 'bin', 'run.js');
  function netlifyDeploy() {
    if (!env.NETLIFY_SITE_ID || !fs.existsSync(NETLIFY_CLI)) return Promise.resolve(false);
    return new Promise((resolve) => {
      const child = spawn(process.execPath, [NETLIFY_CLI, 'deploy', '--prod', '--dir', 'public', '--functions', 'netlify/functions', '--site', env.NETLIFY_SITE_ID, '--message', 'Publicado pelo backoffice'], { cwd: root, stdio: 'ignore' });
      const timer = setTimeout(() => child.kill(), 300000);
      child.on('error', () => { clearTimeout(timer); resolve(false); });
      child.on('exit', (code) => { clearTimeout(timer); resolve(code === 0); });
    });
  }
  async function publish() {
    if (!local || !root) return json(501, { ok: false, error: 'local-only' });
    if (publishing) return json(409, { ok: false, error: 'busy' });
    publishing = true;
    try {
      if ((await git(['add', '--', 'data/content.json', 'public'])).code !== 0) return json(500, { ok: false, error: 'git' });
      const staged = await git(['diff', '--cached', '--quiet']);
      if (staged.code === 0) {
        const ahead = await git(['status', '-sb']);
        if (!/\[ahead/.test(ahead.out)) {
          // Nada novo no GitHub, mas o site online pode estar atrasado: publica na mesma.
          const deploy = await netlifyDeploy();
          return json(deploy ? 200 : 502, { ok: deploy, error: deploy ? undefined : 'netlify' });
        }
      } else if ((await git(['commit', '-m', 'Atualização de conteúdos pelo backoffice'])).code !== 0) {
        return json(500, { ok: false, error: 'git' });
      }
      const push = await git(['push']);
      if (push.code !== 0) return json(502, { ok: false, error: 'push' });
      // Publica no Netlify com a ferramenta do Netlify instalada neste computador (sessão já autorizada).
      const deploy = await netlifyDeploy();
      return json(deploy ? 200 : 502, { ok: deploy, error: deploy ? undefined : 'netlify' });
    } finally { publishing = false; }
  }

  // O PDF do CV só se gera no computador (precisa do Chrome ou do Edge).
  let cvBuilding = false;
  function buildCv() {
    if (!local) return Promise.resolve(json(501, { ok: false, error: 'local-only' }));
    if (cvBuilding) return Promise.resolve(json(409, { ok: false, error: 'busy' }));
    cvBuilding = true;
    return new Promise((resolve) => {
      const child = spawn(process.execPath, [path.join(root, 'tools', 'build-cv.js')], { stdio: 'ignore' });
      const timer = setTimeout(() => child.kill(), 60000);
      const done = (ok) => { clearTimeout(timer); cvBuilding = false; resolve(json(ok ? 200 : 500, { ok })); };
      child.on('exit', (code) => done(code === 0));
      child.on('error', () => done(false));
    });
  }

  async function handle(req, route) {
    const method = req.method;
    const admin = await getAdmin();

    if (route === 'login' && method === 'POST') {
      if (!admin) return json(503, { ok: false, error: 'setup' });
      // Só as tentativas erradas contam: 5 erradas em 15 minutos bloqueiam; entrar bem limpa a contagem.
      const key = `login:${req.ip}`;
      if (await rateLimited(key, 5, 900000, 'check')) return json(429, { ok: false, error: 'rate' });
      let b;
      try { b = JSON.parse(await req.text(2000)); } catch { return json(400, { ok: false }); }
      const user = str(b && b.user, 80);
      const password = typeof (b && b.password) === 'string' ? b.password.slice(0, 200) : '';
      const ok = crypto.timingSafeEqual(hash(password, admin.salt), Buffer.from(admin.hash, 'hex')) && user === admin.user;
      if (!ok) { await rateLimited(key, 5, 900000); return json(401, { ok: false, error: 'credentials' }); }
      await rateLimited(key, 5, 900000, 'clear');
      const s = issueSession(admin);
      return json(200, { ok: true, user: admin.user, csrf: s.data.csrf }, { 'Set-Cookie': cookie(s.token, SESSION_MS / 1000) });
    }

    const session = readSession(req, admin);
    if (!session) return json(401, { ok: false, error: 'auth' });
    if (route === 'session' && method === 'GET') return json(200, { ok: true, user: session.u, csrf: session.csrf });

    // Tudo o que altera dados exige o token da sessão, para travar pedidos forjados por outros sites.
    if (method !== 'GET' && !sameText(req.headers['x-csrf-token'] || '', session.csrf)) return json(403, { ok: false, error: 'csrf' });

    if (route === 'logout' && method === 'POST') return json(200, { ok: true }, { 'Set-Cookie': cookie('', 0) });

    let body = {};
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      try { body = JSON.parse((await req.text(300000)) || '{}'); } catch { return json(400, { ok: false }); }
      if (!body || typeof body !== 'object') return json(400, { ok: false });
    }
    const content = await getContent();
    const saveContent = (c) => store.set('content', c);

    if (route === 'dashboard' && method === 'GET') return json(200, { ok: true, ...(await dashboard(content)) });
    if (route === 'content' && method === 'GET') return json(200, { ok: true, content, themes: THEMES, theme: pickTheme(content.site.theme), canBuildCv: local });
    if (route === 'content' && method === 'PUT') {
      const next = cleanContent(body, content);
      await saveContent(next);
      return json(200, { ok: true, content: next });
    }
    if (route === 'theme' && method === 'POST') {
      if (!Object.prototype.hasOwnProperty.call(THEMES, body.theme)) return json(422, { ok: false });
      content.site.theme = body.theme;
      await saveContent(content);
      return json(200, { ok: true, theme: body.theme });
    }
    if (route === 'cv-pdf' && method === 'POST') return buildCv();
    if (route === 'publish' && method === 'POST') return publish();
    if (route === 'stats' && method === 'DELETE') { await store.set('stats', {}); return json(200, { ok: true }); }

    if (route === 'password' && method === 'POST') {
      const current = typeof body.current === 'string' ? body.current.slice(0, 200) : '';
      const next = typeof body.next === 'string' ? body.next : '';
      if (!crypto.timingSafeEqual(hash(current, admin.salt), Buffer.from(admin.hash, 'hex'))) return json(422, { ok: false, error: 'current' });
      if (next.length < 10 || next.length > 200) return json(422, { ok: false, error: 'weak' });
      const updated = { ...newAccount(next), user: admin.user };
      await store.set('admin', updated);
      if (FIRST_PW) fs.rmSync(FIRST_PW, { force: true });
      // As outras sessões deixam de valer; esta recebe um cookie novo.
      const s = issueSession(updated);
      return json(200, { ok: true, csrf: s.data.csrf }, { 'Set-Cookie': cookie(s.token, SESSION_MS / 1000) });
    }

    if (route === 'projects' && method === 'POST') {
      const p = cleanProject(body, content.categories);
      if (!p) return json(422, { ok: false, error: 'validation' });
      const base = p.slug || slugify(p.title.pt) || 'projeto';
      let slug = base;
      for (let n = 2; content.projects.some((x) => x.slug === slug); n += 1) slug = `${base}-${n}`;
      p.slug = slug;
      content.projects.push(p);
      await saveContent(content);
      return json(201, { ok: true, project: p });
    }
    const pm = route.match(/^projects\/([a-z0-9-]+)$/);
    if (pm) {
      const i = content.projects.findIndex((x) => x.slug === pm[1]);
      if (i < 0) return json(404, { ok: false });
      if (method === 'PUT') {
        const p = cleanProject({ images: content.projects[i].images, ...body, slug: pm[1] }, content.categories);
        if (!p) return json(422, { ok: false, error: 'validation' });
        content.projects[i] = p;
        await saveContent(content);
        return json(200, { ok: true, project: p });
      }
      if (method === 'DELETE') {
        content.projects.splice(i, 1);
        await saveContent(content);
        return json(200, { ok: true });
      }
    }

    // REPLY_GMAIL (.env): a conta Gmail onde se escrevem as respostas. Sem ela, usa o programa de email do computador.
    if (route === 'messages' && method === 'GET') return json(200, { ok: true, messages: await purgeOldMessages(), replyGmail: str(env.REPLY_GMAIL, 120) });
    const mm = route.match(/^messages\/([a-f0-9-]{36})$/);
    if (mm) {
      const all = await store.get('messages', []);
      const i = all.findIndex((m) => m.id === mm[1]);
      if (i < 0) return json(404, { ok: false });
      if (method === 'PATCH') { all[i].read = body.read === true; await store.set('messages', all); return json(200, { ok: true, message: all[i] }); }
      if (method === 'DELETE') { all.splice(i, 1); await store.set('messages', all); return json(200, { ok: true }); }
    }

    return json(404, { ok: false });
  }

  return { handle, getAdmin };
};
