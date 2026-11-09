'use strict';
// Interações da identidade "Comanda nº 21" (só no site público, body.cx).
// Tudo é opcional: sem JavaScript a página funciona e fica parada. Com "reduzir movimento" não há
// impressão animada, inclinação dos talões nem marquise ligada ao scroll.
(function () {
  if (!document.body.classList.contains('cx')) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // Talão: imprime ao abrir a página e quando se carrega em "Reimprimir".
  var paper = $('#talao');
  var printIt = function () {
    if (!paper || reduce) return;
    paper.classList.remove('imprime'); void paper.offsetWidth; paper.classList.add('imprime');
  };
  printIt();
  var reprint = $('#reimprimir');
  if (reprint) reprint.addEventListener('click', printIt);

  // Carimbos que se arrastam com o rato ou o dedo (ficam dentro da abertura).
  $$('[data-drag]').forEach(function (el) {
    var sx = 0, sy = 0, ox = 0, oy = 0, dragging = false;
    var base = getComputedStyle(el).transform;
    el.addEventListener('pointerdown', function (e) {
      dragging = true; el.setPointerCapture(e.pointerId); el.classList.add('agarrado');
      sx = e.clientX; sy = e.clientY;
      ox = parseFloat(el.dataset.x || 0); oy = parseFloat(el.dataset.y || 0);
    });
    el.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var x = ox + e.clientX - sx, y = oy + e.clientY - sy;
      el.dataset.x = x; el.dataset.y = y;
      el.style.translate = x + 'px ' + y + 'px';
    });
    var stop = function () { dragging = false; el.classList.remove('agarrado'); };
    el.addEventListener('pointerup', stop); el.addEventListener('pointercancel', stop);
    void base;
  });

  // Talões dos projetos inclinam-se para o lado do cursor.
  if (finePointer && !reduce) {
    $$('[data-tilt]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--ry', (px * 8).toFixed(2) + 'deg');
        el.style.setProperty('--rx', (-py * 8).toFixed(2) + 'deg');
      });
      el.addEventListener('pointerleave', function () { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });
  }

  // Ligado ao scroll: o risco laranja desenha-se e a marquise grande desliza.
  var squiggle = $('.cx-squiggle'), outline = null; // a marquise grande passou a correr sozinha (CSS)
  if (!reduce && (squiggle || outline)) {
    var tick = false;
    var onScroll = function () {
      tick = false;
      var vh = window.innerHeight;
      if (squiggle) {
        var r = squiggle.getBoundingClientRect();
        var p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height * 0.6)));
        squiggle.style.setProperty('--risco', (1 - p).toFixed(3));
      }
      if (outline) {
        var o = outline.parentElement.getBoundingClientRect();
        outline.style.transform = 'translateX(' + ((o.top - vh) * 0.4).toFixed(1) + 'px)';
      }
    };
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();
  } else if (squiggle) squiggle.style.setProperty('--risco', '0');

  // O menu: tocar num prato marca-o e conta os pratos pedidos.
  var tip = $('#cx-pedido');
  $$('.cx-dish').forEach(function (b) {
    b.addEventListener('click', function () {
      b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      if (!tip) return;
      var n = $$('.cx-dish[aria-pressed="true"]').length;
      tip.textContent = n === 0 ? tip.dataset.empty : n === 1 ? tip.dataset.one : tip.dataset.many.replace('{n}', n);
    });
  });
})();
