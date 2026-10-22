'use strict';
// Gera public/css/themes.css a partir das cores reais de cada projeto.
// Cada tema tem modo claro, modo escuro e as cores das faixas de oceano (--deep…, --sun).
// Correr: node tools/make-themes.js

const fs = require('fs');
const path = require('path');

const THEMES = {
  // Site do restaurante O Polvo: azul-noite, dourado, papel quente (Menu O Polvo/site/public/css/site.css)
  polvo: {
    light: { bg: '#F6F0E6', surface: '#FFFAF3', ink: '#1A1930', muted: '#524D60', line: '#E2D7C5', 'line-strong': '#8A7A63', accent: '#16224D', 'accent-ink': '#FFFFFF', 'inv-bg': '#0A1024', 'inv-ink': '#EEF0F8', soft: '#EFE6D8', err: '#A3261B' },
    dark: { bg: '#0A1024', surface: '#121A35', ink: '#EEF0F8', muted: '#B3BAD2', line: '#1A2445', 'line-strong': '#6F7BA8', accent: '#F6C765', 'accent-ink': '#1A1405', 'inv-bg': '#EEF0F8', 'inv-ink': '#0A1024', soft: '#1A2445', err: '#FF9D85' },
    deep: { deep: '#0A1024', 'deep-2': '#121A35', 'deep-ink': '#EEF0F8', 'deep-muted': '#B3BAD2', 'deep-line': '#1A2445', 'deep-line-strong': '#6F7BA8', sun: '#F6C765' },
    deepDark: { deep: '#121A35', 'deep-2': '#1A2445' },
  },
  // Jogo Saltaplanetas: espaço violeta, amarelo dos cristais, rosa (Menu O Polvo/saltaplanetas/index.html)
  saltaplanetas: {
    light: { bg: '#F4F1FF', surface: '#FFFFFF', ink: '#1A1230', muted: '#4F4870', line: '#DDD6F3', 'line-strong': '#7E76A6', accent: '#7A43C8', 'accent-ink': '#FFFFFF', 'inv-bg': '#0B0820', 'inv-ink': '#F4F1FF', soft: '#E9E3FB', err: '#B0284F' },
    dark: { bg: '#0B0820', surface: '#1A1230', ink: '#F4F1FF', muted: '#A9A3C9', line: '#2A2050', 'line-strong': '#6A5F9E', accent: '#FFD34D', 'accent-ink': '#1A1230', 'inv-bg': '#F4F1FF', 'inv-ink': '#0B0820', soft: '#2A2050', err: '#FF8FA3' },
    deep: { deep: '#0B0820', 'deep-2': '#1A1230', 'deep-ink': '#F4F1FF', 'deep-muted': '#A9A3C9', 'deep-line': '#2A2050', 'deep-line-strong': '#6A5F9E', sun: '#FFD34D' },
    deepDark: { deep: '#160F33', 'deep-2': '#221947' },
  },
  // App SkillConnect: preto e verde néon (skillconnect2/.../ui/theme/Color.kt)
  skillconnect: {
    light: { bg: '#F2F2F2', surface: '#FFFFFF', ink: '#0D0D0D', muted: '#4D4D4D', line: '#D6D6D6', 'line-strong': '#7A7A7A', accent: '#1B7F0A', 'accent-ink': '#FFFFFF', 'inv-bg': '#000000', 'inv-ink': '#F2F2F2', soft: '#E6E6E6', err: '#A8201A' },
    dark: { bg: '#0D0D0D', surface: '#161616', ink: '#F2F2F2', muted: '#A0A0A0', line: '#2E2E2E', 'line-strong': '#6A6A6A', accent: '#39FF14', 'accent-ink': '#000000', 'inv-bg': '#F2F2F2', 'inv-ink': '#0D0D0D', soft: '#1F1F1F', err: '#FF8A80' },
    deep: { deep: '#000000', 'deep-2': '#0D0D0D', 'deep-ink': '#F2F2F2', 'deep-muted': '#9A9A9A', 'deep-line': '#2E2E2E', 'deep-line-strong': '#5A5A5A', sun: '#39FF14' },
    deepDark: { deep: '#000000', 'deep-2': '#161616' },
  },
  // Arduino: o azul-petróleo das placas e o laranja da marca (o código da app não está neste computador)
  arduino: {
    light: { bg: '#EEF5F5', surface: '#FFFFFF', ink: '#0F2A2B', muted: '#46605F', line: '#CFE0DF', 'line-strong': '#6E8C8B', accent: '#00797C', 'accent-ink': '#FFFFFF', 'inv-bg': '#003B3D', 'inv-ink': '#E9F7F7', soft: '#DDEBEA', err: '#A8201A' },
    dark: { bg: '#071B1C', surface: '#0E2A2B', ink: '#E9F7F7', muted: '#A6CFCF', line: '#1C3C3D', 'line-strong': '#5D8A8B', accent: '#3FC6CA', 'accent-ink': '#071B1C', 'inv-bg': '#E9F7F7', 'inv-ink': '#071B1C', soft: '#1C3C3D', err: '#FF9C93' },
    deep: { deep: '#003234', 'deep-2': '#00494C', 'deep-ink': '#E9F7F7', 'deep-muted': '#A6CFCF', 'deep-line': '#0B5F62', 'deep-line-strong': '#4FA3A5', sun: '#F5964E' },
    deepDark: { deep: '#003A3C', 'deep-2': '#00514F' },
  },
};

const decl = (o) => Object.entries(o).map(([k, v]) => `--${k}: ${v};`).join(' ');
let css = `/* Gerado por tools/make-themes.js. Cada tema usa as cores de um projeto.
   O tema por omissão do site é escolhido no backoffice; o visitante pode mudar no menu Tema. */
`;
for (const [id, t] of Object.entries(THEMES)) {
  const sel = `:root[data-skin="${id}"]`;
  css += `
/* ---------- ${id} ---------- */
${sel} { ${decl(t.light)} ${decl(t.deep)} color-scheme: light; }
@media (prefers-color-scheme: dark) {
  ${sel}:not([data-theme="light"]) { ${decl(t.dark)} ${decl(t.deepDark)} color-scheme: dark; }
}
${sel}[data-theme="dark"] { ${decl(t.dark)} ${decl(t.deepDark)} color-scheme: dark; }
`;
}
css += `
/* Faixa de pré-visualização (quando o endereço tem ?tema=) */
.preview-bar { position: sticky; top: 0; z-index: 25; display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 4px 16px; padding: 10px 16px; background: var(--deep); color: var(--deep-ink); font-size: 0.9375rem; text-align: center; }
.preview-bar a { color: var(--deep-ink); font-weight: 600; }
`;
fs.writeFileSync(path.join(__dirname, '..', 'public', 'css', 'themes.css'), css);
fs.writeFileSync(path.join(__dirname, 'themes-data.json'), JSON.stringify(THEMES, null, 2) + '\n');
console.log('themes.css gerado:', Object.keys(THEMES).join(', '));
