'use strict';
// Interações do site público (só em body.cx).
// Tudo é opcional: sem JavaScript a página funciona e fica parada. Com "reduzir movimento" o terminal
// aparece logo escrito.
(function () {
  if (!document.body.classList.contains('cx')) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // Terminal "whoami": as linhas escrevem-se ao abrir a página.
  var paper = $('#talao');
  if (paper && !reduce) paper.classList.add('imprime');

  // Capturas dos projetos: fundo a pulsar enquanto a imagem carrega, depois a imagem aparece suavemente.
  $$('img.shot').forEach(function (img) {
    if (img.complete && img.naturalWidth) return;
    var box = img.parentElement;
    box.classList.add('a-carregar');
    var done = function () { box.classList.remove('a-carregar'); };
    img.addEventListener('load', done);
    img.addEventListener('error', done);
  });

  // Copiar o email: o botão confirma durante dois segundos. Se o browser não deixar copiar,
  // o botão mostra o próprio email para se copiar à mão.
  $$('[data-copy]').forEach(function (b) {
    var label = b.textContent;
    var show = function (text, ok) {
      b.textContent = text;
      b.classList.toggle('copiado', ok);
      setTimeout(function () { b.textContent = label; b.classList.remove('copiado'); }, ok ? 2000 : 6000);
    };
    b.addEventListener('click', function () {
      var fail = function () { show(b.dataset.copy, false); };
      if (!navigator.clipboard) return fail();
      navigator.clipboard.writeText(b.dataset.copy).then(function () { show(b.dataset.done, true); }, fail);
    });
  });

  // ---------- Animações (desligam com "reduzir movimento") ----------
  if (!reduce && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js-anim');
    var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    // Barra de progresso
    var bar = document.createElement('div');
    bar.className = 'cx-progress'; bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    // Hero: ordem de entrada
    $$('.cx-hero-text > :not(h1)').forEach(function (el, i) { el.style.setProperty('--i', i); });

    // Revelar ao fazer scroll: [seletor, tipo]
    var groups = [
      ['.cx-big', ''], ['.cx-note', 'left'], ['.cx-polaroid', 'right'],
      ['.cx-title', ''], ['.cx-head .text-link', ''], ['.tk', 'pop'], ['.cx-course', ''], ['.cx-shift', 'left'],
      ['.cx-contact-card > :not(.cx-bigout)', ''],
      ['.page-head > *', ''], ['.section > *', ''], ['.row', 'left'], ['.skill-row', 'left'],
      ['.card', 'pop'], ['.panel', ''], ['.cv-sheet', ''], ['.socials > *', 'pop'], ['.pager > *', '']
    ];
    var targets = [];
    groups.forEach(function (g) {
      $$(g[0]).forEach(function (el) {
        if (el.hasAttribute('data-rv') || el.closest('.cx-hero')) return;
        el.setAttribute('data-rv', g[1]);
        var sibs = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.matches(g[0]); });
        el.style.setProperty('--i', Math.min(sibs.indexOf(el), 8));
        targets.push(el);
      });
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        el.classList.add('in'); io.unobserve(el);
        setTimeout(function () { el.classList.add('done'); }, 1400);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    targets.forEach(function (el) { io.observe(el); });

    // Tecnologias do cartão: ordem da onda
    $$('.tk-items').forEach(function (ul) { $$('li', ul).forEach(function (li, j) { li.style.setProperty('--j', j); }); });

    // Scroll: progresso e linha do percurso (um só cálculo por frame)
    var shifts = $('.cx-shifts');
    var ticking = false;
    var onScroll = function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var d = document.documentElement;
        var max = d.scrollHeight - innerHeight;
        bar.style.setProperty('--p', max > 0 ? (scrollY / max).toFixed(4) : 0);
        if (shifts) {
          var r = shifts.getBoundingClientRect();
          var t = (innerHeight * 0.75 - r.top) / r.height;
          shifts.style.setProperty('--draw', Math.max(0, Math.min(1, t)).toFixed(3));
        }
      });
    };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    onScroll();

    if (fine) {
      // Cartões: inclinação 3D e brilho que segue o rato
      $$('.tk, .cx-contact-card, .cx-menu-card').forEach(function (card) {
        var tilt = card.classList.contains('tk');
        card.addEventListener('pointermove', function (ev) {
          var r = card.getBoundingClientRect();
          var x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
          card.style.setProperty('--mx', (x * 100) + '%');
          card.style.setProperty('--my', (y * 100) + '%');
          if (tilt && card.classList.contains('done')) {
            card.classList.add('tilting');
            card.style.transform = 'perspective(1000px) rotateX(' + ((0.5 - y) * 6).toFixed(2) + 'deg) rotateY(' + ((x - 0.5) * 8).toFixed(2) + 'deg) translateY(-4px)';
          }
        });
        card.addEventListener('pointerleave', function () {
          card.classList.remove('tilting');
          card.style.transform = '';
        });
      });

      // Botões com íman: seguem um pouco o rato
      $$('.btn').forEach(function (b) {
        b.addEventListener('pointermove', function (ev) {
          var r = b.getBoundingClientRect();
          b.style.setProperty('--bx', ((ev.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + 'px');
          b.style.setProperty('--by', ((ev.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px');
        });
        b.addEventListener('pointerleave', function () { b.style.removeProperty('--bx'); b.style.removeProperty('--by'); });
      });

      // Terminal: inclina um pouco com o rato em toda a página do hero
      var hero = $('.cx-hero'), term = $('.cx-term');
      if (hero && term) {
        hero.addEventListener('pointermove', function (ev) {
          var x = ev.clientX / innerWidth - 0.5, y = ev.clientY / innerHeight - 0.5;
          term.style.transform = 'perspective(1000px) rotateY(' + (x * -10).toFixed(2) + 'deg) rotateX(' + (y * 8).toFixed(2) + 'deg)';
        });
        hero.addEventListener('pointerleave', function () { term.style.transform = ''; });
        term.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.9, 0.2, 1)';
        term.addEventListener('animationend', function () { term.style.animation = 'none'; });
      }
    }
  }
})();
