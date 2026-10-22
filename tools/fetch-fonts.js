'use strict';
// Descarrega as fontes dos temas (Google Fonts, licença SIL Open Font License) para public/fonts
// e gera public/css/fonts.css. Assim o site não pede nada ao Google quando é visitado,
// o que evitaria enviar o IP de cada visitante para um terceiro.
// Correr só quando se muda a lista de fontes: npm run fonts

const fs = require('fs');
const path = require('path');
const { THEMES } = require('../lib/themes');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'public', 'fonts');
const CSS = path.join(ROOT, 'public', 'css', 'fonts.css');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const SUBSETS = new Set(['latin', 'latin-ext']);

(async () => {
  // Só substitui os ficheiros de fonte; as licenças ficam.
  fs.mkdirSync(OUT, { recursive: true });
  for (const f of fs.readdirSync(OUT)) if (f.endsWith('.woff2')) fs.rmSync(path.join(OUT, f));
  const seen = new Set();
  const faces = [];
  for (const theme of Object.values(THEMES)) {
    const css = await (await fetch(theme.googleFonts, { headers: { 'user-agent': UA } })).text();
    for (const m of css.matchAll(/\/\* ([\w-]+) \*\/\s*@font-face\s*\{([^}]*)\}/g)) {
      const [, subset, body] = m;
      if (!SUBSETS.has(subset)) continue;
      const family = body.match(/font-family:\s*'([^']+)'/)[1];
      const style = body.match(/font-style:\s*(\w+)/)[1];
      const weight = body.match(/font-weight:\s*([\d ]+)/)[1].trim();
      const url = body.match(/url\((https:[^)]+\.woff2)\)/)[1];
      const range = body.match(/unicode-range:\s*([^;]+);/)[1];
      const stretch = (body.match(/font-stretch:\s*([^;]+);/) || [])[1];
      const file = `${family.toLowerCase().replace(/\s+/g, '-')}-${style}-${weight.replace(' ', '-')}${stretch ? `-w${stretch.replace(/[% ]+/g, '-').replace(/-$/, '')}` : ''}-${subset}.woff2`;
      if (seen.has(file)) continue;
      seen.add(file);
      fs.writeFileSync(path.join(OUT, file), Buffer.from(await (await fetch(url)).arrayBuffer()));
      faces.push(`/* ${family} ${weight} ${subset} */\n@font-face { font-family: '${family}'; font-style: ${style}; font-weight: ${weight};${stretch ? ` font-stretch: ${stretch};` : ''} font-display: swap; src: url(/fonts/${file}) format('woff2'); unicode-range: ${range}; }`);
    }
  }
  fs.writeFileSync(CSS, `/* Gerado por tools/fetch-fonts.js. Fontes com licença SIL Open Font License 1.1 (ver public/fonts/LICENCAS.txt). */\n${faces.join('\n')}\n`);
  console.log(`${faces.length} ficheiros de fonte em public/fonts`);
})().catch((e) => { console.error(e); process.exit(1); });
