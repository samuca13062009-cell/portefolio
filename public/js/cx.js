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
})();
