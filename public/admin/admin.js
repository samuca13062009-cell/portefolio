'use strict';
(function () {
  const $ = (id) => document.getElementById(id);
  const main = $('main');
  let csrf = '';
  let content = null;
  let view = 'dashboard';

  // ---------- Utilitários ----------
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === false || v == null) continue;
      if (k === 'class') el.className = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'value') el.value = v;
      else if (k === 'checked') el.checked = Boolean(v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat(Infinity)) {
      if (kid == null || kid === false) continue;
      el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    }
    return el;
  }

  let toastTimer;
  function toast(text, bad) {
    const t = $('toast');
    t.textContent = text;
    t.className = bad ? 'toast bad' : 'toast';
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 4000);
  }

  async function api(method, url, body) {
    let r;
    try {
      r = await fetch(url, {
        method,
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (e) {
      toast('Sem ligação ao servidor.', true);
      return { ok: false, status: 0, data: {} };
    }
    const data = await r.json().catch(() => ({}));
    if (r.status === 401 && url !== '/api/admin/login') showLogin();
    return { ok: r.ok && data.ok !== false, status: r.status, data };
  }

  const date = (iso) => new Date(iso).toLocaleString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  let uid = 0;
  const nextId = () => `f${(uid += 1)}`;

  // Botão de eliminar em dois passos: o primeiro clique arma, o segundo confirma.
  function dangerButton(label, action) {
    const b = h('button', { type: 'button', class: 'btn small danger' }, label);
    let timer;
    b.addEventListener('click', () => {
      if (b.classList.contains('armed')) { clearTimeout(timer); action(); return; }
      b.classList.add('armed');
      b.textContent = 'Confirmar';
      timer = setTimeout(() => { b.classList.remove('armed'); b.textContent = label; }, 4000);
    });
    return b;
  }

  // ---------- Construtor de formulários ----------
  // Cada campo devolve { el, get }, e build() junta-os num objeto.
  const FIELD = {
    text(f, v) {
      const id = nextId();
      const input = h('input', { id, type: f.inputType || 'text', value: v || '', maxlength: f.max || 300 });
      return { el: wrap(f, id, input), get: () => (f.inputType === 'password' ? input.value : input.value.trim()) };
    },
    area(f, v) {
      const id = nextId();
      const input = h('textarea', { id, rows: f.rows || 3, value: v || '' });
      return { el: wrap(f, id, input), get: () => input.value.trim() };
    },
    check(f, v) {
      const input = h('input', { type: 'checkbox', checked: v === true });
      return { el: h('label', { class: 'check' }, input, f.label), get: () => input.checked };
    },
    select(f, v) {
      const id = nextId();
      const input = h('select', { id }, f.options.map(([value, label]) => h('option', { value }, label)));
      input.value = v || f.options[0][0];
      return { el: wrap(f, id, input), get: () => input.value };
    },
    // Lista de textos separados por vírgulas.
    csv(f, v) {
      const id = nextId();
      const input = h('input', { id, type: 'text', value: (v || []).join(', ') });
      return { el: wrap(f, id, input), get: () => input.value.split(',').map((s) => s.trim()).filter(Boolean) };
    },
    // Texto em português e em inglês, lado a lado.
    bi(f, v) {
      const make = (lang) => {
        const id = nextId();
        const input = f.area
          ? h('textarea', { id, rows: f.rows || 3, value: (v && v[lang]) || '' })
          : h('input', { id, type: 'text', value: (v && v[lang]) || '' });
        return { input, el: h('div', null, h('label', { class: 'mono', for: id }, lang === 'pt' ? 'Português' : 'Inglês'), input) };
      };
      const pt = make('pt');
      const en = make('en');
      return {
        el: h('div', { class: 'fgroup' }, h('span', { class: 'flabel' }, f.label), f.hint && h('span', { class: 'hint' }, f.hint), h('div', { class: 'pair' }, pt.el, en.el)),
        get: () => ({ pt: pt.input.value.trim(), en: en.input.value.trim() }),
      };
    },
    // Várias linhas em cada língua: uma entrada por linha.
    bilines(f, v) {
      const inner = FIELD.bi({ ...f, area: true, rows: f.rows || 5, hint: f.hint || 'Uma entrada por linha.' },
        { pt: ((v && v.pt) || []).join('\n'), en: ((v && v.en) || []).join('\n') });
      const split = (s) => s.split('\n').map((x) => x.trim()).filter(Boolean);
      return { el: inner.el, get: () => { const r = inner.get(); return { pt: split(r.pt), en: split(r.en) }; } };
    },
    // Competências: uma por linha; "português | inglês" quando a tradução é diferente.
    mix(f, v) {
      const id = nextId();
      const text = (v || []).map((i) => (typeof i === 'string' ? i : `${i.pt} | ${i.en}`)).join('\n');
      const input = h('textarea', { id, rows: f.rows || 5, value: text });
      return {
        el: wrap({ ...f, hint: 'Uma por linha. Para traduzir, escreve: português | inglês' }, id, input),
        get: () => input.value.split('\n').map((line) => {
          const [pt, en] = line.split('|').map((s) => s.trim());
          if (!pt) return null;
          return en && en !== pt ? { pt, en } : pt;
        }).filter(Boolean),
      };
    },
    // Lista de itens, cada um com os seus campos.
    list(f, v) {
      const box = h('div', { class: 'items' });
      const rows = [];
      const add = (value) => {
        const form = build(f.fields, value || {});
        const row = { get: form.get };
        const up = h('button', { type: 'button', class: 'btn small', onclick: () => {
          const i = rows.indexOf(row);
          if (i <= 0) return;
          rows.splice(i - 1, 0, rows.splice(i, 1)[0]);
          box.insertBefore(row.el, rows[i].el);
        } }, 'Subir');
        const remove = dangerButton('Remover', () => { rows.splice(rows.indexOf(row), 1); row.el.remove(); });
        row.el = h('div', { class: 'item' }, h('div', { class: 'item-head' }, h('span', { class: 'mono' }, f.itemLabel), h('div', { class: 'row-actions' }, up, remove)), form.el);
        rows.push(row);
        box.append(row.el);
      };
      (v || []).forEach(add);
      const addBtn = h('button', { type: 'button', class: 'btn small', onclick: () => add() }, `Adicionar ${f.itemLabel.toLowerCase()}`);
      return {
        el: h('div', { class: 'fgroup' }, h('span', { class: 'flabel' }, f.label), box, h('div', null, addBtn)),
        get: () => rows.map((r) => r.get()),
      };
    },
  };
  function wrap(f, id, input) {
    return h('div', { class: 'fgroup' }, h('label', { for: id }, f.label), f.hint && h('span', { class: 'hint' }, f.hint), input);
  }
  function build(fields, value) {
    const el = h('div', { class: 'form' });
    const parts = fields.map((f) => {
      const part = FIELD[f.type || 'text'](f, value[f.key]);
      el.append(part.el);
      return [f.key, part];
    });
    return { el, get: () => Object.fromEntries(parts.map(([k, p]) => [k, p.get()])) };
  }

  // ---------- Sessão ----------
  function showLogin() {
    csrf = '';
    $('app').hidden = true;
    $('login').hidden = false;
    $('l-pass').value = '';
    $('l-user').focus();
  }
  function showApp() {
    $('login').hidden = true;
    $('app').hidden = false;
    go(view);
  }
  $('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = $('login-error');
    err.hidden = true;
    const r = await api('POST', '/api/admin/login', { user: $('l-user').value.trim(), password: $('l-pass').value });
    if (r.ok) { csrf = r.data.csrf; view = 'dashboard'; showApp(); return; }
    err.textContent = r.status === 429
      ? 'Demasiadas tentativas. Tenta de novo daqui a 15 minutos.'
      : 'Utilizador ou palavra-passe incorretos.';
    err.hidden = false;
  });
  $('logout').addEventListener('click', async () => {
    await api('POST', '/api/admin/logout');
    showLogin();
  });

  // ---------- Navegação ----------
  const VIEWS = {};
  function go(name) {
    view = name;
    document.querySelectorAll('.side-link[data-view]').forEach((b) => {
      if (b.dataset.view === name) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });
    main.replaceChildren(h('p', { class: 'muted' }, 'A carregar…'));
    VIEWS[name]();
  }
  document.querySelectorAll('.side-link[data-view]').forEach((b) => b.addEventListener('click', () => go(b.dataset.view)));

  const head = (kicker, title, action) => h('div', { class: 'view-head' }, h('div', null, h('p', { class: 'mono' }, kicker), h('h1', { class: 'display' }, title)), action);
  function setUnread(n) {
    const badge = $('unread-badge');
    badge.textContent = n;
    badge.hidden = !n;
  }
  async function loadContent() {
    const r = await api('GET', '/api/admin/content');
    if (r.ok) content = r.data.content;
    return r.ok;
  }

  // ---------- Dashboard ----------
  VIEWS.dashboard = async () => {
    const r = await api('GET', '/api/admin/dashboard');
    if (!r.ok) return;
    const d = r.data;
    setUnread(d.messages.unread);
    const stat = (label, num, note) => h('div', { class: 'stat' }, h('div', { class: 'muted' }, label), h('div', { class: 'stat-num' }, num), h('div', { class: 'muted' }, note));
    const max = Math.max(1, ...d.visits.days.map((x) => x.total));
    const chart = h('div', { class: 'chart', role: 'img', 'aria-label': `Visitas por dia nos últimos 30 dias, ${d.visits.total} no total` },
      d.visits.days.map((x) => {
        const bar = h('div', { class: x.total ? 'bar' : 'bar zero', title: `${x.day}: ${x.total}` });
        bar.style.height = `${Math.max(2, Math.round((x.total / max) * 100))}%`;
        return bar;
      }));
    const top = d.visits.top.length
      ? h('table', null, h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'Página'), h('th', { scope: 'col' }, 'Visitas'))),
        h('tbody', null, d.visits.top.map(([p, n]) => h('tr', null, h('td', null, p), h('td', { class: 'strong' }, n)))))
      : h('p', { class: 'empty-note' }, 'Ainda não há visitas registadas.');
    const recent = d.messages.recent.length
      ? h('table', null, h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'Estado'), h('th', { scope: 'col' }, 'Nome'), h('th', { scope: 'col' }, 'Assunto'), h('th', { scope: 'col' }, 'Recebida'))),
        h('tbody', null, d.messages.recent.map((m) => h('tr', null,
          h('td', null, h('span', { class: m.read ? 'state quiet' : 'state new' }, m.read ? 'Lida' : 'Nova')),
          h('td', { class: 'strong' }, m.name), h('td', null, m.subject), h('td', { class: 'nowrap' }, date(m.date))))))
      : h('p', { class: 'empty-note' }, 'Ainda não recebeste mensagens.');
    main.replaceChildren(
      head('Sessão iniciada', 'Dashboard', h('button', { type: 'button', class: 'btn primary', onclick: () => editProject(null) }, 'Novo projeto')),
      h('div', { class: 'stats' },
        stat('Projetos publicados', d.projects.published, `${d.projects.draft} em rascunho`),
        stat('Mensagens por ler', d.messages.unread, `${d.messages.month} recebidas este mês`),
        stat('Visitas nos últimos 30 dias', d.visits.total, d.visits.top[0] ? `Página mais vista: ${d.visits.top[0][0]}` : 'Sem visitas ainda'),
        stat('Descargas do CV', d.cvDownloads, 'Nos últimos 30 dias')),
      h('div', { class: 'two' },
        h('section', { class: 'box' }, h('h2', null, 'Visitas por dia'), chart, h('div', { class: 'chart-foot' }, h('span', null, d.visits.days[0].day), h('span', null, 'hoje'))),
        h('section', { class: 'box' }, h('h2', null, 'Páginas mais vistas'), h('div', { class: 'table-wrap' }, top))),
      h('section', { class: 'box' },
        h('div', { class: 'box-head' }, h('h2', null, 'Mensagens recentes'), h('button', { type: 'button', class: 'btn small', onclick: () => go('messages') }, 'Ver todas')),
        h('div', { class: 'table-wrap' }, recent)));
  };

  // ---------- Projetos ----------
  VIEWS.projects = async () => {
    if (!(await loadContent())) return;
    const rows = content.projects.map((p) => h('tr', null,
      h('td', { class: 'strong' }, p.title.pt),
      h('td', null, (content.categories[p.category] || {}).pt || p.category),
      h('td', null, h('span', { class: p.published === false ? 'state quiet' : 'state' }, p.published === false ? 'Rascunho' : 'Publicado')),
      h('td', null, p.featured ? 'Sim' : 'Não'),
      h('td', null, h('div', { class: 'row-actions' },
        h('button', { type: 'button', class: 'btn small', onclick: () => editProject(p) }, 'Editar'),
        dangerButton('Eliminar', async () => {
          const r = await api('DELETE', `/api/admin/projects/${p.slug}`);
          if (r.ok) { toast('Projeto eliminado.'); go('projects'); } else toast('Não foi possível eliminar.', true);
        })))));
    main.replaceChildren(
      head('Gestão de projetos', 'Projetos', h('button', { type: 'button', class: 'btn primary', onclick: () => editProject(null) }, 'Novo projeto')),
      h('section', { class: 'box' }, h('div', { class: 'table-wrap' }, content.projects.length
        ? h('table', null, h('thead', null, h('tr', null, ['Projeto', 'Categoria', 'Estado', 'Destaque', 'Ações'].map((t) => h('th', { scope: 'col' }, t)))), h('tbody', null, rows))
        : h('p', { class: 'empty-note' }, 'Ainda não há projetos. Cria o primeiro.'))));
  };

  async function editProject(p) {
    if (!content && !(await loadContent())) return;
    view = 'projects';
    const isNew = !p;
    const form = build([
      { key: 'title', type: 'bi', label: 'Título' },
      { key: 'cover', label: 'Nome curto para a capa', hint: 'Aparece em grande no cartão do projeto.', max: 40 },
      { key: 'category', type: 'select', label: 'Categoria', options: Object.entries(content.categories).map(([k, v]) => [k, v.pt]) },
      { key: 'summary', type: 'bi', area: true, rows: 2, label: 'Resumo' },
      { key: 'description', type: 'bilines', label: 'Descrição', hint: 'Um parágrafo por linha.' },
      { key: 'features', type: 'bilines', label: 'O que faz', hint: 'Uma funcionalidade por linha.' },
      { key: 'tech', type: 'csv', label: 'Tecnologias', hint: 'Separadas por vírgulas.' },
      { key: 'repo', label: 'Ligação para o código', hint: 'Endereço completo, a começar por https://', inputType: 'url' },
    ], p || { category: Object.keys(content.categories)[0] });
    const flags = build([
      { key: 'published', type: 'check', label: 'Publicado no website' },
      { key: 'featured', type: 'check', label: 'Em destaque na Home' },
    ], p || { published: true });
    flags.el.className = 'checks';
    const save = h('button', { type: 'button', class: 'btn primary' }, isNew ? 'Criar projeto' : 'Guardar alterações');
    save.addEventListener('click', async () => {
      const data = { ...form.get(), ...flags.get() };
      if (!data.title.pt) { toast('O título em português é obrigatório.', true); return; }
      save.disabled = true;
      const r = isNew ? await api('POST', '/api/admin/projects', data) : await api('PUT', `/api/admin/projects/${p.slug}`, data);
      save.disabled = false;
      if (!r.ok) { toast('Não foi possível guardar. Verifica os campos.', true); return; }
      toast(isNew ? 'Projeto criado.' : 'Projeto guardado.');
      go('projects');
    });
    main.replaceChildren(
      head(isNew ? 'Novo projeto' : 'Editar projeto', isNew ? 'Novo projeto' : p.title.pt, h('button', { type: 'button', class: 'btn', onclick: () => go('projects') }, 'Voltar à lista')),
      h('section', { class: 'box' }, flags.el, form.el),
      h('div', { class: 'save-bar' }, save, !isNew && p.published !== false && h('a', { class: 'text-link', href: `/projetos/${p.slug}`, target: '_blank', rel: 'noopener' }, 'Ver no website')));
    main.focus();
  }

  // ---------- Conteúdos ----------
  const SECTIONS = [
    ['site', 'Dados gerais e SEO', [
      { key: 'name', label: 'Nome', max: 80 },
      { key: 'role', type: 'bi', label: 'Profissão ou situação atual' },
      { key: 'location', type: 'bi', label: 'Localização' },
      { key: 'description', type: 'bi', area: true, rows: 2, label: 'Descrição para motores de busca' },
      { key: 'linkedin', label: 'LinkedIn', hint: 'Endereço completo, a começar por https://', inputType: 'url' },
      { key: 'github', label: 'GitHub', hint: 'Endereço completo, a começar por https://', inputType: 'url' },
    ]],
    ['home', 'Home', [
      { key: 'kicker', type: 'bi', label: 'Linha por cima do título' },
      { key: 'title', type: 'bi', label: 'Título' },
      { key: 'lead', type: 'bi', area: true, label: 'Frase de apresentação' },
      { key: 'facts', type: 'list', label: 'Cartão de factos', itemLabel: 'Facto', fields: [
        { key: 'label', type: 'bi', label: 'Etiqueta' },
        { key: 'value', type: 'bi', label: 'Valor' },
      ] },
    ]],
    ['about', 'Sobre mim', [
      { key: 'title', type: 'bi', area: true, rows: 2, label: 'Título' },
      { key: 'paragraphs', type: 'bilines', rows: 10, label: 'Biografia', hint: 'Um parágrafo por linha.' },
    ]],
    ['experience', 'Experiência', [
      { key: 'role', type: 'bi', label: 'Função' },
      { key: 'org', label: 'Empresa' },
      { key: 'period', type: 'bi', label: 'Período' },
      { key: 'bullets', type: 'bilines', label: 'Responsabilidades' },
    ], 'Experiência'],
    ['education', 'Formação', [
      { key: 'title', type: 'bi', label: 'Curso' },
      { key: 'org', label: 'Escola' },
      { key: 'period', type: 'bi', label: 'Período' },
      { key: 'note', type: 'bi', label: 'Nota' },
    ], 'Formação'],
    ['skills', 'Competências', [
      { key: 'group', type: 'bi', label: 'Nome do grupo' },
      { key: 'items', type: 'mix', label: 'Competências' },
    ], 'Grupo'],
    ['languages', 'Línguas', [
      { key: 'name', type: 'bi', label: 'Língua' },
      { key: 'level', type: 'bi', label: 'Nível' },
    ], 'Língua'],
  ];
  let section = 'site';

  VIEWS.content = async () => {
    if (!(await loadContent())) return;
    const [key, title, fields, itemLabel] = SECTIONS.find((s) => s[0] === section);
    // Secções que são listas (experiência, formação…) usam o campo "list" à volta dos seus itens.
    const form = itemLabel
      ? build([{ key, type: 'list', label: title, itemLabel, fields }], content)
      : build(fields, content[key]);
    const tabs = h('div', { class: 'tabs', role: 'group', 'aria-label': 'Secção a editar' }, SECTIONS.map(([k, t]) =>
      h('button', { type: 'button', class: 'chip', 'aria-pressed': String(k === section), onclick: () => { section = k; go('content'); } }, t)));
    const save = h('button', { type: 'button', class: 'btn primary' }, 'Guardar alterações');
    save.addEventListener('click', async () => {
      const value = form.get();
      const next = { ...content, [key]: itemLabel ? value[key] : value };
      save.disabled = true;
      const r = await api('PUT', '/api/admin/content', next);
      save.disabled = false;
      if (!r.ok) { toast('Não foi possível guardar.', true); return; }
      content = r.data.content;
      toast('Conteúdos guardados. O website já mostra as alterações.');
    });
    const pdf = h('button', { type: 'button', class: 'btn' }, 'Atualizar PDF do CV');
    pdf.addEventListener('click', async () => {
      pdf.disabled = true;
      pdf.textContent = 'A gerar PDF…';
      const r = await api('POST', '/api/admin/cv-pdf');
      pdf.disabled = false;
      pdf.textContent = 'Atualizar PDF do CV';
      toast(r.ok ? 'PDF do CV atualizado.' : 'Não foi possível gerar o PDF. É preciso o Chrome ou o Edge no servidor.', !r.ok);
    });
    main.replaceChildren(
      head('Gestão de conteúdos', 'Conteúdos'),
      tabs,
      h('section', { class: 'box' }, h('h2', null, title), form.el),
      h('div', { class: 'save-bar' }, save, pdf, h('span', { class: 'hint' }, 'O PDF do CV só muda quando o atualizas.')));
  };

  // ---------- Contactos ----------
  const DELIVERY = { enviado: 'Enviada por email (Brevo)', falhou: 'O envio por email falhou', 'brevo-por-configurar': 'Guardada; Brevo por configurar' };
  VIEWS.messages = async () => {
    const r = await api('GET', '/api/admin/messages');
    if (!r.ok) return;
    const all = r.data.messages;
    setUnread(all.filter((m) => !m.read).length);
    const open = (m) => {
      const mark = async (read) => {
        const res = await api('PATCH', `/api/admin/messages/${m.id}`, { read });
        if (res.ok) { m.read = read; setUnread(all.filter((x) => !x.read).length); }
      };
      if (!m.read) mark(true);
      main.replaceChildren(
        head('Mensagem', m.subject, h('button', { type: 'button', class: 'btn', onclick: () => go('messages') }, 'Voltar à lista')),
        h('section', { class: 'box msg' },
          h('div', { class: 'msg-meta' }, h('span', null, h('strong', null, m.name)), h('a', { href: `mailto:${m.email}` }, m.email), h('span', null, date(m.date)), h('span', null, DELIVERY[m.delivery] || m.delivery)),
          h('div', { class: 'msg-body' }, m.message),
          h('div', { class: 'row-actions' },
            h('a', { class: 'btn primary small', href: `mailto:${m.email}?subject=${encodeURIComponent('Re: ' + m.subject)}` }, 'Responder por email'),
            h('button', { type: 'button', class: 'btn small', onclick: async () => { await mark(false); go('messages'); } }, 'Marcar como não lida'),
            dangerButton('Eliminar', async () => {
              const res = await api('DELETE', `/api/admin/messages/${m.id}`);
              if (res.ok) { toast('Mensagem eliminada.'); go('messages'); }
            }))));
      main.focus();
    };
    main.replaceChildren(
      head('Gestão de contactos', 'Contactos'),
      h('section', { class: 'box' }, h('div', { class: 'table-wrap' }, all.length
        ? h('table', null,
          h('thead', null, h('tr', null, ['Estado', 'Nome', 'Email', 'Assunto', 'Recebida', 'Ações'].map((t) => h('th', { scope: 'col' }, t)))),
          h('tbody', null, all.map((m) => h('tr', null,
            h('td', null, h('span', { class: m.read ? 'state quiet' : 'state new' }, m.read ? 'Lida' : 'Nova')),
            h('td', { class: m.read ? '' : 'strong' }, m.name), h('td', null, m.email), h('td', null, m.subject), h('td', { class: 'nowrap' }, date(m.date)),
            h('td', null, h('button', { type: 'button', class: 'btn small', onclick: () => open(m) }, 'Abrir'))))))
        : h('p', { class: 'empty-note' }, 'Ainda não recebeste mensagens. As que chegarem pelo formulário de contacto aparecem aqui.'))));
  };

  // ---------- Conta ----------
  VIEWS.account = () => {
    const form = build([
      { key: 'current', label: 'Palavra-passe atual', inputType: 'password' },
      { key: 'next', label: 'Nova palavra-passe', hint: 'Pelo menos 10 caracteres.', inputType: 'password' },
      { key: 'repeat', label: 'Repetir a nova palavra-passe', inputType: 'password' },
    ], {});
    const save = h('button', { type: 'submit', class: 'btn primary' }, 'Alterar palavra-passe');
    const wrapForm = h('form', { class: 'form', novalidate: true }, form.el, h('div', null, save));
    wrapForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const v = form.get();
      if (v.next.length < 10) { toast('A nova palavra-passe precisa de pelo menos 10 caracteres.', true); return; }
      if (v.next !== v.repeat) { toast('As duas palavras-passe novas não coincidem.', true); return; }
      const r = await api('POST', '/api/admin/password', { current: v.current, next: v.next });
      if (r.ok) { toast('Palavra-passe alterada.'); go('account'); return; }
      toast(r.data.error === 'current' ? 'A palavra-passe atual não está correta.' : 'Não foi possível alterar a palavra-passe.', true);
    });
    main.replaceChildren(head('Conta', 'Conta'), h('section', { class: 'box' }, h('h2', null, 'Alterar palavra-passe'), wrapForm));
  };

  // ---------- Arranque ----------
  (async () => {
    const r = await fetch('/api/admin/session', { credentials: 'same-origin' }).then((x) => x.json().catch(() => ({}))).catch(() => ({}));
    if (r.ok) { csrf = r.csrf; showApp(); } else showLogin();
  })();
})();
