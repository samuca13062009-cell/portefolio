'use strict';
// Testes do limite de pedidos e das defesas do formulário de contacto.
// Arranca o servidor local (server.js) numa porta livre, com limites curtos e uma pasta de dados
// temporária, sem Brevo e sem Netlify (nenhum email sai e nada online é tocado).
// Correr: node tools/test-ratelimit.js

const { spawn } = require('child_process');
const dns = require('dns');
const fs = require('fs');
const net = require('net');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
let failures = 0;
const check = (name, ok, detail) => {
  console.log(`${ok ? 'PASSOU' : 'FALHOU'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures += 1;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const tally = (statuses) => statuses.reduce((acc, s) => ({ ...acc, [s]: (acc[s] || 0) + 1 }), {});

function freePort() {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.listen(0, '127.0.0.1', () => { const { port } = srv.address(); srv.close(() => resolve(port)); });
  });
}

async function startServer() {
  const port = await freePort();
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'portefolio-teste-'));
  fs.copyFileSync(path.join(ROOT, 'data', 'content.json'), path.join(dataDir, 'content.json'));
  const child = spawn(process.execPath, ['server.js'], {
    cwd: ROOT,
    env: {
      ...process.env,
      PORT: String(port),
      DATA_DIR: dataDir,
      SITE_URL: `http://127.0.0.1:${port}`,
      RL_CONTACT_MAX: '5',
      RL_CONTACT_WINDOW_MS: '5000',
      // Vazios de propósito: o .env não os substitui, por isso não há emails nem acesso ao Netlify.
      BREVO_API_KEY: '', CONTACT_TO: '', NETLIFY_SITE_ID: '', NETLIFY_AUTH_TOKEN: '',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let log = '';
  child.stdout.on('data', (d) => { log += d; });
  child.stderr.on('data', (d) => { log += d; });
  for (let i = 0; i < 100 && !/Portefólio em/.test(log); i += 1) await sleep(100);
  if (!/Portefólio em/.test(log)) throw new Error(`O servidor não arrancou:\n${log}`);
  return { base: `http://127.0.0.1:${port}`, child, dataDir, log: () => log };
}

async function freshToken(base) {
  const page = await (await fetch(`${base}/contacto`)).text();
  const m = /data-t="([^"]+)"/.exec(page);
  if (!m) throw new Error('A página de contacto não tem ficha do formulário (data-t).');
  return m[1];
}

const post = (base, body, type = 'application/json') => fetch(`${base}/api/contact`, {
  method: 'POST', headers: { 'Content-Type': type }, body: typeof body === 'string' ? body : JSON.stringify(body),
});

(async () => {
  const server = await startServer();
  const { base } = server;
  try {
    const t = await freshToken(base);
    await sleep(3200); // a ficha tem de ter pelo menos 3 segundos

    // ---------- Teste A: o limite aguenta pedidos ao mesmo tempo ----------
    const bodyA = { name: 'Test', email: 'x@nonexistent-abc123.invalid', subject: 'Test', message: '0123456789', consent: true, t };
    const resA = await Promise.all(Array.from({ length: 20 }, () => post(base, bodyA)));
    const a = tally(resA.map((r) => r.status));
    check('A: 20 envios simultâneos → 5×422 e 15×429', a[422] === 5 && a[429] === 15, JSON.stringify(a));

    await sleep(5500); // deixa passar a janela de 5 s

    // ---------- Teste B: envios rejeitados não gastam tentativas ----------
    const resB = await Promise.all(Array.from({ length: 20 }, () => post(base, '{"isto não é": json')));
    const b = tally(resB.map((r) => r.status));
    check('B: 20 corpos malformados → só 400/422, nenhum 429', !b[429] && (b[400] || 0) + (b[422] || 0) === 20, JSON.stringify(b));
    const valid = await post(base, { name: 'Ana Teste', email: 'ana.teste@gmail.com', subject: 'Teste', message: 'Mensagem de teste válida.', consent: true, t });
    check('B: a seguir, um envio válido não é 429', valid.status !== 429, `${valid.status} ${await valid.text()}`);

    // ---------- Teste E: sem regressões (pelo servidor) ----------
    const r415 = await post(base, 'a=1', 'text/plain');
    check('E: tipo de conteúdo que não é JSON → 415', r415.status === 415, String(r415.status));
    for (const method of ['GET', 'PUT', 'DELETE']) {
      const r = await fetch(`${base}/api/contact`, { method });
      check(`E: ${method} /api/contact → 405`, r.status === 405, String(r.status));
    }
    const fields = { name: 'Ana Teste', email: 'ana.teste@gmail.com', subject: 'Teste', message: 'Outra mensagem de teste.', consent: true };
    const noT = await post(base, fields);
    check('E: sem ficha (t) → 422 expired', noT.status === 422 && (await noT.json()).error === 'expired');
    const badT = await post(base, { ...fields, t: `${Date.now() - 10000}.${'0'.repeat(32)}` });
    check('E: ficha inválida → 422 expired', badT.status === 422 && (await badT.json()).error === 'expired');
    const hp = await post(base, { ...fields, t, website: 'http://spam.example' });
    const hpBody = await hp.json();
    check('E: campo-armadilha → {ok:true, confirm:true}', hp.status === 200 && hpBody.ok === true && hpBody.confirm === true, JSON.stringify(hpBody));
  } finally {
    server.child.kill();
    fs.rmSync(server.dataDir, { recursive: true, force: true });
  }

  // ---------- Teste C: o limite falha fechado ----------
  {
    const { createApp } = require(path.join(ROOT, 'lib', 'app'));
    const broken = {
      kind: 'avariado',
      async get(key, fallback) { if (key === 'secret') return 'a'.repeat(64); return fallback; },
      async set() { throw new Error('armazenamento avariado (teste)'); },
      async list() { throw new Error('armazenamento avariado (teste)'); },
      async del() { throw new Error('armazenamento avariado (teste)'); },
    };
    const app = createApp({ store: broken, siteUrl: 'https://exemplo.test', local: false, env: {} });
    const quiet = console.error;
    console.error = () => {};
    const hit = await app.rateLimited('teste', 5, 60000, 'hit');
    const chk = await app.rateLimited('teste', 5, 60000, 'check');
    const res = await app.handle({
      method: 'POST', path: '/api/contact', query: new URLSearchParams(), ip: '203.0.113.9',
      headers: { 'content-type': 'application/json' }, text: async () => '{}',
    });
    console.error = quiet;
    check('C: com o armazenamento avariado, rateLimited devolve true (hit e check)', hit === true && chk === true, `hit=${hit} check=${chk}`);
    check('C: e /api/contact responde 429 ou 503', res.status === 429 || res.status === 503, String(res.status));
  }

  // ---------- Teste E (cont.): o campo-armadilha não chama o Brevo ----------
  {
    const { createApp } = require(path.join(ROOT, 'lib', 'app'));
    const { fileStore } = require(path.join(ROOT, 'lib', 'store'));
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'portefolio-teste-'));
    const realFetch = global.fetch;
    let brevoCalls = 0;
    global.fetch = async () => { brevoCalls += 1; return { ok: true, status: 201, text: async () => '' }; };
    try {
      const app = createApp({ store: fileStore(dir), siteUrl: 'https://exemplo.test', local: false, env: { BREVO_API_KEY: 'k', BREVO_SENDER_EMAIL: 's@exemplo.test', CONTACT_TO: 'd@exemplo.test' } });
      const res = await app.handle({
        method: 'POST', path: '/api/contact', query: new URLSearchParams(), ip: '203.0.113.10',
        headers: { 'content-type': 'application/json' },
        text: async () => JSON.stringify({ website: 'x', name: 'Bot', email: 'bot@gmail.com', subject: 'Oi', message: 'Compre agora, já!', consent: true }),
      });
      check('E: campo-armadilha com Brevo configurado → {ok:true} sem chamar o Brevo', res.status === 200 && JSON.parse(res.body).ok === true && brevoCalls === 0, `estado=${res.status} chamadas ao Brevo=${brevoCalls}`);
    } finally {
      global.fetch = realFetch;
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }

  // ---------- Teste D: a consulta de DNS tem tempo máximo ----------
  {
    const { domainAcceptsMail } = require(path.join(ROOT, 'lib', 'spam'));
    const never = { resolveMx: () => new Promise(() => {}), resolve4: () => new Promise(() => {}) };
    let t0 = Date.now();
    const r1 = await domainAcceptsMail('nunca-responde.example', never);
    const ms1 = Date.now() - t0;
    check('D: servidor de nomes que nunca responde → false em menos de 4000 ms', r1 === false && ms1 < 4000, `${r1} em ${ms1} ms`);
    // Também com um resolvedor real apontado para um endereço que não responde (192.0.2.1, TEST-NET-1).
    const blackhole = new dns.promises.Resolver({ timeout: 10000, tries: 3 });
    blackhole.setServers(['192.0.2.1']);
    t0 = Date.now();
    const r2 = await domainAcceptsMail('exemplo-buraco-negro.com', blackhole);
    const ms2 = Date.now() - t0;
    check('D: resolvedor real sem resposta (192.0.2.1) → false em menos de 4000 ms', r2 === false && ms2 < 4000, `${r2} em ${ms2} ms`);
  }

  console.log(failures ? `\n${failures} teste(s) falharam.` : '\nTodos os testes passaram.');
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
