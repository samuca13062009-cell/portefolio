'use strict';
// Campo de partículas por trás de todas as páginas. Muda de forma conforme a secção que está no ecrã
// (anel, onda, nuvem, linhas, esfera) e usa a cor do tema ativo (--campo).
// Leve: um canvas 2D, até 2600 pontos no computador e 1000 no telemóvel; pausa quando o separador
// não está visível; com "reduzir movimento" desenha a forma parada, sem animação.
(function () {
  var canvas = document.getElementById('campo');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var W = 0, H = 0, DPR = 1, N = 0, pts = [], shape = 'anel', color = '#F6C765', t = 0, raf = 0, angle = 0;

  // Número aleatório com distribuição normal (para espessuras e nuvens naturais).
  var gauss = function () { var u = 1 - Math.random(), v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

  // Posição-alvo de cada ponto para cada forma. "s" é uma semente fixa por ponto (a forma não salta ao redesenhar).
  var targets = {
    anel: function (p) {
      var r = Math.min(W, H) * 0.36, a = p.s1 * Math.PI * 2, d = r + gauss() * r * 0.07 * p.s2;
      return [W / 2 + Math.cos(a) * d, H * 0.5 + Math.sin(a) * d];
    },
    onda: function (p) {
      var x = (p.s1 * 1.3 - 0.15) * W, y = H * 0.55 + Math.sin(x / W * Math.PI * 2.2 + 0.6) * H * 0.12 + gauss() * H * 0.07 * p.s2;
      return [x, y];
    },
    nuvem: function (p) {
      return [W * 0.32 + gauss() * W * 0.16, H * 0.45 + gauss() * H * 0.2];
    },
    linhas: function (p) {
      var row = Math.floor(p.s2 * 7), y = H * (0.22 + row * 0.1) + gauss() * 3;
      return [(p.s1 * 1.1 - 0.05) * W, y];
    },
    esfera: function (p) {
      // Ponto numa esfera que roda devagar, projetado no plano.
      var r = Math.min(W, H) * 0.32, th = p.s1 * Math.PI * 2 + angle, ph = Math.acos(2 * p.s2 - 1);
      var x = r * Math.sin(ph) * Math.cos(th), y = r * Math.cos(ph), z = r * Math.sin(ph) * Math.sin(th);
      p.depth = (z + r) / (2 * r);
      return [W * 0.62 + x, H * 0.5 + y];
    }
  };

  function readColor() {
    var c = getComputedStyle(document.body).getPropertyValue('--campo').trim();
    if (c) color = c;
  }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    var want = W < 700 ? 1000 : 2600;
    while (pts.length < want) pts.push({ x: Math.random() * W, y: Math.random() * H, s1: Math.random(), s2: Math.random(), ph: Math.random() * 6.3, a: 0.25 + Math.random() * 0.65, depth: 1 });
    pts.length = want; N = want;
    setShape(shape, true);
  }

  function setShape(name, keep) {
    if (!targets[name]) name = 'nuvem';
    shape = name;
    for (var i = 0; i < N; i++) { var p = pts[i], tg = targets[name](p); p.tx = tg[0]; p.ty = tg[1]; if (keep && reduce.matches) { p.x = p.tx; p.y = p.ty; } }
    if (reduce.matches) { snap(); draw(); }
  }

  function snap() { for (var i = 0; i < N; i++) { pts[i].x = pts[i].tx; pts[i].y = pts[i].ty; } }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = color;
    for (var i = 0; i < N; i++) {
      var p = pts[i];
      ctx.globalAlpha = p.a * (shape === 'esfera' ? 0.35 + p.depth * 0.65 : 1);
      ctx.fillRect(p.x, p.y, 1.4, 1.4);
    }
    ctx.globalAlpha = 1;
  }

  function frame() {
    t += 0.016;
    if (shape === 'esfera') { angle += 0.0025; for (var j = 0; j < N; j++) { var tg = targets.esfera(pts[j]); pts[j].tx = tg[0]; pts[j].ty = tg[1]; } }
    for (var i = 0; i < N; i++) {
      var p = pts[i];
      p.x += (p.tx - p.x) * 0.045 + Math.sin(t + p.ph) * 0.18;
      p.y += (p.ty - p.y) * 0.045 + Math.cos(t * 0.8 + p.ph) * 0.18;
    }
    draw();
    raf = requestAnimationFrame(frame);
  }

  function start() { if (!raf && !reduce.matches && !document.hidden) raf = requestAnimationFrame(frame); }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }

  // A forma segue a secção que ocupa o meio do ecrã.
  var sections = Array.prototype.slice.call(document.querySelectorAll('[data-forma]'));
  if ('IntersectionObserver' in window && sections.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) setShape(e.target.getAttribute('data-forma')); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    sections.forEach(function (s) { io.observe(s); });
    shape = sections[0].getAttribute('data-forma');
  }

  readColor();
  resize();
  if (reduce.matches) { snap(); draw(); } else start();
  window.addEventListener('resize', function () { resize(); if (reduce.matches) draw(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
  reduce.addEventListener && reduce.addEventListener('change', function () { if (reduce.matches) { stop(); snap(); draw(); } else start(); });
  // Mudar de tema ou de modo muda a cor dos pontos.
  new MutationObserver(function () { readColor(); if (reduce.matches) draw(); }).observe(root, { attributes: true, attributeFilter: ['data-skin', 'data-theme'] });
})();
