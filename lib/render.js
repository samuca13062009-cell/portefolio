'use strict';
// Gera o HTML de cada página a partir de data/content.json.

// Corta numa palavra inteira, para a descrição caber no resultado de pesquisa.
const clip = (s, n = 155) => {
  const t = String(s ?? '').replace(/\s+/g, ' ').trim();
  if (t.length <= n) return t;
  const cut = t.slice(0, n - 1);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:.\s]+$/, '') + '…';
};

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
));

const ROUTES = {
  pt: { home: '/', about: '/sobre', projects: '/projetos', cv: '/cv', cvPrint: '/cv/imprimir', contact: '/contacto', privacy: '/privacidade', terms: '/termos', cookies: '/cookies' },
  en: { home: '/en', about: '/en/about', projects: '/en/projects', cv: '/en/cv', cvPrint: '/en/cv/print', contact: '/en/contact', privacy: '/en/privacy', terms: '/en/terms', cookies: '/en/cookies' },
};

const CV_PDF = { pt: '/cv/samuel-camargo-cv-pt.pdf', en: '/cv/samuel-camargo-cv-en.pdf' };

const ICON = {
  arrow: '<svg class="ic ic-go" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  back: '<svg class="ic ic-back" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
  download: '<svg class="ic ic-down" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v12M6 11l6 6 6-6M5 20h14"/></svg>',
  external: '<svg class="ic ic-ext" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9"/></svg>',
  swatch: '<svg class="ic-tema" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg>',
  theme: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
  linkedin: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.064 2.064 0 1 1 0-4.128 2.064 2.064 0 0 1 0 4.128zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
  github: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>',
  mail: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5"/></svg>',
  pin: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/></svg>',
  check: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" pathLength="1"/></svg>',
};

const { THEMES, pickTheme } = require('./themes');
const { legal } = require('./legal');

// Texto só para leitores de ecrã, a avisar que a ligação abre noutro separador.
const NEW_TAB = { pt: '<span class="sr"> (abre noutro separador)</span>', en: '<span class="sr"> (opens in a new tab)</span>' };

// previewSkin: tema pedido no endereço (?tema=), para experimentar sem o guardar.
function renderer(content, lang, siteUrl, previewSkin, opts = {}) {
  const other = lang === 'pt' ? 'en' : 'pt';
  const R = ROUTES[lang];
  const T = (pt, en) => (lang === 'pt' ? pt : en);
  const L = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? (v[lang] ?? v.pt) : v);
  const site = content.site;
  const skin = pickTheme(previewSkin, site.theme);
  const previewing = Boolean(previewSkin) && skin === previewSkin;
  const NT = NEW_TAB[lang];
  const projects = content.projects.filter((p) => p.published !== false);
  const projectPath = (p, l = lang) => `${ROUTES[l].projects}/${p.slug}`;
  const catLabel = (p) => L(content.categories[p.category]) || p.category;

  const NAV = [
    ['home', 'Home', 'Home'],
    ['about', 'Sobre mim', 'About'],
    ['projects', 'Projetos', 'Projects'],
    ['cv', 'CV', 'CV'],
    ['contact', 'Contacto', 'Contact'],
  ];

  function layout({ page, title, description, path, altPath, body, noindex, jsonLd }) {
    const fullTitle = page === 'home' ? `${site.name} — ${L(site.role)}` : `${title} — ${site.name}`;
    const desc = clip(description || L(site.description));
    const ogImage = `${siteUrl}/og/og-${lang}.png`;
    const canonical = siteUrl + path;
    const nav = NAV.map(([key, pt, en]) => (
      `<a class="nav-link" href="${R[key]}"${key === page ? ' aria-current="page"' : ''}>${T(pt, en)}${key === page ? '<i class="nav-mark" aria-hidden="true"></i>' : ''}</a>`
    )).join('');
    return `<!doctype html>
<html lang="${lang === 'pt' ? 'pt-PT' : 'en'}" data-skin="${skin}" data-skin-default="${pickTheme(site.theme)}"${previewing ? ' data-skin-locked' : ''}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(desc)}">
${noindex ? '<meta name="robots" content="noindex">' : ''}
<link rel="canonical" href="${esc(canonical)}">
<link rel="alternate" hreflang="${lang === 'pt' ? 'pt-PT' : 'en'}" href="${esc(canonical)}">
<link rel="alternate" hreflang="${other === 'pt' ? 'pt-PT' : 'en'}" href="${esc(siteUrl + altPath)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:locale" content="${lang === 'pt' ? 'pt_PT' : 'en_GB'}">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:image" content="${esc(ogImage)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(`${site.name} — ${L(content.home.kicker)}`)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(fullTitle)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(ogImage)}">
<meta name="theme-color" content="#EEF0EA" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#10130E" media="(prefers-color-scheme: dark)">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="stylesheet" href="/css/fonts.css">
<link rel="stylesheet" href="/css/style.css">
<link rel="stylesheet" href="/css/themes.css">
<script src="/js/theme.js"></script>
<script src="/js/motion.js"></script>
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>` : ''}
</head>
<body>
${previewing ? `<div class="preview-bar" data-preview="${skin}">${T('Pré-visualização do tema', 'Theme preview')} <strong>${esc(THEMES[skin].name)}</strong> <a href="${esc(path)}">${T('Sair da pré-visualização', 'Leave preview')}</a></div>` : ''}
<a class="skip" href="#conteudo">${T('Saltar para o conteúdo', 'Skip to content')}</a>
<div class="wrap">
<header class="site-header">
<a class="brand" href="${R.home}"><span class="brand-mark" aria-hidden="true">SC</span><span>${esc(site.name)}</span></a>
<nav class="nav" aria-label="${T('Principal', 'Main')}">${nav}</nav>
<div class="tools">
<div class="skin-menu">
<button class="pill-btn" type="button" id="skin-toggle" aria-expanded="false" aria-controls="skin-list">${ICON.swatch}<span class="tema-txt">${T('Tema', 'Theme')}</span><span class="sr">: <span id="skin-current">${esc(THEMES[skin].name)}</span></span></button>
<div class="skin-list" id="skin-list" role="group" aria-label="${T('Tema do site', 'Site theme')}" hidden>
${Object.entries(THEMES).map(([id, t]) => `<button class="skin-opt" type="button" data-skin-value="${id}" aria-pressed="${id === skin}">${esc(t.name)}</button>`).join('\n')}
</div>
</div>
<a class="pill-btn" href="${esc(altPath)}" hreflang="${other}" lang="${other}">${other.toUpperCase()}<span class="sr">${T(' — English version', ' — versão em português')}</span></a>
<button class="icon-btn" type="button" id="theme-toggle" aria-pressed="false" aria-label="${T('Modo escuro', 'Dark mode')}">${ICON.theme}</button>
</div>
</header>
<main id="conteudo">
${body}
</main>
<footer class="site-footer">
<p>© ${new Date().getFullYear()} ${esc(site.name)} · ${esc(L(site.location))}</p>
<div class="footer-links">
<a class="nav-link" href="${esc(site.linkedin)}" rel="me noopener" target="_blank">LinkedIn${NT}</a>
<a class="nav-link" href="${esc(site.github)}" rel="me noopener" target="_blank">GitHub${NT}</a>
<a class="nav-link" href="${R.contact}">${T('Contacto', 'Contact')}</a>
<a class="nav-link" href="${R.privacy}">${T('Privacidade', 'Privacy')}</a>
<a class="nav-link" href="${R.cookies}">Cookies</a>
<a class="nav-link" href="${R.terms}">${T('Termos', 'Terms')}</a>
<a class="nav-link" href="/admin" rel="nofollow">${T('Área reservada', 'Admin')}</a>
</div>
</footer>
</div>
<script src="/js/app.js" defer></script>
</body>
</html>`;
  }

  // Captura real de um projeto, em duas larguras (o telemóvel descarrega a mais leve).
  const shot = (im, eager = false) => `<img class="shot" src="${esc(im.src)}-1440.jpg" srcset="${esc(im.src)}-720.jpg 720w, ${esc(im.src)}-1440.jpg 1440w" sizes="(max-width: 760px) 100vw, 64vw" width="1440" height="900" alt="${esc(L(im.alt))}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">`;
  const images = (p) => (Array.isArray(p.images) ? p.images : []);
  // Imagem principal de um projeto: a captura, ou um painel com o nome quando não há imagem.
  const media = (p, cls = '', eager = false) => (images(p).length
    ? `<div class="cover has-shot ${cls}">${shot(images(p)[0], eager)}</div>`
    : `<div class="cover ${cls}"><span class="cover-tech">${esc(catLabel(p))}</span><span class="cover-name">${esc(p.cover || L(p.title))}</span></div>`);

  const card = (p) => `<a class="card${images(p).length ? '' : ' card-text'}" href="${projectPath(p)}" data-project data-cat="${esc(p.category)}" data-search="${esc([L(p.title), catLabel(p), ...p.tech].join(' ').toLowerCase())}">
${images(p).length ? media(p) : ''}
<div class="card-body">
<h3 class="card-title">${esc(L(p.title))}</h3>
<p class="card-sum">${esc(L(p.summary))}</p>
<p class="meta">${esc(catLabel(p))} · ${esc(p.tech.join(' · '))}</p>
</div>
</a>`;

  const tags = (items) => `<ul class="tags">${items.map((i) => `<li>${esc(L(i))}</li>`).join('')}</ul>`;

  const timeline = (rows) => rows.map((r) => `<div class="row">
<div class="row-when">${esc(L(r.period))}</div>
<div class="row-what">
<h3>${esc(L(r.role || r.title))}</h3>
<div class="muted">${esc(r.org)}</div>
${r.bullets ? `<ul class="bullets">${L(r.bullets).map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
${r.note ? `<p class="muted">${esc(L(r.note))}</p>` : ''}
</div>
</div>`).join('');

  const skillsBlock = () => `<div class="skills">
${content.skills.map((g) => `<div><h3>${esc(L(g.group))}</h3><ul>${g.items.map((i) => `<li>${esc(L(i))}</li>`).join('')}</ul></div>`).join('')}
<div><h3>${T('Línguas', 'Languages')}</h3><ul>${content.languages.map((l) => `<li>${esc(L(l.name))} <span class="muted">· ${esc(L(l.level))}</span></li>`).join('')}</ul></div>
</div>`;

  const photo = () => (site.photo && site.photo.src
    ? `<figure class="hero-photo"><img src="${esc(site.photo.src)}" width="600" height="750" alt="${esc(L(site.photo.alt) || site.name)}" fetchpriority="high" decoding="async"></figure>`
    : '');

  function home() {
    const featured = projects.filter((p) => p.featured);
    const withShots = featured.filter((p) => images(p).length);
    const others = projects.filter((p) => !withShots.includes(p));
    const lead = withShots[0];
    const body = `<section class="hero bleed deep${site.photo && site.photo.src ? ' with-photo' : ''}">
<div class="hero-text">
<h1 class="display xl words">${String(L(content.home.title)).split(/\s+/).filter(Boolean).map((w) => `<span class="w">${esc(w)}</span>`).join(' ')}</h1>
<p class="hero-role">${esc(L(content.home.kicker))}</p>
<p class="lead">${esc(L(content.home.lead))}</p>
<div class="actions">
<a class="btn primary" href="${R.projects}">${T('Ver projetos', 'View projects')} ${ICON.arrow}</a>
<a class="btn" href="/cv/descarregar/${lang}" download>${T('Descarregar CV', 'Download CV')} ${ICON.download}</a>
</div>
</div>
${photo() || `<dl class="facts">${content.home.facts.map((f) => `<div><dt>${esc(L(f.label))}</dt><dd>${esc(L(f.value))}</dd></div>`).join('')}</dl>`}
</section>
${photo() ? `<dl class="facts row-facts">${content.home.facts.map((f) => `<div><dt>${esc(L(f.label))}</dt><dd>${esc(L(f.value))}</dd></div>`).join('')}</dl>` : ''}

<section class="section" aria-labelledby="h-work">
<div class="section-head">
<h2 class="display" id="h-work">${T('Trabalho selecionado', 'Selected work')}</h2>
<a class="text-link" href="${R.projects}">${T('Todos os projetos', 'All projects')} ${ICON.arrow}</a>
</div>
${withShots.map((p, i) => `<article class="feature${i % 2 ? ' flip' : ''}">
<a class="card feature-media" href="${projectPath(p)}" tabindex="-1" aria-hidden="true">${media(p, '', p === lead)}</a>
<div class="feature-text">
<h3 class="feature-title"><a href="${projectPath(p)}">${esc(L(p.title))}</a></h3>
<p class="card-sum">${esc(L(p.summary))}</p>
<p class="meta">${esc(catLabel(p))} · ${esc(p.tech.join(' · '))}</p>
<a class="text-link" href="${projectPath(p)}">${T('Ver o projeto', 'See the project')} ${ICON.arrow}</a>
</div>
</article>`).join('')}
${others.length ? `<div class="more">
<h3 class="more-title">${T('Outros projetos', 'More projects')}</h3>
<ul class="more-list">${others.map((p) => `<li><a href="${projectPath(p)}"><span class="more-name">${esc(L(p.title))}</span><span class="more-sum">${esc(L(p.summary))}</span><span class="meta">${esc(p.tech.join(' · '))}</span></a></li>`).join('')}</ul>
</div>` : ''}
</section>

<section class="section split bleed tint" aria-labelledby="h-about">
<h2 class="display" id="h-about">${T('Além do código', 'Beyond the code')}</h2>
<div class="stack">
<p class="prose-lg">${esc(L(content.about.paragraphs)[2] || L(content.about.paragraphs)[0])}</p>
<div class="rows">${timeline(content.experience.map((e) => ({ ...e, bullets: null })))}</div>
<a class="text-link" href="${R.about}">${T('Conhecer o meu percurso', 'Read my background')} ${ICON.arrow}</a>
</div>
</section>

<section class="section split" aria-labelledby="h-skills">
<h2 class="display" id="h-skills">${T('O que sei fazer', 'What I can do')}</h2>
${skillsBlock()}
</section>

<section class="cta bleed deep">
<h2 class="display">${T('Tem um estágio, um projeto ou uma oportunidade?', 'Have an internship, a project or an opportunity?')}</h2>
<a class="btn inverse big" href="${R.contact}">${T('Entrar em contacto', 'Get in touch')} ${ICON.arrow}</a>
</section>`;
    return layout({
      page: 'home', path: R.home, altPath: ROUTES[other].home, body,
      jsonLd: {
        '@context': 'https://schema.org', '@type': 'Person', name: site.name,
        jobTitle: L(site.role), url: siteUrl + R.home,
        address: { '@type': 'PostalAddress', addressLocality: 'Torres Vedras', addressCountry: 'PT' },
        sameAs: [site.linkedin, site.github],
      },
    });
  }

  function about() {
    const body = `<section class="page-head bleed deep narrow">
<h1 class="display lg">${esc(L(content.about.title))}</h1>
<div class="prose">${L(content.about.paragraphs).map((p) => `<p>${esc(p)}</p>`).join('')}</div>
<div class="actions">
<a class="btn primary" href="${R.cv}">${T('Ver CV completo', 'View full CV')}</a>
<a class="btn" href="${R.contact}">${T('Falar comigo', 'Talk to me')}</a>
</div>
</section>
<section class="section split" aria-labelledby="h-exp">
<h2 class="display" id="h-exp">${T('Experiência', 'Experience')}</h2>
<div class="rows">${timeline(content.experience)}</div>
</section>
<section class="section split" aria-labelledby="h-form">
<h2 class="display" id="h-form">${T('Formação', 'Education')}</h2>
<div class="rows">${timeline(content.education)}</div>
</section>
<section class="section split last" aria-labelledby="h-skills">
<h2 class="display" id="h-skills">${T('Competências', 'Skills')}</h2>
${skillsBlock()}
</section>`;
    return layout({
      page: 'about', title: T('Sobre mim', 'About me'), path: R.about, altPath: ROUTES[other].about, body,
      description: L(content.about.paragraphs)[0],
    });
  }

  function projectsPage() {
    const cats = [...new Set(projects.map((p) => p.category))];
    const body = `<section class="page-head bleed deep">
<h1 class="display xl">${T('Projetos', 'Projects')}</h1>
<p class="lead">${T('Trabalhos de escola, de estágio e pessoais, em web, Android e jogos. O código da maioria está no GitHub.', 'School, internship and personal work across web, Android and games. Most of the code is on GitHub.')}</p>
</section>

<div class="filters">
<div class="chips" role="group" aria-label="${T('Filtrar por categoria', 'Filter by category')}">
<button class="chip" type="button" data-filter="all" aria-pressed="true">${T('Todos', 'All')}</button>
${cats.map((c) => `<button class="chip" type="button" data-filter="${esc(c)}" aria-pressed="false">${esc(L(content.categories[c]) || c)}</button>`).join('')}
</div>
<div class="search">
<label for="pesquisa">${T('Pesquisar', 'Search')}</label>
<input id="pesquisa" type="search" placeholder="${T('Nome ou tecnologia', 'Name or technology')}" autocomplete="off">
</div>
</div>

<p class="count" id="contagem" aria-live="polite" data-one="${T('projeto', 'project')}" data-many="${T('projetos', 'projects')}">${projects.length} ${T('projetos', 'projects')}</p>

<h2 class="sr">${T('Lista de projetos', 'Project list')}</h2>
<div class="grid" id="lista-projetos">${[...projects.filter((p) => images(p).length), ...projects.filter((p) => !images(p).length)].map(card).join('')}</div>

<div class="empty" id="sem-resultados" hidden>
<p>${T('Nenhum projeto corresponde a esta pesquisa.', 'No project matches this search.')}</p>
<button class="btn primary" type="button" id="limpar-filtros">${T('Limpar filtros', 'Clear filters')}</button>
</div>`;
    return layout({
      page: 'projects', title: T('Projetos', 'Projects'), path: R.projects, altPath: ROUTES[other].projects, body,
      description: T('Projetos de Samuel Camargo: sites, aplicações Android e jogos, com tecnologias e código-fonte.', 'Projects by Samuel Camargo: websites, Android apps and games, with technologies and source code.'),
    });
  }

  function project(slug) {
    const i = projects.findIndex((p) => p.slug === slug);
    if (i < 0) return null;
    const p = projects[i];
    const prev = projects[(i - 1 + projects.length) % projects.length];
    const next = projects[(i + 1) % projects.length];
    const extra = images(p).slice(1);
    const body = `<article class="project">
<a class="text-link back" href="${R.projects}">${ICON.back} ${T('Todos os projetos', 'All projects')}</a>
<h1 class="display lg">${esc(L(p.title))}</h1>
<p class="lead">${esc(L(p.summary))}</p>

${images(p).length ? `<figure class="project-hero">
${media(p, 'wide', true)}
<figcaption>${esc(L(images(p)[0].alt))}</figcaption>
</figure>` : ''}

<dl class="meta">
<div><dt>${T('Categoria', 'Category')}</dt><dd>${esc(catLabel(p))}</dd></div>
${L(p.role) ? `<div><dt>${T('O meu papel', 'My role')}</dt><dd>${esc(L(p.role))}</dd></div>` : ''}
<div class="meta-wide"><dt>${T('Tecnologias', 'Technologies')}</dt><dd>${esc(p.tech.join(' · '))}</dd></div>
</dl>

<section class="split">
<h2 class="display sm">${T('Sobre o projeto', 'About the project')}</h2>
<div class="prose">${L(p.description).map((d) => `<p>${esc(d)}</p>`).join('')}</div>
</section>

<section class="split">
<h2 class="display sm">${T('O que faz', 'What it does')}</h2>
<div class="stack">
<ul class="bullets big">${L(p.features).map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
${p.repo ? `<div class="actions"><a class="btn primary" href="${esc(p.repo)}" target="_blank" rel="noopener">${T('Ver código no GitHub', 'View code on GitHub')} ${ICON.external}${NT}</a></div>` : ''}
</div>
</section>

${extra.map((im) => `<figure class="project-extra"><div class="cover has-shot">${shot(im)}</div><figcaption>${esc(L(im.alt))}</figcaption></figure>`).join('')}

<nav class="pager" aria-label="${T('Outros projetos', 'Other projects')}">
<a href="${projectPath(prev)}"><span class="pager-k">${ICON.back} ${T('Projeto anterior', 'Previous project')}</span><span class="pager-name">${esc(prev.cover || L(prev.title))}</span></a>
<a class="right" href="${projectPath(next)}"><span class="pager-k">${T('Projeto seguinte', 'Next project')} ${ICON.arrow}</span><span class="pager-name">${esc(next.cover || L(next.title))}</span></a>
</nav>
</article>`;
    return layout({
      page: 'projects', title: L(p.title), description: L(p.summary),
      path: projectPath(p), altPath: projectPath(p, other), body,
    });
  }

  const cvSheet = () => `<article class="cv-sheet" id="cv">
<aside class="cv-side">
<div>
<div class="cv-name">${esc(site.name)}</div>
<div class="muted">${esc(L(site.role))}</div>
</div>
<div>
<h2 class="cv-sub">${T('Contacto', 'Contact')}</h2>
<p>${esc(L(site.location))}<br>
${[site.linkedin, site.github].filter(Boolean).map((u) => `<a href="${esc(u)}">${esc(u.replace(/^https:\/\/(www\.)?/, ''))}</a>`).join('<br>')}</p>
</div>
${content.skills.map((g) => `<div><h2 class="cv-sub">${esc(L(g.group))}</h2><p>${g.items.map((i) => esc(L(i))).join('<br>')}</p></div>`).join('')}
<div>
<h2 class="cv-sub">${T('Línguas', 'Languages')}</h2>
<p>${content.languages.map((l) => `${esc(L(l.name))} — ${esc(L(l.level))}`).join('<br>')}</p>
</div>
</aside>
<div class="cv-main">
<section>
<h2 class="cv-h">${T('Perfil', 'Profile')}</h2>
<p>${esc([L(content.about.paragraphs)[0], L(content.about.paragraphs).slice(1).pop()].filter(Boolean).join(' '))}</p>
</section>
<section>
<h2 class="cv-h">${T('Experiência', 'Experience')}</h2>
${timeline(content.experience)}
</section>
<section>
<h2 class="cv-h">${T('Formação', 'Education')}</h2>
${timeline(content.education)}
</section>
<section>
<h2 class="cv-h">${T('Projetos', 'Projects')}</h2>
${projects.map((p) => `<div class="cv-proj"><h3>${esc(L(p.title))}</h3><p>${esc(L(p.summary))}</p><p class="muted">${esc(p.tech.join(' · '))}${p.repo ? ` · ${esc(p.repo.replace('https://', ''))}` : ''}</p></div>`).join('')}
</section>
</div>
</article>`;

  function cv() {
    const body = `<section class="page-head bleed deep cv-head">
<div>
<h1 class="display xl">CV</h1>
<p class="lead">Curriculum vitae · ${esc(site.name)}</p>
</div>
<div class="actions">
<a class="btn primary" href="/cv/descarregar/${lang}" download>${T('Descarregar PDF', 'Download PDF')} ${ICON.download}</a>
<a class="btn" href="${CV_PDF[lang]}" target="_blank" rel="noopener">${T('Abrir PDF no navegador', 'Open PDF in browser')}${NT}</a>
</div>
</section>
${cvSheet()}
<div class="after-cv">
<p>${T('Quer ver o trabalho por trás do CV?', 'Want to see the work behind the CV?')}</p>
<a class="text-link" href="${R.projects}">${T('Ver projetos', 'View projects')} ${ICON.arrow}</a>
</div>`;
    return layout({
      page: 'cv', title: 'CV', path: R.cv, altPath: ROUTES[other].cv, body,
      description: T('Curriculum vitae de Samuel Camargo: experiência, formação, competências e projetos. Disponível em PDF.', 'Curriculum vitae of Samuel Camargo: experience, education, skills and projects. Available as PDF.'),
    });
  }

  // Página sem cabeçalho nem rodapé, usada para gerar o PDF do CV.
  function cvPrint() {
    return `<!doctype html>
<html lang="${lang === 'pt' ? 'pt-PT' : 'en'}" data-theme="light" data-skin="${skin}">
<head>
<meta charset="utf-8">
<meta name="robots" content="noindex">
<title>${esc(site.name)} — CV</title>
<link rel="stylesheet" href="/css/fonts.css">
<link rel="stylesheet" href="/css/style.css">
<link rel="stylesheet" href="/css/themes.css">
<link rel="stylesheet" href="/css/cv-print.css">
</head>
<body class="cv-print">${cvSheet()}</body>
</html>`;
  }

  function contact() {
    const field = (id, label, input) => `<div class="field"><label for="${id}">${label}</label>${input}<p class="error" id="${id}-erro" role="alert" hidden></p></div>`;
    const social = (href, label, icon, extra = '') => `<li><a class="social" href="${esc(href)}" aria-label="${esc(label)}" title="${esc(label)}"${extra}>${icon}</a></li>`;
    const body = `<section class="page-head bleed deep contact-head">
<h1 class="display lg">${T('Vamos falar.', "Let's talk.")}</h1>
<p class="lead">${T('Escreva-me sobre um estágio, um emprego ou um projeto. Escolha o canal que preferir.', 'Write to me about an internship, a job or a project. Pick whichever channel you like.')}</p>
<ul class="socials" aria-label="${T('Contactos', 'Contacts')}">
${opts.publicEmail ? social(`mailto:${opts.publicEmail}`, `Email: ${opts.publicEmail}`, ICON.mail) : ''}
${social(site.linkedin, `LinkedIn${T(' (abre noutro separador)', ' (opens in a new tab)')}`, ICON.linkedin, ' target="_blank" rel="noopener"')}
${social(site.github, `GitHub${T(' (abre noutro separador)', ' (opens in a new tab)')}`, ICON.github, ' target="_blank" rel="noopener"')}
</ul>
<p class="where">${ICON.pin} ${esc(L(site.location))}</p>
</section>
<div class="contact">
<section class="panel" aria-label="${T('Formulário de contacto', 'Contact form')}">
<form id="form-contacto" novalidate>
<div class="field-row">
${field('nome', T('Nome', 'Name'), '<input id="nome" name="name" type="text" autocomplete="name" maxlength="80" required aria-describedby="nome-erro">')}
${field('email', 'Email', '<input id="email" name="email" type="email" autocomplete="email" maxlength="120" required aria-describedby="email-erro">')}
</div>
${field('assunto', T('Assunto', 'Subject'), '<input id="assunto" name="subject" type="text" maxlength="120" required aria-describedby="assunto-erro">')}
${field('mensagem', T('Mensagem', 'Message'), '<textarea id="mensagem" name="message" rows="6" maxlength="4000" required aria-describedby="mensagem-erro"></textarea>')}
<div class="hp" aria-hidden="true"><label for="website">Website</label><input id="website" name="website" type="text" tabindex="-1" autocomplete="off"></div>
<div class="consent">
<input id="consentimento" name="consent" type="checkbox" required aria-describedby="consentimento-erro consentimento-info">
<label for="consentimento">${T(`Li a <a href="${R.privacy}">Política de Privacidade</a> e aceito que estes dados sejam usados para responder à minha mensagem.`, `I have read the <a href="${R.privacy}">Privacy Policy</a> and agree to this data being used to reply to my message.`)}</label>
</div>
<p class="error" id="consentimento-erro" role="alert" hidden></p>
<p class="muted small" id="consentimento-info">${T('Só são pedidos os dados necessários para responder. As mensagens são apagadas ao fim de 12 meses e pode retirar o consentimento a qualquer momento.', 'Only the data needed to reply is requested. Messages are deleted after 12 months and you can withdraw consent at any time.')}</p>
<div class="form-foot">
<button class="btn primary big" type="submit" id="enviar">${T('Enviar mensagem', 'Send message')} ${ICON.arrow}</button>
<p class="muted small">${T('Todos os campos e a caixa de aceitação são obrigatórios.', 'All fields and the consent box are required.')}</p>
</div>
<p class="error form-error" id="erro-envio" role="alert" hidden></p>
<noscript><p class="error">${T('O formulário precisa de JavaScript. Pode contactar-me pelo LinkedIn.', 'The form needs JavaScript. You can reach me on LinkedIn.')}</p></noscript>
</form>
<div class="success" id="sucesso" role="status" tabindex="-1" hidden>
<div class="success-icon">${ICON.check}</div>
<h2 class="display sm">${T('Mensagem enviada.', 'Message sent.')}</h2>
<p class="lead">${T('Obrigado pelo contacto. Respondo assim que possível.', 'Thank you for getting in touch. I will reply as soon as I can.')}</p>
<button class="btn" type="button" id="nova-mensagem">${T('Enviar outra mensagem', 'Send another message')}</button>
</div>
</section>
</div>`;
    return layout({
      page: 'contact', title: T('Contacto', 'Contact'), path: R.contact, altPath: ROUTES[other].contact, body,
      description: T('Contacte Samuel Camargo sobre estágios, emprego ou projetos.', 'Contact Samuel Camargo about internships, jobs or projects.'),
    });
  }

  function legalPage(key) {
    const contact = opts.publicEmail
      ? `<a href="mailto:${esc(opts.publicEmail)}">${esc(opts.publicEmail)}</a>`
      : `${T('o', 'the')} <a href="${R.contact}">${T('formulário de contacto', 'contact form')}</a>`;
    const texts = legal(lang, {
      name: esc(site.name), location: esc(L(site.location)), contact,
      privacyUrl: R.privacy, cookiesUrl: R.cookies, termsUrl: R.terms, contactUrl: R.contact,
    });
    const doc = texts[key];
    const body = `<article class="legal">
<h1 class="display lg">${doc.title}</h1>
<p class="updated">${T('Última atualização', 'Last updated')}: ${texts.updated}</p>
<p class="lead">${doc.intro}</p>
${doc.sections.map(([h, parts]) => `<section><h2>${h}</h2>${parts.join('\n')}</section>`).join('\n')}
</article>`;
    return layout({ page: '', title: doc.title, path: R[key], altPath: ROUTES[other][key], body, description: doc.intro });
  }

  function notFound(path) {
    const body = `<section class="page-head bleed deep narrow">
<h1 class="display lg">${T('Esta página não existe.', 'This page does not exist.')}</h1>
<p class="lead">${T('O endereço pode ter mudado ou estar mal escrito (erro 404).', 'The address may have changed or been mistyped (error 404).')}</p>
<div class="actions"><a class="btn primary" href="${R.home}">${T('Voltar ao início', 'Back to home')}</a><a class="btn" href="${R.projects}">${T('Ver projetos', 'View projects')}</a></div>
</section>`;
    return layout({ page: '', title: T('Página não encontrada', 'Page not found'), path, altPath: ROUTES[other].home, body, noindex: true });
  }

  // Erro do servidor: mesma página do site, com explicação e caminhos para continuar.
  function serverError(path) {
    const body = `<section class="page-head bleed deep narrow">
<h1 class="display lg">${T('Algo correu mal do nosso lado.', 'Something went wrong on our side.')}</h1>
<p class="lead">${T('A página não carregou por um erro no servidor (erro 500). Tente de novo daqui a um momento; se continuar, escreva-me pelo LinkedIn.', 'The page did not load because of a server error (error 500). Try again in a moment; if it keeps happening, message me on LinkedIn.')}</p>
<div class="actions"><a class="btn primary" href="${esc(path || R.home)}">${T('Tentar de novo', 'Try again')}</a><a class="btn" href="${R.home}">${T('Voltar ao início', 'Back to home')}</a></div>
</section>`;
    return layout({ page: '', title: T('Erro no servidor', 'Server error'), path: R.home, altPath: ROUTES[other].home, body, noindex: true });
  }

  return {
    home, about, projects: projectsPage, project, cv, cvPrint, contact, notFound, serverError,
    privacy: () => legalPage('privacy'), terms: () => legalPage('terms'), cookies: () => legalPage('cookies'),
  };
}

module.exports = { renderer, ROUTES, CV_PDF, esc };
