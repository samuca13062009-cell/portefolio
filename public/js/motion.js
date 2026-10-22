// Transição entre páginas: a capa do projeto passa do cartão para a página do projeto (e volta).
// Carregado no <head> para apanhar o evento pagereveal antes do primeiro desenho.
(function () {
  if (!('onpagereveal' in window)) return;

  var path = function (u) {
    try { return new URL(u, location.href).pathname.replace(/\/$/, '') || '/'; } catch (e) { return ''; }
  };
  var isProject = function (p) { return /^(\/en)?\/(projetos|projects)\/[^/]+$/.test(p); };
  var isList = function (p) { return /^(\/en)?(\/(projetos|projects))?$/.test(p) || p === '/'; };
  var cardCover = function (p) {
    var cards = document.querySelectorAll('a.card');
    for (var i = 0; i < cards.length; i++) {
      if (path(cards[i].getAttribute('href')) === p) return cards[i].querySelector('.cover');
    }
    return null;
  };
  var clear = function () {
    Array.prototype.forEach.call(document.querySelectorAll('.cover'), function (c) { c.style.viewTransitionName = ''; });
  };
  var name = function (el, vt) {
    if (!el) return;
    el.style.viewTransitionName = 'cover';
    vt.finished.then(clear, clear);
  };

  // Página que sai
  window.addEventListener('pageswap', function (e) {
    if (!e.viewTransition || !e.activation) return;
    clear();
    var to = path(e.activation.entry.url), here = path(location.href);
    if (isProject(here)) {
      if (isProject(to) || isList(to)) name(document.querySelector('.cover.wide'), e.viewTransition);
    } else if (isProject(to)) {
      name(cardCover(to), e.viewTransition);
    }
  });

  // Página que entra
  window.addEventListener('pagereveal', function (e) {
    if (!e.viewTransition) return;
    clear();
    var act = window.navigation && navigation.activation;
    if (!act || !act.from) return;
    var from = path(act.from.url), here = path(location.href);
    if (isProject(here)) {
      if (isProject(from) || isList(from)) name(document.querySelector('.cover.wide'), e.viewTransition);
    } else if (isProject(from)) {
      name(cardCover(from), e.viewTransition);
    }
  });
})();
