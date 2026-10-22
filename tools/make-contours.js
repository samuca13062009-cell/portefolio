'use strict';
// Gera public/img/contours.svg: linhas de profundidade (batimetria) desenhadas a partir de um
// relevo matemático, como as cartas do mar da costa Oeste. Usado como máscara nos fundos,
// por isso a cor vem do tema. Correr: node tools/make-contours.js

const fs = require('fs');
const path = require('path');

const W = 1600;
const H = 1000;
const STEP = 8; // tamanho da célula da grelha, em px
const LEVELS = 30;

// Relevo: um "fundo do mar" que desce para oeste, com bancos e vales suaves.
const bumps = [
  [1250, 180, 520, 1.0], [980, 760, 380, -0.8], [420, 300, 300, 0.7],
  [1500, 900, 420, 0.6], [200, 860, 360, -0.5], [760, 120, 260, -0.45],
];
function depth(x, y) {
  let z = (x / W) * 1.6 + Math.sin(y / 210) * 0.18 + Math.cos(x / 340 + y / 520) * 0.14;
  for (const [cx, cy, r, a] of bumps) z += a * Math.exp(-((x - cx) ** 2 + (y - cy) ** 2) / (2 * r * r));
  return z;
}

const cols = Math.ceil(W / STEP) + 1;
const rows = Math.ceil(H / STEP) + 1;
const grid = [];
let min = Infinity;
let max = -Infinity;
for (let j = 0; j < rows; j++) {
  grid.push([]);
  for (let i = 0; i < cols; i++) {
    const v = depth(i * STEP, j * STEP);
    grid[j].push(v);
    if (v < min) min = v;
    if (v > max) max = v;
  }
}

// Marching squares: segmentos de cada linha de nível, depois unidos em polilinhas.
const key = (p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
const paths = [];
for (let l = 1; l < LEVELS; l++) {
  const iso = min + ((max - min) * l) / LEVELS;
  const segs = [];
  const lerp = (a, b, va, vb) => {
    const t = (iso - va) / (vb - va);
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  };
  for (let j = 0; j < rows - 1; j++) {
    for (let i = 0; i < cols - 1; i++) {
      const p = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]].map(([a, b]) => [a * STEP, b * STEP]);
      const v = [grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i]];
      const pts = [];
      for (let e = 0; e < 4; e++) {
        const a = e;
        const b = (e + 1) % 4;
        if ((v[a] < iso) !== (v[b] < iso)) pts.push(lerp(p[a], p[b], v[a], v[b]));
      }
      if (pts.length === 2) segs.push(pts);
      else if (pts.length === 4) { segs.push([pts[0], pts[1]]); segs.push([pts[2], pts[3]]); }
    }
  }
  // Unir segmentos que partilham pontas.
  const byEnd = new Map();
  segs.forEach((s, idx) => { for (const p of s) { const k = key(p); if (!byEnd.has(k)) byEnd.set(k, []); byEnd.get(k).push(idx); } });
  const used = new Set();
  for (let s0 = 0; s0 < segs.length; s0++) {
    if (used.has(s0)) continue;
    used.add(s0);
    const line = [segs[s0][0], segs[s0][1]];
    for (const dir of [1, 0]) {
      for (;;) {
        const end = dir ? line[line.length - 1] : line[0];
        const next = (byEnd.get(key(end)) || []).find((n) => !used.has(n));
        if (next === undefined) break;
        used.add(next);
        const [a, b] = segs[next];
        const other = key(a) === key(end) ? b : a;
        if (dir) line.push(other); else line.unshift(other);
      }
    }
    if (line.length < 6) continue;
    // Simplifica: um ponto a cada dois, arredondado.
    const pts = line.filter((_, k) => k % 2 === 0 || k === line.length - 1).map(([x, y]) => `${Math.round(x)} ${Math.round(y)}`);
    paths.push(`M${pts.join('L')}`);
  }
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><path fill="none" stroke="#000" stroke-width="1.2" stroke-linejoin="round" d="${paths.join('')}"/></svg>\n`;
const out = path.join(__dirname, '..', 'public', 'img', 'contours.svg');
fs.writeFileSync(out, svg);
console.log(`contours.svg: ${paths.length} linhas, ${(svg.length / 1024).toFixed(0)} KB`);
