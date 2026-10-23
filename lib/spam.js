'use strict';
// Verificações do formulário de contacto: o email pode receber mensagens? A mensagem parece spam?
// O envio só chega ao dono depois de a pessoa confirmar no próprio email (ver lib/app.js).

const dns = require('dns').promises;

// Serviços de email temporário (descartáveis): quem os usa não pode receber resposta.
const DISPOSABLE = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org', 'sharklasers.com', 'grr.la',
  '10minutemail.com', '10minutemail.net', 'temp-mail.org', 'temp-mail.io', 'tempmail.com', 'tempmail.net', 'tempmailo.com',
  'yopmail.com', 'yopmail.fr', 'yopmail.net', 'trashmail.com', 'trashmail.de', 'getnada.com', 'nada.email',
  'dispostable.com', 'maildrop.cc', 'throwawaymail.com', 'fakeinbox.com', 'moakt.com', 'emailondeck.com',
  'mintemail.com', 'mohmal.com', 'burnermail.io', 'mailnesia.com', 'mytemp.email', 'tempail.com', 'tempr.email',
  'discard.email', 'spamgourmet.com', 'mailcatch.com', 'inboxkitten.com', 'emailfake.com', 'fakemail.net',
  'mail.tm', 'mail.gw', 'dropmail.me', 'tmpmail.org', 'tmpmail.net', 'linshiyouxiang.net', 'byom.de',
  'spambox.us', 'trbvm.com', 'jetable.org', 'mailpoof.com', 'mvrht.com', 'temporary-mail.net', 'cs.email',
]);

// Erros de escrita frequentes nos domínios mais usados.
const TYPOS = {
  'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gmal.com': 'gmail.com', 'gmali.com': 'gmail.com',
  'gamil.com': 'gmail.com', 'gnail.com': 'gmail.com', 'gmail.co': 'gmail.com', 'gmail.con': 'gmail.com',
  'gmail.pt': 'gmail.com', 'gmaill.com': 'gmail.com', 'gmail.cm': 'gmail.com', 'gmail.om': 'gmail.com',
  'hotmial.com': 'hotmail.com', 'hotmal.com': 'hotmail.com', 'hotmai.com': 'hotmail.com', 'hotmail.con': 'hotmail.com',
  'hotmail.co': 'hotmail.com', 'hotnail.com': 'hotmail.com', 'outlok.com': 'outlook.com', 'outlook.con': 'outlook.com',
  'outloo.com': 'outlook.com', 'outlook.co': 'outlook.com', 'yaho.com': 'yahoo.com', 'yahoo.con': 'yahoo.com',
  'iclod.com': 'icloud.com', 'icloud.con': 'icloud.com', 'sapo.p': 'sapo.pt', 'sapo.com': 'sapo.pt',
};

// Palavras típicas de spam comercial (não de quem quer falar de estágios, emprego ou projetos).
const SPAM_WORDS = /\b(viagra|cialis|casino|porn|xxx|escort|forex|bitcoin investment|crypto investment|backlinks?|guest posts?|seo services?|rank (?:your|higher)|web traffic|increase (?:your )?traffic|loan offer|payday loan|make money (?:fast|online)|work from home and earn|click here to (?:claim|win)|you(?:'ve| have) won)\b/i;

const urlCount = (s) => (s.match(/https?:\/\/|www\.|\b[a-z0-9-]+\.(?:com|net|org|ru|cn|xyz|top|biz|info|io)\/\S*/gi) || []).length;

// O domínio existe e recebe email? (registos MX; sem MX, um registo A também serve, como diz a norma do email).
// O nome do domínio vem de quem preenche o formulário, por isso a consulta tem um tempo máximo de
// DNS_TIMEOUT_MS: um domínio cujo servidor de nomes nunca responde não pode prender o pedido. Se o tempo
// acabar ou houver outro erro inesperado, o email é recusado.
const DNS_TIMEOUT_MS = 3000;
const defaultResolver = new dns.Resolver({ timeout: 1500, tries: 1 });
function withTimeout(promise, ms) {
  let timer;
  return Promise.race([
    promise,
    new Promise((resolve, reject) => { timer = setTimeout(() => reject(Object.assign(new Error('DNS demorou demasiado'), { code: 'ETIMEOUT' })), ms); }),
  ]).finally(() => clearTimeout(timer));
}
async function domainAcceptsMail(domain, resolver = defaultResolver) {
  const deadline = Date.now() + DNS_TIMEOUT_MS;
  const left = () => Math.max(1, deadline - Date.now());
  try {
    const mx = await withTimeout(resolver.resolveMx(domain), left());
    if (mx.some((r) => r.exchange && r.exchange !== '.')) return true;
    if (mx.length) return false; // MX nulo: o domínio declara que não recebe email
  } catch (e) {
    if (e.code === 'ENOTFOUND' || e.code === 'ENODATA') {
      try { return (await withTimeout(resolver.resolve4(domain), left())).length > 0; } catch { return false; }
    }
    return false; // tempo esgotado ou erro inesperado: recusa
  }
  return false;
}

// Devolve um erro para mostrar (o email não serve) ou null.
async function checkEmail(email) {
  const domain = email.split('@').pop().toLowerCase();
  if (TYPOS[domain]) return { error: 'email-typo', suggestion: email.replace(/@[^@]+$/, `@${TYPOS[domain]}`) };
  if (DISPOSABLE.has(domain) || [...DISPOSABLE].some((d) => domain.endsWith(`.${d}`))) return { error: 'email-disposable' };
  if (!(await domainAcceptsMail(domain))) return { error: 'email-domain' };
  return null;
}

// Devolve o motivo se a mensagem parecer spam, ou null.
function spamReason(data) {
  const all = `${data.name} ${data.subject} ${data.message}`;
  if (/https?:\/\/|www\./i.test(`${data.name} ${data.subject}`)) return 'ligação no nome ou assunto';
  if (/\[url=|<a\s+href|\[link=/i.test(all)) return 'ligações em código';
  if (urlCount(data.message) > 2) return 'demasiadas ligações';
  if (SPAM_WORDS.test(all)) return 'palavras de spam';
  if (/(.)\1{14,}/.test(all)) return 'caracteres repetidos';
  const letters = data.message.replace(/[^\p{L}]/gu, '');
  const latin = letters.replace(/[^\p{Script=Latin}]/gu, '');
  if (letters.length > 40 && latin.length / letters.length < 0.5) return 'alfabeto não latino';
  return null;
}

module.exports = { checkEmail, spamReason, urlCount, domainAcceptsMail };
