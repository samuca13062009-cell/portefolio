// Gera a identidade "Sinal" de Samuel Camargo em brand/svg (vetores) e brand/png (via Edge/Chrome sem janela).
// Regra do desenho: metade de cima redonda (analógico, som), metade de baixo em ângulo reto (digital, código).
// O S do símbolo traz um C na metade de cima: as duas iniciais num só traço.
// Uso: node tools/make-brand.js            (só SVG)
//      node tools/make-brand.js --png      (SVG + PNG + favicon.ico)
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const OUT = path.join(__dirname, '..', 'brand');
const C = {
  midnight: '#0A1030', deep: '#111A45', ink: '#E7ECF5', cyan: '#2EE6FF', orange: '#FF7A3D',
  paper: '#F3F0E8', paperInk: '#12162E', cyanLight: '#006C8F', black: '#000000', white: '#FFFFFF',
};

// ---------- símbolo (caixa 100 x 100, traço 16) ----------
const SYMBOL_D = 'M64.55 17.79A19 19 0 1 0 50 49H69V87H33';
const SYMBOL_SW = 16;
// versão para tamanhos minúsculos: mais grossa e mais aberta
const FAV_D = 'M66.2 19.2A19 19 0 1 0 50 49H69V85H31';
const FAV_SW = 19;

// ---------- logótipo desenhado (linha de base y=35.5, altura-x 31 em eixo, traço 9) ----------
const WSW = 9;
const G = {
  s: { w: 22, d: 'M20.08 7.8A11 7.75 0 1 0 11 20H22V35.5H1.5' },
  a: { w: 26, d: 'M2.35 10.04A13 13 0 0 1 26 17.5V35.5H0V21.5H26' },
  m: { w: 36, d: 'M0 35.5V13.5A9 9 0 0 1 18 13.5V35.5M18 13.5A9 9 0 0 1 36 13.5V35.5' },
  u: { w: 26, d: 'M0 4.5V35.5H26V4.5' },
  e: { w: 26, d: 'M0 21.5H26V17.5A13 13 0 0 0 0 17.5V35.5H25' },
  l: { w: 0, d: 'M0 -12V35.5' },
  c: { w: 26, d: 'M23.65 10.04A13 13 0 0 0 0 17.5V35.5H26' },
  r: { w: 18.66, d: 'M0 35.5V14.5A10 10 0 0 1 18.66 9.5' },
  g: { w: 26, d: 'M26 35.5H0V17.5A13 13 0 0 1 26 17.5V52H1.5' },
  o: { w: 26, d: 'M0 17.5A13 13 0 0 1 26 17.5V35.5H0Z' },
};
const GAP = 18, SPACE = 37;
function word(text) {
  let x = 0; const parts = [];
  for (const ch of text) {
    if (ch === ' ') { x += SPACE - GAP; continue; }
    const g = G[ch];
    parts.push(`<path transform="translate(${+x.toFixed(2)} 0)" d="${g.d}"/>`);
    x += g.w + (ch === 'r' ? GAP - 3 : GAP);
  }
  return { body: parts.join(''), width: x - GAP };
}
const WM = word('samuel camargo');
// caixa do logótipo com o traço incluído
const WM_BOX = { x: -WSW / 2, y: -12 - WSW / 2, w: WM.width + WSW, h: 52 + 12 + WSW };

const stroke = (col, sw) => `fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10"`;
const symbolG = (col, d = SYMBOL_D, sw = SYMBOL_SW) => `<path d="${d}" ${stroke(col, sw)}/>`;
const wordG = (col) => `<g ${stroke(col, WSW)}>${WM.body}</g>`;
const svg = (vb, inner, title, w, h) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(' ')}" width="${w}" height="${h}" role="img" aria-label="${title}"><title>${title}</title>${inner}</svg>\n`;

// ---------- composições ----------
function symbolFile(col, bg) {
  // traço ocupa x 23..77 e y 3..95: caixa 120 x 120 centrada nele, com margem de respiro
  const vb = [-10, -11, 120, 120];
  const inner = (bg ? `<rect x="-10" y="-11" width="120" height="120" fill="${bg}"/>` : '') + symbolG(col);
  return svg(vb, inner, 'Samuel Camargo', 512, 512);
}
function wordmarkFile(col, bg) {
  const p = 24; const vb = [WM_BOX.x - p, WM_BOX.y - p, WM_BOX.w + 2 * p, WM_BOX.h + 2 * p];
  const inner = (bg ? `<rect x="${vb[0]}" y="${vb[1]}" width="${vb[2]}" height="${vb[3]}" fill="${bg}"/>` : '') + wordG(col);
  return svg(vb, inner, 'Samuel Camargo', Math.round(vb[2] * 2), Math.round(vb[3] * 2));
}
// horizontal: símbolo da altura do ascendente ao descendente, separado por 1,25 alturas-x
function horizontalFile(symCol, wordCol, bg) {
  const s = WM_BOX.h / 92; // o símbolo ocupa 92 unidades (3..95) com o traço
  const symW = 54 * s; // largura visível 23..77
  const gapX = 40;
  const sx = 0, sy = WM_BOX.y;
  const wx = symW + gapX - WM_BOX.x;
  const W = symW + gapX + WM_BOX.w, H = WM_BOX.h, p = 32;
  const vb = [-p, sy - p, W + 2 * p, H + 2 * p];
  const inner = (bg ? `<rect x="${vb[0]}" y="${vb[1]}" width="${vb[2]}" height="${vb[3]}" fill="${bg}"/>` : '') +
    `<g transform="translate(${(sx - 23 * s).toFixed(2)} ${(sy - 3 * s).toFixed(2)}) scale(${s.toFixed(4)})">${symbolG(symCol)}</g>` +
    `<g transform="translate(${wx.toFixed(2)} 0)">${wordG(wordCol)}</g>`;
  return svg(vb, inner, 'Samuel Camargo', Math.round(vb[2] * 2), Math.round(vb[3] * 2));
}
function stackedFile(symCol, wordCol, bg) {
  const s = 1.9; const symW = 54 * s, symH = 92 * s; const gapY = 44;
  const W = Math.max(symW, WM_BOX.w); const p = 40;
  const symX = (W - symW) / 2 - 23 * s, symY = -3 * s;
  const wy = symH + gapY - WM_BOX.y, wx = (W - WM_BOX.w) / 2 - WM_BOX.x;
  const H = symH + gapY + WM_BOX.h;
  const vb = [-p, -p, W + 2 * p, H + 2 * p];
  const inner = (bg ? `<rect x="${vb[0]}" y="${vb[1]}" width="${vb[2]}" height="${vb[3]}" fill="${bg}"/>` : '') +
    `<g transform="translate(${symX.toFixed(2)} ${symY.toFixed(2)}) scale(${s})">${symbolG(symCol)}</g>` +
    `<g transform="translate(${wx.toFixed(2)} ${wy.toFixed(2)})">${wordG(wordCol)}</g>`;
  return svg(vb, inner, 'Samuel Camargo', Math.round(vb[2] * 2), Math.round(vb[3] * 2));
}
function faviconFile() {
  const inner = `<rect width="100" height="100" rx="22" fill="${C.midnight}"/>` +
    `<g transform="translate(50 50) scale(0.82) translate(-50 -50)">${symbolG(C.cyan, FAV_D, FAV_SW)}</g>`;
  return svg([0, 0, 100, 100], inner, 'Samuel Camargo', 32, 32);
}

const files = {
  // principal
  'logo-horizontal-dark.svg': horizontalFile(C.cyan, C.ink, C.midnight),
  'logo-horizontal-light.svg': horizontalFile(C.cyanLight, C.paperInk, C.paper),
  'logo-horizontal-on-dark-transparent.svg': horizontalFile(C.cyan, C.ink),
  'logo-horizontal-on-light-transparent.svg': horizontalFile(C.cyanLight, C.paperInk),
  'logo-horizontal-black.svg': horizontalFile(C.black, C.black),
  'logo-horizontal-white.svg': horizontalFile(C.white, C.white),
  'logo-stacked-dark.svg': stackedFile(C.cyan, C.ink, C.midnight),
  'logo-stacked-black.svg': stackedFile(C.black, C.black),
  'logo-stacked-white.svg': stackedFile(C.white, C.white),
  // símbolo
  'symbol-dark.svg': symbolFile(C.cyan, C.midnight),
  'symbol-cyan.svg': symbolFile(C.cyan),
  'symbol-midnight.svg': symbolFile(C.midnight),
  'symbol-black.svg': symbolFile(C.black),
  'symbol-white.svg': symbolFile(C.white),
  // logótipo
  'wordmark-black.svg': wordmarkFile(C.black),
  'wordmark-white.svg': wordmarkFile(C.white),
  'wordmark-ink.svg': wordmarkFile(C.paperInk),
  // favicon
  'favicon.svg': faviconFile(),
};

fs.mkdirSync(path.join(OUT, 'svg'), { recursive: true });
for (const [name, body] of Object.entries(files)) fs.writeFileSync(path.join(OUT, 'svg', name), body);
console.log(`SVG: ${Object.keys(files).length} ficheiros em brand/svg`);

// Exporta também os caminhos para quem precisar (canvas, site)
fs.writeFileSync(path.join(OUT, 'geometry.json'), JSON.stringify({ symbol: { d: SYMBOL_D, sw: SYMBOL_SW, viewBox: '0 0 100 100' }, favicon: { d: FAV_D, sw: FAV_SW }, wordmark: { sw: WSW, box: WM_BOX, glyphs: G, gap: GAP, space: SPACE, body: WM.body }, colors: C }, null, 2));

if (!process.argv.includes('--png')) process.exit(0);

// ---------- PNG via browser sem janela ----------
const browsers = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'];
const BROWSER = browsers.find((b) => fs.existsSync(b));
if (!BROWSER) { console.error('Sem Edge/Chrome para exportar PNG.'); process.exit(1); }
const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'brand-'));
fs.mkdirSync(path.join(OUT, 'png'), { recursive: true });
let job = 0;
function render(svgName, outName, w, h) {
  job++;
  const html = path.join(tmp, `r${job}.html`);
  const src = 'file:///' + path.join(OUT, 'svg', svgName).replace(/\\/g, '/');
  fs.writeFileSync(html, `<!doctype html><html><head><style>html,body{margin:0;background:transparent;overflow:hidden}img{display:block;width:${w}px;height:${h}px}</style></head><body><img src="${src}"></body></html>`);
  const out = path.join(OUT, 'png', outName);
  if (fs.existsSync(out)) fs.rmSync(out);
  execFileSync(BROWSER, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', `--window-size=${w},${h}`, '--default-background-color=00000000', '--allow-file-access-from-files', `--user-data-dir=${path.join(tmp, 'p' + job)}`, `--screenshot=${out}`, 'file:///' + html.replace(/\\/g, '/')], { stdio: 'ignore' });
  // alguns browsers devolvem antes de gravar: espera pelo ficheiro
  const t0 = Date.now();
  while (!fs.existsSync(out) && Date.now() - t0 < 20000) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 150);
  if (!fs.existsSync(out)) throw new Error('Falhou: ' + outName);
  return out;
}
function vbSize(name, width) {
  const m = files[name].match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);
  return [width, Math.round((width * m[3]) / m[2])];
}
const jobs = [];
for (const name of Object.keys(files)) {
  if (name === 'favicon.svg') continue;
  const base = name.replace('.svg', '');
  const width = name.startsWith('symbol') ? 2048 : name.startsWith('logo-stacked') ? 2400 : 3200;
  const [w, h] = vbSize(name, width);
  jobs.push([name, `${base}.png`, w, h]);
}
for (const s of [16, 32, 48, 180, 192, 512]) jobs.push(['favicon.svg', `favicon-${s}.png`, s, s]);
for (const j of jobs) render(...j);
console.log(`PNG: ${jobs.length} ficheiros em brand/png`);

// favicon.ico com PNG embutidos (16, 32, 48)
const icoSizes = [16, 32, 48];
const pngs = icoSizes.map((s) => fs.readFileSync(path.join(OUT, 'png', `favicon-${s}.png`)));
const header = Buffer.alloc(6); header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(icoSizes.length, 4);
let offset = 6 + 16 * icoSizes.length; const dir = [];
icoSizes.forEach((s, i) => {
  const e = Buffer.alloc(16); e.writeUInt8(s, 0); e.writeUInt8(s, 1); e.writeUInt8(0, 2); e.writeUInt8(0, 3);
  e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6); e.writeUInt32LE(pngs[i].length, 8); e.writeUInt32LE(offset, 12);
  offset += pngs[i].length; dir.push(e);
});
fs.writeFileSync(path.join(OUT, 'png', 'favicon.ico'), Buffer.concat([header, ...dir, ...pngs]));
fs.rmSync(tmp, { recursive: true, force: true });
console.log('favicon.ico pronto');
