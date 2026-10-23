'use strict';
// Onde ficam os dados que mudam (conteúdos, mensagens, conta, estatísticas).
// Localmente: ficheiros JSON numa pasta. No Netlify: Netlify Blobs.

const fs = require('fs');
const path = require('path');

function fileStore(dir) {
  fs.mkdirSync(dir, { recursive: true });
  const file = (key) => path.join(dir, `${key}.json`);
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
  };
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
  };
}

// Usa o armazenamento remoto só para algumas chaves (por exemplo, mensagens e estatísticas).
function splitStore(local, remote, remoteKeys) {
  const pick = (key) => (remoteKeys.includes(key) ? remote : local);
  return {
    kind: `${local.kind} + ${remote.kind}`,
    get: (key, fallback) => pick(key).get(key, fallback),
    set: (key, value) => pick(key).set(key, value),
  };
}

module.exports = { fileStore, blobStore, remoteBlobStore, splitStore };
