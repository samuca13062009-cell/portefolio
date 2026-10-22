'use strict';
// Temas visuais do website. As cores de cada um estão em public/css/themes.css.

const G = 'https://fonts.googleapis.com/css2?';

const THEMES = {
  cobalto: {
    name: 'Cobalto',
    description: 'Papel frio, tinta quase preta e azul-cobalto. Grotesca expressiva nos títulos.',
    googleFonts: `${G}family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap`,
    swatches: ['#EEF0EA', '#10130E', '#2B4BFF', '#C9F26B'],
  },
  terminal: {
    name: 'Terminal',
    description: 'Títulos em letra monoespaçada e verde de consola. Puxa pela programação e pela cibersegurança.',
    googleFonts: `${G}family=JetBrains+Mono:wght@400;500;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap`,
    swatches: ['#0B0F0C', '#D7F5DD', '#4ADE80', '#0B6B34'],
  },
  editorial: {
    name: 'Editorial',
    description: 'Papel quente, títulos com serifa e vermelho-tijolo. Mais clássico e calmo.',
    googleFonts: `${G}family=Fraunces:opsz,wght@9..144,400..700&family=Source+Sans+3:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap`,
    swatches: ['#F6F1E7', '#1E1A16', '#B3371A', '#E8C24A'],
  },
  atlantico: {
    name: 'Atlântico',
    description: 'O Atlântico da costa Oeste ao fim do dia: oceano profundo, curvas de profundidade e um tom de pôr do sol. Letra larga e forte.',
    googleFonts: `${G}family=Archivo:wdth,wght@62..125,400..800&family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap`,
    swatches: ['#EEF4F5', '#0A2230', '#0A6C78', '#FFB199'],
  },
};

const DEFAULT_THEME = 'cobalto';
const pickTheme = (...candidates) => candidates.find((c) => typeof c === 'string' && Object.prototype.hasOwnProperty.call(THEMES, c)) || DEFAULT_THEME;

module.exports = { THEMES, DEFAULT_THEME, pickTheme };
