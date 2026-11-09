'use strict';
// Campo de partículas por trás do site público. A ideia: os pontos tornam-se o trabalho.
// - Na abertura formam as iniciais "SC" em letra grande ao lado do título.
// - Quando a captura de um projeto entra no ecrã, os pontos juntam-se numa versão em matriz de
//   pontos dessa captura real, no sítio exato da imagem, e só então a imagem aparece por cima.
// - Nas outras secções tomam formas simples (onda, nuvem, constelação, esfera) longe do texto.
// Alta resolução (até 2x a densidade do ecrã), cor do tema (--campo), pausa com o separador escondido.
// Com "reduzir movimento" não há animação: as formas desenham-se paradas e as imagens aparecem logo.
(function () {
  var canvas = document.getElementById('campo');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  root.classList.add('js-campo');
  var W = 0, H = 0, DPR = 1, N = 0, pts = [], color = '#F6C765', t = 0, raf = 0, angle = 0;
  var mode = { kind: 'forma', name: 'nuvem', el: null, map: null };

  var gauss = function () { var u = 1 - Math.random(), v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

  // ---------- Mapas de pontos a partir de imagens e de texto ----------
  // Devolve uma lista de posições normalizadas (0–1) escolhidas pela luminosidade (ou pelo preenchimento).
  var cache = new Map();
  function sampleCanvas(c, w, h, invert) {
    var d = c.getContext('2d').getImageData(0, 0, w, h).data, cells = [], total = 0;
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      var i = (y * w + x) * 4, a = d[i + 3] / 255;
      var lum = (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;
      var v = invert ? a : Math.pow(lum, 1.6) * a;
      if (v > 0.04) { cells.push([x / w, y / h, v]); total += v; }
    }
    return { cells: cells, total: total, w: w, h: h };
  }
  function mapFromImage(img) {
    var key = img.currentSrc || img.src;
    if (cache.has(key)) return cache.get(key);
    var w = 160, h = 100, c = document.createElement('canvas'); c.width = w; c.height = h;
    var cx = c.getContext('2d');
    // a imagem é desenhada como "cover" com o topo alinhado, tal como no site
    var r = Math.max(w / img.naturalWidth, h / img.naturalHeight), dw = img.naturalWidth * r, dh = img.naturalHeight * r;
    cx.drawImage(img, (w - dw) / 2, 0, dw, dh);
    var m; try { m = sampleCanvas(c, w, h, false); } catch (e) { m = null; }
    cache.set(key, m);
    return m;
  }
  function mapFromText(txt) {
    var key = 'txt:' + txt;
    if (cache.has(key)) return cache.get(key);
    var w = 220, h = 140, c = document.createElement('canvas'); c.width = w; c.height = h;
    var cx = c.getContext('2d');
    cx.fillStyle = '#fff'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.font = '800 118px Archivo, system-ui, sans-serif';
    try { cx.font = '800 ultra-expanded 118px Archivo, system-ui, sans-serif'; } catch (e) {}
    cx.fillText(txt, w / 2, h / 2 + 6);
    var m = sampleCanvas(c, w, h, true);
    cache.set(key, m);
    return m;
  }
  // Escolhe para cada ponto uma célula do mapa (mais pontos onde há mais luz).
  function assign(map) {
    if (!map || !map.cells.length) return false;
    var acc = [], s = 0;
    for (var i = 0; i < map.cells.length; i++) { s += map.cells[i][2]; acc.push(s); }
    for (var k = 0; k < N; k++) {
      var r = pts[k].s1 * s, lo = 0, hi = acc.length - 1;
      while (lo < hi) { var mid = (lo + hi) >> 1; if (acc[mid] < r) lo = mid + 1; else hi = mid; }
      var cell = map.cells[lo];
      pts[k].u = cell[0] + (pts[k].s2 - 0.5) / map.w * 0.9;
      pts[k].v = cell[1] + (pts[k].s3 - 0.5) / map.h * 0.9;
      pts[k].lum = cell[2];
    }
    return true;
  }

  // ---------- Formas simples (fora do texto) ----------
  var shapes = {
    onda: function (p) { var x = (p.s1 * 1.3 - 0.15) * W; return [x, H * 0.62 + Math.sin(x / W * Math.PI * 2.2 + t * 0.3) * H * 0.1 + gauss() * H * 0.05 * p.s2]; },
    nuvem: function (p) { return [W * 0.2 + gauss() * W * 0.11, H * 0.55 + gauss() * H * 0.18]; },
    constelacao: function (p) { var cl = Math.floor(p.s3 * 9), cx = 0.06 + (cl % 3) * 0.1, cy = 0.35 + Math.floor(cl / 3) * 0.18; return [W * cx + gauss() * 14, H * cy + gauss() * 14]; },
    esfera: function (p) {
      var r = Math.min(W, H) * 0.3, th = p.s1 * Math.PI * 2 + angle, ph = Math.acos(2 * p.s2 - 1);
      var x = r * Math.sin(ph) * Math.cos(th), y = r * Math.cos(ph), z = r * Math.sin(ph) * Math.sin(th);
      p.depth = (z + r) / (2 * r);
      return [W * (W < 960 ? 0.5 : 0.72) + x, H * 0.5 + y];
    }
  };

  function readColor() { var c = getComputedStyle(document.body).getPropertyValue('--campo').trim(); if (c) color = c; }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    var want = W < 700 ? 2400 : 6000;
    while (pts.length < want) pts.push({ x: Math.random() * W, y: Math.random() * H, s1: Math.random(), s2: Math.random(), s3: Math.random(), ph: Math.random() * 6.3, a: 0.35 + Math.random() * 0.65, depth: 1, lum: 1, u: 0.5, v: 0.5 });
    pts.length = want; N = want;
    apply(mode);
  }

  // Calcula o alvo de cada ponto para o modo atual (imagens e texto seguem a posição do elemento no ecrã).
  function targetsFor(m) {
    if (m.kind === 'forma') { var f = shapes[m.name] || shapes.nuvem; for (var i = 0; i < N; i++) { var tg = f(pts[i]); pts[i].tx = tg[0]; pts[i].ty = tg[1]; } return; }
    var r = m.el.getBoundingClientRect();
    if (m.kind === 'texto') {
      // as iniciais ocupam a metade direita da abertura (no telemóvel ficam por trás, ao centro)
      var narrow = W < 960, bw = narrow ? W * 0.9 : Math.min(r.width * 0.46, 760), bh = bw * 0.64;
      var bx = narrow ? (W - bw) / 2 : r.right - bw - Math.max(24, W * 0.04), by = r.top + (r.height - bh) / 2;
      for (var j = 0; j < N; j++) { pts[j].tx = bx + pts[j].u * bw; pts[j].ty = by + pts[j].v * bh; }
      return;
    }
    for (var k = 0; k < N; k++) { pts[k].tx = r.left + pts[k].u * r.width; pts[k].ty = r.top + pts[k].v * r.height; }
  }

  function apply(m) {
    mode = m;
    if (m.kind === 'imagem' || m.kind === 'texto') {
      var ok = assign(m.map);
      if (!ok) { mode = { kind: 'forma', name: 'nuvem' }; }
    }
    targetsFor(mode);
    if (reduce.matches) { snap(); draw(); }
  }

  function snap() { for (var i = 0; i < N; i++) { pts[i].x = pts[i].tx; pts[i].y = pts[i].ty; } }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = color;
    var img = mode.kind === 'imagem' || mode.kind === 'texto', sz = W < 700 ? 1.5 : 1.25;
    for (var i = 0; i < N; i++) {
      var p = pts[i];
      if (p.y < -4 || p.y > H + 4) continue;
      ctx.globalAlpha = p.a * (mode.name === 'esfera' && mode.kind === 'forma' ? 0.3 + p.depth * 0.7 : img ? 0.45 + p.lum * 0.55 : 0.85) * (mode.kind === 'texto' && W < 960 ? 0.35 : 1);
      ctx.fillRect(p.x, p.y, sz, sz);
    }
    ctx.globalAlpha = 1;
  }

  function frame() {
    t += 0.016;
    if (mode.kind === 'forma' && (mode.name === 'esfera' || mode.name === 'onda')) { angle += 0.0025; targetsFor(mode); }
    else if (mode.kind !== 'forma') targetsFor(mode); // segue o elemento durante o scroll
    var ease = mode.kind === 'forma' ? 0.04 : 0.075, jit = mode.kind === 'forma' ? 0.22 : 0.06;
    for (var i = 0; i < N; i++) {
      var p = pts[i];
      p.x += (p.tx - p.x) * ease + Math.sin(t + p.ph) * jit;
      p.y += (p.ty - p.y) * ease + Math.cos(t * 0.8 + p.ph) * jit;
    }
    draw();
    raf = requestAnimationFrame(frame);
  }
  function start() { if (!raf && !reduce.matches && !document.hidden) raf = requestAnimationFrame(frame); }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }

  // ---------- O que está no ecrã decide a forma ----------
  var heroEl = document.querySelector('.hero');
  var covers = Array.prototype.slice.call(document.querySelectorAll('.cover.has-shot'));
  var sections = Array.prototype.slice.call(document.querySelectorAll('main [data-forma]'));

  function useCover(cover) {
    var img = cover.querySelector('img');
    var go = function () {
      var m = mapFromImage(img);
      apply({ kind: 'imagem', el: cover, map: m });
      // a imagem real aparece quando os pontos já a desenharam (ou logo, sem animação)
      clearTimeout(cover._rev);
      cover._rev = setTimeout(function () { cover.classList.add('vista'); }, reduce.matches ? 0 : 1100);
    };
    if (img.complete && img.naturalWidth) go(); else img.addEventListener('load', go, { once: true });
  }
  function useHero() {
    var go = function () { apply({ kind: 'texto', el: heroEl, map: mapFromText('SC') }); };
    if (document.fonts && document.fonts.ready) document.fonts.load('800 100px Archivo').then(go, go); else go();
  }

  var current = null;
  function choose(el) {
    if (el === current) return; current = el;
    if (el === heroEl) useHero();
    else if (el.classList && el.classList.contains('cover')) useCover(el);
    else apply({ kind: 'forma', name: el.getAttribute('data-forma') });
  }

  if ('IntersectionObserver' in window) {
    // as capturas têm prioridade sobre a secção onde estão
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) choose(e.target);
        else if (e.target === current && e.target.classList.contains('cover')) {
          var sec = e.target.closest('[data-forma]'); current = null; if (sec) choose(sec);
        }
      });
    }, { rootMargin: '-40% 0px -40% 0px' });
    sections.forEach(function (s) { io.observe(s); });
    covers.forEach(function (c) { io.observe(c); });
  } else covers.forEach(function (c) { c.classList.add('vista'); });
  // Segurança: uma captura que entrou no ecrã nunca fica escondida mais de 2,2 s (conta a partir daí,
  // não do carregamento da página, senão o efeito já tinha passado quando se chega lá).
  if ('IntersectionObserver' in window) {
    var guard = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var c = e.target; guard.unobserve(c);
        setTimeout(function () { c.classList.add('vista'); }, 2200);
      });
    });
    covers.forEach(function (c) { guard.observe(c); });
  }

  readColor();
  resize();
  choose(heroEl || sections[0] || document.body);
  if (reduce.matches) { snap(); draw(); covers.forEach(function (c) { c.classList.add('vista'); }); } else start();
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { resize(); if (reduce.matches) draw(); }, 120); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
  if (reduce.addEventListener) reduce.addEventListener('change', function () { if (reduce.matches) { stop(); snap(); draw(); } else start(); });
  new MutationObserver(function () { readColor(); if (reduce.matches) draw(); }).observe(root, { attributes: true, attributeFilter: ['data-skin', 'data-theme'] });
})();
