// Função do Netlify: gera as páginas e responde às APIs com o mesmo núcleo do servidor local.
// Os ficheiros de public/ (CSS, JS, fontes, PDF, backoffice) são servidos diretamente pelo Netlify.
import appModule from '../../lib/app.js';
import storeModule from '../../lib/store.js';

const { createApp } = appModule;
const { blobStore } = storeModule;

const safeDecode = (p) => { try { return decodeURIComponent(p); } catch { return p; } };

let appPromise;
function getApp(siteUrl) {
  if (!appPromise) {
    appPromise = blobStore().then((store) => createApp({
      store,
      siteUrl: process.env.SITE_URL || siteUrl,
      local: false,
    }));
  }
  return appPromise;
}

export default async (req, context) => {
  const url = new URL(req.url);
  const app = await getApp(process.env.URL || url.origin);
  const headers = Object.fromEntries(req.headers);
  const request = {
    method: req.method,
    path: safeDecode(url.pathname),
    query: url.searchParams,
    headers,
    ip: context.ip || headers['x-nf-client-connection-ip'] || '',
    async text(limit) {
      const body = await req.text();
      if (body.length > limit) throw new Error('too large');
      return body;
    },
  };
  const out = (await app.handle(request)) || (await app.notFound(request));
  return new Response(req.method === 'HEAD' || out.status === 302 ? null : out.body, { status: out.status, headers: out.headers });
};

// Os ficheiros estáticos têm prioridade; tudo o resto passa por esta função.
export const config = { path: ['/', '/*'], preferStatic: true };
