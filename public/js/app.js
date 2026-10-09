'use strict';
(function () {
  var en = document.documentElement.lang.indexOf('en') === 0;
  var $ = function (id) { return document.getElementById(id); };

  // ---------- Modo escuro ----------
  var toggle = $('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var root = document.documentElement;
      var current = root.getAttribute('data-theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      var next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('tema', next); } catch (e) { /* ignora */ }
    });
  }

  // ---------- Pesquisa e filtragem de projetos ----------
  var list = $('lista-projetos');
  if (list) {
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-project]'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
    var search = $('pesquisa');
    var count = $('contagem');
    var empty = $('sem-resultados');
    var cat = 'all';

    var apply = function () {
      var q = search.value.trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (card) {
        var ok = (cat === 'all' || card.dataset.cat === cat) &&
          (!q || card.dataset.search.indexOf(q) !== -1);
        card.hidden = !ok;
        if (ok) shown += 1;
      });
      count.textContent = shown + ' ' + (shown === 1 ? count.dataset.one : count.dataset.many);
      empty.hidden = shown !== 0;
    };
    var setCat = function (value) {
      cat = value;
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.filter === value)); });
      apply();
    };
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () { setCat(chip.dataset.filter); });
    });
    search.addEventListener('input', apply);
    $('limpar-filtros').addEventListener('click', function () {
      search.value = '';
      setCat('all');
      search.focus();
    });
  }

  // ---------- Formulário de contacto ----------
  var form = $('form-contacto');
  if (form) {
    var MSG = en ? {
      name: 'Enter your name.',
      email: 'Enter a valid email, like name@example.com.',
      subject: 'Enter the subject of your message.',
      message: 'Write at least 10 characters.',
      rate: 'Too many messages in a short time. Try again in a few minutes.',
      server: 'The message could not be sent. Try again, or contact me on LinkedIn.',
      sending: 'Sending…'
    } : {
      name: 'Indique o seu nome.',
      email: 'Escreva um email válido, como nome@exemplo.pt.',
      subject: 'Indique o assunto da mensagem.',
      message: 'Escreva pelo menos 10 caracteres.',
      rate: 'Demasiadas mensagens em pouco tempo. Tente de novo daqui a uns minutos.',
      server: 'Não foi possível enviar a mensagem. Tente de novo ou contacte-me pelo LinkedIn.',
      sending: 'A enviar…'
    };
    var FIELDS = [
      { key: 'name', id: 'nome', bad: function (v) { return v.length < 2; } },
      { key: 'email', id: 'email', bad: function (v) { return !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); } },
      { key: 'subject', id: 'assunto', bad: function (v) { return v.length < 2; } },
      { key: 'message', id: 'mensagem', bad: function (v) { return v.length < 10; } }
    ];
    var button = $('enviar');
    var buttonHtml = button.innerHTML;
    var sendError = $('erro-envio');
    var success = $('sucesso');
    var tried = false;

    var mark = function (f, isBad) {
      var input = $(f.id);
      var error = $(f.id + '-erro');
      input.setAttribute('aria-invalid', String(isBad));
      error.textContent = isBad ? MSG[f.key] : '';
      error.hidden = !isBad;
    };
    var validate = function () {
      var firstBad = null;
      FIELDS.forEach(function (f) {
        var isBad = f.bad($(f.id).value.trim());
        mark(f, isBad);
        if (isBad && !firstBad) firstBad = $(f.id);
      });
      return firstBad;
    };
    FIELDS.forEach(function (f) {
      $(f.id).addEventListener('input', function () {
        if (tried) mark(f, f.bad($(f.id).value.trim()));
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      tried = true;
      sendError.hidden = true;
      var firstBad = validate();
      if (firstBad) { firstBad.focus(); return; }

      var payload = { website: $('website').value };
      FIELDS.forEach(function (f) { payload[f.key] = $(f.id).value.trim(); });
      button.disabled = true;
      button.textContent = MSG.sending;

      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (data) { return { status: r.status, data: data }; });
      }).then(function (res) {
        if (res.status === 200 && res.data.ok) {
          form.hidden = true;
          success.hidden = false;
          success.focus();
          return;
        }
        if (res.status === 422 && res.data.fields) {
          FIELDS.forEach(function (f) { mark(f, Boolean(res.data.fields[f.key])); });
          return;
        }
        sendError.textContent = res.status === 429 ? MSG.rate : MSG.server;
        sendError.hidden = false;
      }).catch(function () {
        sendError.textContent = MSG.server;
        sendError.hidden = false;
      }).then(function () {
        button.disabled = false;
        button.innerHTML = buttonHtml;
      });
    });

    $('nova-mensagem').addEventListener('click', function () {
      form.reset();
      tried = false;
      FIELDS.forEach(function (f) { mark(f, false); });
      success.hidden = true;
      form.hidden = false;
      $('nome').focus();
    });
  }
})();
