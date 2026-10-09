'use strict';
// Gera os PDF do CV (PT e EN) a partir das páginas /cv/imprimir e /en/cv/print,
// usando o Chrome ou o Edge em modo headless. Correr com: npm run cv

const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'public', 'cv');
const PORT = 4199;

const BROWSERS = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);

const browser = BROWSERS.find((b) => fs.existsSync(b));
if (!browser) {
  console.error('Chrome ou Edge não encontrado. Define CHROME_PATH com o caminho do navegador.');
  process.exit(1);
}

fs.mkdirSync(OUT, { recursive: true });
const server = spawn(process.execPath, [path.join(ROOT, 'server.js')], {
  env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore',
});

const jobs = [
  ['/cv/imprimir', 'samuel-camargo-cv-pt.pdf'],
  ['/en/cv/print', 'samuel-camargo-cv-en.pdf'],
];

setTimeout(() => {
  let failed = false;
  for (const [route, file] of jobs) {
    const target = path.join(OUT, file);
    spawnSync(browser, [
      '--headless=new', '--disable-gpu', '--no-pdf-header-footer',
      '--virtual-time-budget=8000', `--print-to-pdf=${target}`,
      `http://localhost:${PORT}${route}`,
    ], { stdio: 'ignore' });
    if (fs.existsSync(target)) console.log('Criado', path.relative(ROOT, target));
    else { failed = true; console.error('Falhou', file); }
  }
  server.kill();
  process.exit(failed ? 1 : 0);
}, 1200);
