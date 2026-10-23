'use strict';
// Onde ficam os dados que mudam (conteúdos, mensagens, conta, estatísticas).
// Localmente: ficheiros JSON numa pasta. No Netlify: Netlify Blobs.
// Todos têm get, set, list({ prefix, limit }) e del. list devolve os nomes das chaves com esse prefixo;
// com limit, pára de procurar ao passar esse número (para limitar o trabalho).

const fs = require('fs');
const path = require('path');

function fileStore(dir) {
  fs.mkdirSync(dir, { recursive: true });
  // O nome do ficheiro é a chave codificada: o Windows não aceita ":" em nomes de ficheiros.
  const file = (key) => path.join(dir, `${encodeURIComponent(key)}.json`);
  return {
    kind: 'ficheiros',
    async get(key, fallback) {
      try { return JSON.parse(fs.readFileSync(file(key), 'utf8')); } catch { return fallback; }
    },
    // Escreve para um ficheiro temporário e só depois substitui, para nunca deixar JSON a meio.
    async set(key, value) {
      const tmp = `${file(key)}.${process.pid}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(value, null, 2));
      fs.renameSync(tmp, file(key));
    },
    async list({ prefix = '', limit = Infinity } = {}) {
      const keys = [];
      for (const name of fs.readdirSync(dir)) {
        if (!name.endsWith('.json')) continue;
        let key;
        try { key = decodeURIComponent(name.slice(0, -5)); } catch { continue; }
        if (!key.startsWith(prefix)) continue;
        keys.push(key);
        if (keys.length > limit) break;
      }
      return keys;
    },
    async del(key) { fs.rmSync(file(key), { force: true }); },
  };
}

// Percorre a listagem do Netlify Blobs página a página (paginate: true) e pára ao passar o limite.
// Sem paginate, a biblioteca juntaria todas as páginas antes de devolver, sem limite de trabalho.
async function listBlobs(store, prefix, limit) {
  const keys = [];
  for await (const page of store.list({ prefix, paginate: true })) {
    for (const b of page.blobs) {
      keys.push(b.key);
      if (keys.length > limit) return keys;
    }
  }
  return keys;
}

async function blobStore() {
  const { getStore } = await import('@netlify/blobs');
  const store = getStore({ name: 'portefolio', consistency: 'strong' });
  return {
    kind: 'netlify-blobs',
    async get(key, fallback) {
      const value = await store.get(key, { type: 'json' });
      return value == null ? fallback : value;
    },
    async set(key, value) { await store.setJSON(key, value); },
    list: ({ prefix = '', limit = Infinity } = {}) => listBlobs(store, prefix, limit),
    async del(key) { await store.delete(key); },
  };
}

// Netlify Blobs do site publicado, acedido a partir deste computador com um token pessoal.
function remoteBlobStore({ siteID, token }) {
  let storePromise;
  const open = () => (storePromise = storePromise || import('@netlify/blobs').then(({ getStore }) => getStore({ name: 'portefolio', siteID, token, consistency: 'strong' })));
  return {
    kind: 'netlify-blobs-remoto',
    async get(key, fallback) {
      const value = await (await open()).get(key, { type: 'json' });
      return value == null ? fallback : value;
    },
    async set(key, value) { await (await open()).setJSON(key, value); },
    async list({ prefix = '', limit = Infinity } = {}) { return listBlobs(await open(), prefix, limit); },
    async del(key) { await (await open()).delete(key); },
  };
}

// Usa o armazenamento remoto só para algumas chaves (por exemplo, mensagens e estatísticas).
// Uma listagem vai ao remoto só se o prefixo for o de uma dessas chaves.
function splitStore(local, remote, remoteKeys) {
  const pick = (key) => (remoteKeys.includes(key) ? remote : local);
  const pickPrefix = (prefix = '') => (remoteKeys.some((k) => prefix && k.startsWith(prefix)) || remoteKeys.some((k) => prefix.startsWith(k)) ? remote : local);
  return {
    kind: `${local.kind} + ${remote.kind}`,
    get: (key, fallback) => pick(key).get(key, fallback),
    set: (key, value) => pick(key).set(key, value),
    list: (options = {}) => pickPrefix(options.prefix).list(options),
    del: (key) => pick(key).del(key),
  };
}

module.exports = { fileStore, blobStore, remoteBlobStore, splitStore };
