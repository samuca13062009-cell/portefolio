'use strict';
// Temas visuais do website: cada um usa as cores de um projeto do portefólio.
// As cores estão em public/css/themes.css (gerado por tools/make-themes.js).

const FONTS = 'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap';

const THEMES = {
  polvo: {
    name: 'O Polvo',
    description: 'As cores do site do restaurante O Polvo: azul-noite, dourado e papel quente.',
    googleFonts: FONTS,
    swatches: ['#F6F0E6', '#0A1024', '#16224D', '#F6C765'],
  },
  saltaplanetas: {
    name: 'Saltaplanetas',
    description: 'As cores do jogo Saltaplanetas: espaço violeta, o amarelo dos cristais e rosa.',
    googleFonts: FONTS,
    swatches: ['#F4F1FF', '#0B0820', '#7A43C8', '#FFD34D'],
  },
  skillconnect: {
    name: 'SkillConnect',
    description: 'As cores da app SkillConnect: preto e verde néon.',
    googleFonts: FONTS,
    swatches: ['#F2F2F2', '#000000', '#1B7F0A', '#39FF14'],
  },
  arduino: {
    name: 'Arduino',
    description: 'As cores do Arduino: o azul-petróleo das placas e o laranja da marca.',
    googleFonts: FONTS,
    swatches: ['#EEF5F5', '#003234', '#00797C', '#F5964E'],
  },
};

const DEFAULT_THEME = 'polvo';
const pickTheme = (...candidates) => candidates.find((c) => typeof c === 'string' && Object.prototype.hasOwnProperty.call(THEMES, c)) || DEFAULT_THEME;

module.exports = { THEMES, DEFAULT_THEME, pickTheme };
