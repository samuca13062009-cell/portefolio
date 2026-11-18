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

  // ---------- Terminal "whoami": dá para escrever comandos, só por diversão ----------
  // Tudo corre no browser e o texto entra sempre como texto (textContent), nunca como HTML.
  (function () {
    var end = paper && $('.rc-end', paper);
    if (!end) return;
    var en = (document.documentElement.lang || '').slice(0, 2) === 'en';
    var t = function (pt, eng) { return en ? eng : pt; };

    var out = document.createElement('div');
    out.className = 'rc-out';
    out.setAttribute('role', 'log');
    out.setAttribute('aria-live', 'polite');
    var form = document.createElement('form');
    form.className = 'rc-cmd rc-end rc-prompt';
    form.setAttribute('autocomplete', 'off');
    var sign = document.createElement('span'); sign.setAttribute('aria-hidden', 'true'); sign.textContent = '$';
    var label = document.createElement('label'); label.className = 'sr'; label.setAttribute('for', 'rc-in');
    label.textContent = t('Escreve um comando (experimenta help)', 'Type a command (try help)');
    var input = document.createElement('input');
    input.id = 'rc-in'; input.type = 'text'; input.maxLength = 80; input.spellcheck = false;
    input.setAttribute('autocapitalize', 'off');
    input.placeholder = t('escreve help', 'type help');
    form.appendChild(sign); form.appendChild(label); form.appendChild(input);
    end.replaceWith(out, form);

    var line = function (text, cls) {
      var p = document.createElement('p');
      p.className = 'rc-o' + (cls ? ' ' + cls : '');
      p.textContent = text;
      out.appendChild(p);
      return p;
    };
    var linkLine = function (text, href) {
      var p = document.createElement('p'); p.className = 'rc-o';
      var a = document.createElement('a'); a.href = href; a.textContent = text;
      p.appendChild(a); out.appendChild(p);
    };

    // Dados tirados da própria página (assim ficam sempre certos)
    var projects = $$('.tk-name a').map(function (a) { return { name: a.textContent.trim(), href: a.getAttribute('href') }; });
    var facts = $$('.rc-lines li', paper).map(function (li) { return li.textContent.replace(/\s+/g, ' ').trim(); });
    var groups = $$('.cx-course').map(function (c) {
      var h = $('h3', c); return { name: h ? h.textContent.trim() : '', items: $$('li', c).map(function (li) { return li.textContent.replace(/\s+/g, ' ').trim(); }) };
    });
    var copy = $('[data-copy]');
    var email = copy ? copy.getAttribute('data-copy') : '';
    var cvLink = $('a[href*="cv"]');

    var cmds = {
      help: function () {
        line(t('comandos:', 'commands:'), 'rc-dim');
        [
          ['whoami', t('quem sou', 'who I am')],
          ['ls', t('lista os projetos', 'list the projects')],
          ['open <n>', t('abre o projeto n', 'open project n')],
          ['skills', t('o que sei usar', 'what I work with')],
          ['contact', t('como falar comigo', 'how to reach me')],
          ['cv', t('abre o CV', 'open the CV')],
          ['date', t('data e hora', 'date and time')],
          ['echo <texto>', t('repete o texto', 'repeat the text')],
          ['clear', t('limpa o ecrã', 'clear the screen')],
        ].forEach(function (c) { line('  ' + (c[0] + '            ').slice(0, 14) + c[1]); });
      },
      whoami: function () { facts.forEach(function (f) { line(f); }); line('status: ' + t('disponível para estágio', 'open to an internship'), 'rc-ok'); },
      ls: function () {
        if (!projects.length) { line(t('(sem projetos nesta página)', '(no projects on this page)'), 'rc-dim'); return; }
        projects.forEach(function (p, i) { line('  ' + (i + 1) + '  ' + p.name); });
        line(t('abre um com: open 1', 'open one with: open 1'), 'rc-dim');
      },
      open: function (args) {
        var n = parseInt(args[0], 10);
        var p = projects[n - 1];
        if (!p) { line(t('uso: open <número>  (vê a lista com ls)', 'usage: open <number>  (see the list with ls)'), 'rc-err'); return; }
        line(t('a abrir ', 'opening ') + p.name + '…', 'rc-ok');
        setTimeout(function () { location.href = p.href; }, 450);
      },
      skills: function () {
        groups.forEach(function (g) { line(g.name + '/', 'rc-ok'); line('  ' + g.items.join(' · ')); });
      },
      contact: function () {
        if (email) linkLine(email, 'mailto:' + email);
        $$('.cx-links a[target="_blank"]').forEach(function (a) { linkLine(((a.firstChild && a.firstChild.textContent) || a.textContent).trim(), a.href); });
      },
      cv: function () {
        if (!cvLink) { line(t('CV não encontrado', 'CV not found'), 'rc-err'); return; }
        line(t('a abrir o CV…', 'opening the CV…'), 'rc-ok');
        setTimeout(function () { location.href = cvLink.getAttribute('href'); }, 450);
      },
      date: function () { line(new Date().toLocaleString(en ? 'en-GB' : 'pt-PT')); },
      echo: function (args) { line(args.join(' ')); },
      clear: function () { out.textContent = ''; },
      sudo: function () { line(t('Boa tentativa. Este terminal não tem permissões de administrador.', 'Nice try. This terminal has no admin rights.'), 'rc-err'); },
      rm: function () { line(t('Nem pensar. Os projetos ficam onde estão.', 'No way. The projects stay where they are.'), 'rc-err'); },
      exit: function () { line(t('Não há saída. Fica mais um bocado.', 'There is no exit. Stay a bit longer.'), 'rc-dim'); },
      hello: function () { line(t('Olá! Escreve help para ver o que dá para fazer.', 'Hi! Type help to see what you can do.')); },
      coffee: function () { line(t('☕ A compilar café… erro: caneca vazia.', '☕ Compiling coffee… error: empty mug.')); },
    };
    // Nomes em português e atalhos
    var alias = { ajuda: 'help', '?': 'help', projetos: 'ls', projects: 'ls', abrir: 'open', stack: 'skills', contacto: 'contact', contato: 'contact', email: 'contact',
      data: 'date', limpar: 'clear', cls: 'clear', ola: 'hello', 'olá': 'hello', hi: 'hello', cafe: 'coffee', 'café': 'coffee', quemsou: 'whoami' };

    var history = []; var pos = 0;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var raw = input.value.trim().slice(0, 80);
      input.value = '';
      if (!raw) return;
      history.push(raw); if (history.length > 30) history.shift(); pos = history.length;
      line('$ ' + raw, 'rc-echo');
      var parts = raw.split(/\s+/);
      var name = parts[0].toLowerCase();
      name = alias[name] || name;
      var fn = Object.prototype.hasOwnProperty.call(cmds, name) ? cmds[name] : null;
      if (fn) fn(parts.slice(1));
      else line(t('comando não encontrado: ', 'command not found: ') + parts[0] + t('. Escreve help.', '. Type help.'), 'rc-err');
      while (out.children.length > 60) out.removeChild(out.firstChild);
      out.scrollTop = out.scrollHeight;
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowUp' && history.length) { e.preventDefault(); pos = Math.max(0, pos - 1); input.value = history[pos]; }
      else if (e.key === 'ArrowDown' && history.length) { e.preventDefault(); pos = Math.min(history.length, pos + 1); input.value = history[pos] || ''; }
      else if (e.key === 'Tab' && input.value && input.value.indexOf(' ') < 0) {
        var hits = Object.keys(cmds).filter(function (c) { return c.indexOf(input.value.toLowerCase()) === 0; });
        if (hits.length === 1) { e.preventDefault(); input.value = hits[0] + ' '; }
      }
    });
    // Clicar em qualquer parte do terminal (fora de ligações) põe o cursor na linha de comando
    paper.addEventListener('click', function (e) {
      if (e.target.closest('a') || (window.getSelection && String(window.getSelection()))) return;
      input.focus({ preventScroll: true });
    });
  })();


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
