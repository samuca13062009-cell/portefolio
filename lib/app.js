'use strict';
// Núcleo do site, igual no servidor local (server.js) e no Netlify (netlify/functions/site.mjs).
// Recebe um pedido simplificado e devolve { status, headers, body }.

const crypto = require('crypto');
const { renderer, ROUTES, CV_PDF, esc } = require('./render');
const createAdmin = require('./admin');
const { PRIVACY_VERSION } = require('./legal');
const SEED_CONTENT = require('../data/content.json');

const RETENTION_DAYS = 365;
const CONFIRM_MS = 48 * 3600000;
const { checkEmail, spamReason } = require('./spam');
const STATS_DAYS = 400;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const EMAIL_OK = (v) => typeof v === 'string' && /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/.test(v.trim());

const SECURITY = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; script-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
};

// Limites de pedidos (configuráveis no ambiente, para os testes); os valores por omissão são os de sempre.
const envInt = (env, name, fallback) => {
  const n = Number(env[name]);
  return Number.isInteger(n) && n > 0 ? n : fallback;
};
// Uma chave de limite não pode ter mais tentativas guardadas do que isto: acima, conta como bloqueada.
const RL_MAX_KEYS = 200;
// As tentativas guardadas apagam-se quando passam deste tempo (o Netlify Blobs não apaga sozinho).
const RL_KEEP_MS = 900000;
// Visitantes únicos guardados por dia, no máximo.
const VISITORS_MAX = 5000;

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
  const RL = {
    contact: [envInt(env, 'RL_CONTACT_MAX', 5), envInt(env, 'RL_CONTACT_WINDOW_MS', 600000)],
    confirm: [envInt(env, 'RL_CONFIRM_MAX', 10), envInt(env, 'RL_CONFIRM_WINDOW_MS', 600000)],
    confirmGet: [envInt(env, 'RL_CONFIRM_GET_MAX', 60), envInt(env, 'RL_CONFIRM_GET_WINDOW_MS', 600000)],
  };
  const MSGS_MAX_BYTES = envInt(env, 'MSGS_MAX_BYTES', 5 * 1024 * 1024);
  // IP de quem pede, para os limites. Sem IP, não se juntam todos num balde sem limite: usam um
  // balde comum, o que mantém o limite apertado (mais vale bloquear do que deixar passar).
  const ipOf = (req) => {
    if (req.ip) return req.ip;
    console.warn('Pedido sem endereço IP: usa o limite comum "sem-ip".');
    return 'sem-ip';
  };

  // ---------- Respostas ----------
  const reply = (status, body, headers = {}) => ({ status, body, headers: { ...headersBase, ...headers } });
  const html = (status, body) => reply(status, body, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
  const json = (status, obj, extra = {}) => reply(status, JSON.stringify(obj), { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra });
  const text = (status, body, type = 'text/plain; charset=utf-8') => reply(status, body, { 'Content-Type': type });

  // ---------- Dados ----------
  // No Netlify os conteúdos vêm sempre de data/content.json (editado no backoffice deste computador
  // e publicado com git push); localmente, do ficheiro que o backoffice grava.
  const getContent = async () => (local ? store.get('content', SEED_CONTENT) : SEED_CONTENT);

  // Estatísticas sem cookies de visitante: visualizações por página e visitantes únicos por dia.
  // Um visitante é reconhecido só nesse dia por um código cifrado (IP + navegador + segredo do dia);
  // o segredo muda todos os dias e os códigos do dia anterior são apagados, por isso não dá para seguir
  // ninguém nem recuperar o IP. Não contam: o servidor local, robôs e ferramentas, pré-carregamentos
  // do navegador e navegadores marcados pelo dono (cookie nao-contar).
  const BOTS = /bot|crawl|spider|slurp|preview|headless|lighthouse|pagespeed|curl|wget|python|node-fetch|undici|axios|go-http|java\/|okhttp|facebookexternalhit|whatsapp|telegram|discord|slack/i;
  function isRealVisit(req) {
    const h = req.headers;
    const ua = h['user-agent'] || '';
    if (local || req.method !== 'GET') return false;
    if (BOTS.test(ua) || !/mozilla/i.test(ua)) return false;
    // Prova de que é um navegador a abrir a página: os navegadores mandam sempre estes cabeçalhos
    // ao navegar; programas que só copiam o nome do navegador normalmente não.
    if (h['sec-fetch-mode'] !== 'navigate' || h['sec-fetch-dest'] !== 'document' || !/text\/html/.test(h.accept || '')) return false;
    if (/prefetch|prerender/i.test(`${h['sec-purpose'] || ''} ${h.purpose || ''} ${h['x-moz'] || ''}`)) return false;
    if (/(?:^|;\s*)(?:sid|nao-contar)=/.test(h.cookie || '')) return false;
    return true;
  }

  async function countVisit(key, req) {
    if (!isRealVisit(req)) return;
    try {
      const day = new Date().toISOString().slice(0, 10);
      let today = await store.get('visitors', null);
      if (!today || today.day !== day) today = { day, salt: crypto.randomBytes(16).toString('hex'), ids: [] };
      const id = crypto.createHash('sha256').update(`${today.salt}|${req.ip}|${req.headers['user-agent'] || ''}`).digest('hex').slice(0, 16);
      // Acima de VISITORS_MAX visitantes no mesmo dia, já não se guardam códigos novos (nem se contam como novos).
      const isNew = !today.ids.includes(id) && today.ids.length < VISITORS_MAX;
      if (isNew) { today.ids.push(id); await store.set('visitors', today); }
      const stats = await store.get('stats', {});
      stats[day] = stats[day] || {};
      stats[day][key] = (stats[day][key] || 0) + 1;
      if (isNew) stats[day]['#visitantes'] = (stats[day]['#visitantes'] || 0) + 1;
      const oldest = new Date(Date.now() - STATS_DAYS * 86400000).toISOString().slice(0, 10);
      for (const d of Object.keys(stats)) if (d < oldest) delete stats[d];
      await store.set('stats', stats);
    } catch (e) { console.error('Estatísticas:', e.message); }
  }

  // Limite de pedidos por IP, guardado no armazenamento para funcionar também sem servidor contínuo.
  // mode: 'hit' conta este pedido (por omissão), 'check' só verifica, 'clear' esquece as tentativas.
  //
  // Cada tentativa é uma chave própria, rl:<id>:<instante>:<8 hex>, por isso nenhum pedido apaga o
  // registo de outro. Em 'hit', a tentativa é escrita ANTES de contar e só passa se, depois de escrita,
  // houver no máximo `max` tentativas na janela; se ficar bloqueada, apaga a sua. Assim nunca passam
  // mais de `max`, mesmo com pedidos ao mesmo tempo: o pedido que acaba de escrever em (max+1).º lugar
  // já vê as `max` anteriores. (Contar primeiro e escrever depois deixava passar todos de uma vez.)
  // Se o armazenamento falhar, bloqueia: mais vale recusar do que deixar o formulário sem limite.
  async function rateLimited(key, max, windowMs, mode = 'hit') {
    try {
      // HMAC com um segredo aleatório deste site: o IP não fica guardado nem é recuperável.
      const id = crypto.createHmac('sha256', await siteSecret()).update(key).digest('hex').slice(0, 32);
      const prefix = `rl:${id}:`;
      let mine = null;
      if (mode === 'hit') {
        mine = `${prefix}${Date.now()}:${crypto.randomBytes(4).toString('hex')}`;
        await store.set(mine, 1);
      }
      const keys = await store.list({ prefix, limit: RL_MAX_KEYS });
      if (keys.length > RL_MAX_KEYS) {
        console.error(`Limite de pedidos: mais de ${RL_MAX_KEYS} tentativas guardadas para uma chave; a bloquear.`);
        return true;
      }
      const now = Date.now();
      const keepMs = Math.max(RL_KEEP_MS, windowMs);
      let inWindow = 0;
      for (const k of keys) {
        const ts = Number(k.slice(prefix.length).split(':')[0]);
        if (mode === 'clear' || !Number.isFinite(ts) || now - ts >= keepMs) { await store.del(k); continue; }
        if (now - ts < windowMs) inWindow += 1;
      }
      if (mode === 'clear') return false;
      if (mode === 'check') return inWindow >= max;
      const blocked = inWindow > max;
      if (blocked) await store.del(mine);
      return blocked;
    } catch (e) {
      console.error('ERRO no limite de pedidos (a bloquear por segurança):', e.message);
      return true;
    }
  }

  // Mensagens confirmadas ficam 12 meses; as por confirmar, 48 horas; as bloqueadas como spam, 30 dias.
  async function purgeOldMessages() {
    const all = await store.get('messages', []);
    const now = Date.now();
    const keepFor = (m) => (m.status === 'por-confirmar' ? CONFIRM_MS : m.status === 'spam' ? 30 * 86400000 : RETENTION_DAYS * 86400000);
    const kept = all.filter((m) => now - Date.parse(m.date) < keepFor(m));
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

  async function brevoSend({ to, replyTo, subject, html }) {
    const r = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': BREVO.key, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ sender: { email: BREVO.senderEmail, name: BREVO.senderName }, to: [to], replyTo, subject, htmlContent: html }),
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) throw new Error(`Brevo respondeu ${r.status}: ${(await r.text()).slice(0, 200)}`);
  }
  // A mensagem para o dono (só depois de confirmada).
  const sendToOwner = (m) => brevoSend({
    to: { email: BREVO.to },
    replyTo: { email: m.email, name: m.name },
    subject: `[Portefólio] ${m.subject}`,
    html: `<p><strong>Nome:</strong> ${esc(m.name)}<br><strong>Email:</strong> ${esc(m.email)} (confirmado)<br><strong>Assunto:</strong> ${esc(m.subject)}</p><p>${esc(m.message).replace(/\n/g, '<br>')}</p>`,
  });
  // O pedido de confirmação a quem escreveu. Não repete o texto da mensagem, para o formulário não
  // servir para enviar conteúdo a terceiros.
  const sendConfirmation = (m) => {
    const pt = m.lang !== 'en';
    const link = `${SITE_URL}/confirmar/${m.token}`;
    return brevoSend({
      to: { email: m.email, name: m.name },
      subject: pt ? 'Confirme a sua mensagem para Samuel Camargo' : 'Confirm your message to Samuel Camargo',
      html: pt
        ? `<p>Olá ${esc(m.name)},</p><p>Recebi um pedido de contacto no meu portefólio com este email, com o assunto «${esc(m.subject)}». Para a mensagem me chegar, confirme que o email é seu:</p><p><a href="${esc(link)}">Confirmar a mensagem</a></p><p>A ligação vale 48 horas. Se não foi a pessoa que escreveu, ignore este email: a mensagem é apagada e não volta a receber nada.</p><p>Samuel Camargo</p>`
        : `<p>Hello ${esc(m.name)},</p><p>I received a contact request on my portfolio with this email, with the subject “${esc(m.subject)}”. For the message to reach me, please confirm the email is yours:</p><p><a href="${esc(link)}">Confirm the message</a></p><p>The link is valid for 48 hours. If it was not you, ignore this email: the message is deleted and you will not hear from me again.</p><p>Samuel Camargo</p>`,
    });
  };

  // Ficha do formulário: diz quando a página foi aberta, assinada para não poder ser inventada.
  // Um envio menos de 3 segundos depois de abrir a página é de um programa, não de uma pessoa.
  async function siteSecret() {
    let secret = await store.get('secret', null);
    if (!secret) { secret = crypto.randomBytes(32).toString('hex'); await store.set('secret', secret); }
    return secret;
  }
  const sign = async (s) => crypto.createHmac('sha256', await siteSecret()).update(s).digest('hex').slice(0, 32);
  const formToken = async () => { const t = String(Date.now()); return `${t}.${await sign(`form:${t}`)}`; };
  async function formAge(token) {
    const m = /^(\d{13})\.([a-f0-9]{32})$/.exec(typeof token === 'string' ? token : '');
    if (!m || !crypto.timingSafeEqual(Buffer.from(m[2]), Buffer.from(await sign(`form:${m[1]}`)))) return -1;
    return Date.now() - Number(m[1]);
  }

  // Todas as mensagens estão num só valor guardado. Antes de o gravar, garante que não passa de
  // MSGS_MAX_BYTES: tira primeiro as bloqueadas como spam mais antigas e depois as confirmadas já fora
  // do prazo, das mais antigas para as mais recentes. Nunca tira uma por confirmar. Se mesmo assim não
  // couber, devolve null: mais vale recusar mensagens novas do que perder as que já existem.
  function fitMessages(all) {
    const sizeOf = (m) => Buffer.byteLength(JSON.stringify(m)) + 1;
    let total = Buffer.byteLength(JSON.stringify(all));
    if (total <= MSGS_MAX_BYTES) return all;
    const list = all.slice();
    const now = Date.now();
    const dropOldest = (pred) => {
      // A lista está da mais recente para a mais antiga: percorre do fim para o início.
      for (let i = list.length - 1; i >= 0 && total > MSGS_MAX_BYTES; i -= 1) {
        if (pred(list[i])) { total -= sizeOf(list[i]); list.splice(i, 1); }
      }
    };
    dropOldest((m) => m.status === 'spam');
    dropOldest((m) => (!m.status || m.status === 'confirmada') && now - Date.parse(m.date) >= RETENTION_DAYS * 86400000);
    if (total <= MSGS_MAX_BYTES) return list;
    console.error(`ERRO: as mensagens guardadas passam de ${MSGS_MAX_BYTES} bytes e não há nada que se possa tirar. O formulário deixou de aceitar mensagens novas: apaga mensagens no backoffice.`);
    return null;
  }

  // Ordem das verificações (do mais barato para o mais caro). Só gasta uma tentativa do limite um
  // envio que já passou as verificações baratas (passo 7); a consulta de DNS do email (passo 8) fica
  // atrás do limite, para não poder ser usada em massa.
  async function handleContact(req) {
    const [max, windowMs] = RL.contact;
    const key = `contact:${ipOf(req)}`;
    // 1. Só JSON
    if (!(req.headers['content-type'] || '').startsWith('application/json')) return json(415, { ok: false });
    // 2. Já passou do limite? Responde logo, sem gastar nada.
    if (await rateLimited(key, max, windowMs, 'check')) return json(429, { ok: false, error: 'rate' });
    // 3. Corpo do pedido
    let body;
    try { body = JSON.parse(await req.text(10000)); } catch { return json(400, { ok: false }); }
    if (!body || typeof body !== 'object') return json(400, { ok: false });
    // 4 e 5. Programas de spam: campo-armadilha preenchido ou envio rápido demais. Responde como se
    // tivesse corrido bem (sempre com confirm: true, para não revelar se o email está configurado).
    if (body.website) return json(200, { ok: true, confirm: true });
    const age = await formAge(body.t);
    if (age === -1 || age > 86400000) return json(422, { ok: false, error: 'expired' });
    if (age < 3000) return json(200, { ok: true, confirm: true });
    // 6. Campos
    const { data, errors } = validateContact(body);
    if (Object.keys(errors).length) return json(422, { ok: false, error: 'validation', fields: errors });
    // 7. A partir daqui o envio gasta uma tentativa do limite.
    if (await rateLimited(key, max, windowMs, 'hit')) return json(429, { ok: false, error: 'rate' });
    // 8. O email tem de poder receber mensagens: domínio real, não temporário, sem erros de escrita.
    const bad = await checkEmail(data.email);
    if (bad) return json(422, { ok: false, error: bad.error, suggestion: bad.suggestion, fields: { email: true } });

    const all = await purgeOldMessages();
    const sameEmail = all.filter((m) => m.email.toLowerCase() === data.email.toLowerCase() && Date.now() - Date.parse(m.date) < 86400000);
    // A mesma mensagem outra vez (duplo clique, recarregar): não se repete nada.
    if (sameEmail.some((m) => m.message === data.message)) return json(200, { ok: true, confirm: brevoReady && sameEmail.some((m) => m.status === 'por-confirmar') });
    // No máximo 3 pedidos de confirmação por email em 24 horas, para ninguém usar o formulário contra outra pessoa.
    if (sameEmail.filter((m) => m.status === 'por-confirmar').length >= 3) return json(429, { ok: false, error: 'rate' });

    const now = new Date().toISOString();
    const message = {
      id: crypto.randomUUID(), date: now, ...data, lang: body.lang === 'en' ? 'en' : 'pt', read: false,
      consent: { at: now, policy: PRIVACY_VERSION },
    };
    const spam = spamReason(data);
    if (spam) {
      // Fica guardada 30 dias no backoffice (Bloqueadas), sem email para ninguém.
      Object.assign(message, { status: 'spam', spam, delivery: 'bloqueada' });
    } else if (brevoReady) {
      Object.assign(message, { status: 'por-confirmar', token: crypto.randomBytes(16).toString('hex'), delivery: 'por-confirmar' });
    } else {
      Object.assign(message, { status: 'confirmada', delivery: 'brevo-por-configurar' });
    }
    // Vê se cabe ANTES de enviar o email de confirmação (para não mandar uma ligação que não existe).
    const fitted = fitMessages([message, ...all]);
    if (!fitted) return json(503, { ok: false, error: 'full' });
    if (message.status === 'por-confirmar') {
      try { await sendConfirmation(message); } catch (e) {
        console.error(e.message);
        return json(502, { ok: false, error: 'server' });
      }
    }
    try {
      await store.set('messages', fitted);
    } catch (e) {
      console.error('Mensagens:', e.message);
      return json(500, { ok: false, error: 'server' });
    }
    return json(200, { ok: true, confirm: message.status === 'por-confirmar' || Boolean(spam) });
  }

  // Ligação do email de confirmação: confirma, guarda e só então envia a mensagem ao dono.
  async function confirmMessage(token) {
    const all = await purgeOldMessages();
    const m = all.find((x) => x.token && x.token.length === token.length && crypto.timingSafeEqual(Buffer.from(x.token), Buffer.from(token)));
    if (!m) return { state: 'invalid' };
    if (m.status === 'confirmada') return { state: 'done', lang: m.lang };
    m.status = 'confirmada';
    m.confirmedAt = new Date().toISOString();
    m.date = m.confirmedAt;
    // Confirmar não aumenta muito o tamanho, mas se já não couber, não envia nem grava.
    const fitted = fitMessages(all);
    if (!fitted) return { state: 'full', lang: m.lang };
    try { await sendToOwner(m); m.delivery = 'enviado'; } catch (e) { m.delivery = 'falhou'; console.error(e.message); }
    await store.set('messages', fitted);
    return { state: 'ok', lang: m.lang };
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
      // O backoffice só existe no servidor local e só responde a pedidos deste computador.
      if (pathname.startsWith('/api/admin/')) {
        if (!local || !/^(127\.|::1$|::ffff:127\.)/.test(req.ip || '')) return null;
        return await admin.handle(req, pathname.slice('/api/admin/'.length));
      }
      if (pathname === '/api/contact') {
        if (req.method !== 'POST') return json(405, { ok: false });
        return await handleContact(req);
      }
      // Confirmação do email de quem escreveu. A ligação (GET) só mostra um botão; confirmar é um POST,
      // porque os serviços de email abrem as ligações sozinhos para as verificar.
      const conf = pathname.match(/^\/confirmar\/([a-f0-9]{32})$/);
      if (conf) {
        if (req.method !== 'GET' && req.method !== 'POST') return text(405, 'Método não permitido');
        // Limite antes de ler as mensagens: 'check' recusa logo quem já passou do limite sem gastar
        // nada; 'hit' conta este pedido.
        const getKey = `confirm-get:${ipOf(req)}`;
        const [getMax, getWindow] = RL.confirmGet;
        if (await rateLimited(getKey, getMax, getWindow, 'check') || await rateLimited(getKey, getMax, getWindow, 'hit')) return text(429, 'Demasiados pedidos');
        const pending = (await purgeOldMessages()).find((x) => x.token === conf[1]);
        const lang = pending && pending.lang === 'en' ? 'en' : 'pt';
        const page = async (state) => html(state === 'invalid' ? 404 : 200, renderer(await getContent(), lang, SITE_URL, '', {}).confirmPage(state, conf[1]));
        if (!pending) return await page('invalid');
        if (req.method === 'GET') return await page(pending.status === 'confirmada' ? 'done' : 'ask');
        if (await rateLimited(`confirm:${ipOf(req)}`, RL.confirm[0], RL.confirm[1])) return text(429, 'Demasiados pedidos');
        const result = await confirmMessage(conf[1]);
        if (result.state === 'full') return html(503, renderer(await getContent(), lang, SITE_URL, '', {}).serverError(ROUTES[lang].contact));
        return await page(result.state);
      }
      if (req.method !== 'GET' && req.method !== 'HEAD') return text(405, 'Método não permitido');

      // O dono marca os seus navegadores para não contarem nas estatísticas (ligação no backoffice).
      if (pathname === '/nao-contar') {
        return reply(302, '', { Location: '/', 'Cache-Control': 'no-store', 'Set-Cookie': `nao-contar=1; Path=/; Max-Age=63072000; SameSite=Lax; HttpOnly${secure ? '; Secure' : ''}` });
      }

      // Descarga do CV: conta e reencaminha para o PDF estático.
      const dl = pathname.match(/^\/cv\/descarregar\/(pt|en)$/);
      if (dl) {
        await countVisit('cv-pdf', req);
        return reply(302, '', { Location: CV_PDF[dl[1]], 'Cache-Control': 'no-store' });
      }

      const content = await getContent();
      if (pathname === '/robots.txt') return text(200, `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${SITE_URL}/sitemap.xml\n`);
      if (pathname === '/sitemap.xml') return text(200, sitemap(content), 'application/xml; charset=utf-8');

      if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.slice(0, -1);
      const page = matchPage(pathname);
      if (page) {
        const r = renderer(content, page.lang, SITE_URL, req.query.get('tema') || '', { publicEmail: PUBLIC_EMAIL, formToken: page.key === 'contact' ? await formToken() : '' });
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

  return { handle, notFound, serverError, admin, brevoReady, headersBase, countVisit, rateLimited };
}

module.exports = { createApp };
