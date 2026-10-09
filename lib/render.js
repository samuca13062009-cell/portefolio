'use strict';
// Gera o HTML de cada página a partir de data/content.json.

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
));

const ROUTES = {
  pt: { home: '/', about: '/sobre', projects: '/projetos', cv: '/cv', cvPrint: '/cv/imprimir', contact: '/contacto' },
  en: { home: '/en', about: '/en/about', projects: '/en/projects', cv: '/en/cv', cvPrint: '/en/cv/print', contact: '/en/contact' },
};

const CV_PDF = { pt: '/cv/samuel-camargo-cv-pt.pdf', en: '/cv/samuel-camargo-cv-en.pdf' };

const ICON = {
  arrow: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  back: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
  download: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v12M6 11l6 6 6-6M5 20h14"/></svg>',
  external: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9"/></svg>',
  theme: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
  check: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
};

const FONTS = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap';

function renderer(content, lang, siteUrl) {
  const other = lang === 'pt' ? 'en' : 'pt';
  const R = ROUTES[lang];
  const T = (pt, en) => (lang === 'pt' ? pt : en);
  const L = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? (v[lang] ?? v.pt) : v);
  const site = content.site;
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
    const desc = description || L(site.description);
    const canonical = siteUrl + path;
    const nav = NAV.map(([key, pt, en]) => (
      `<a class="nav-link" href="${R[key]}"${key === page ? ' aria-current="page"' : ''}>${T(pt, en)}</a>`
    )).join('');
    return `<!doctype html>
<html lang="${lang === 'pt' ? 'pt-PT' : 'en'}">
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
<meta name="theme-color" content="#EEF0EA">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${esc(FONTS)}">
<link rel="stylesheet" href="/css/style.css">
<script src="/js/theme.js"></script>
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>` : ''}
</head>
<body>
<a class="skip" href="#conteudo">${T('Saltar para o conteúdo', 'Skip to content')}</a>
<div class="wrap">
<header class="site-header">
<a class="brand" href="${R.home}">${esc(site.name)}</a>
<nav class="nav" aria-label="${T('Principal', 'Main')}">${nav}</nav>
<div class="tools">
<a class="pill-btn" href="${esc(altPath)}" hreflang="${other}" lang="${other}" aria-label="${T('Switch to English', 'Mudar para português')}">${other.toUpperCase()}</a>
<button class="icon-btn" type="button" id="theme-toggle" aria-label="${T('Alternar modo escuro', 'Toggle dark mode')}">${ICON.theme}</button>
</div>
</header>
<main id="conteudo">
${body}
</main>
<footer class="site-footer">
<div>© ${new Date().getFullYear()} ${esc(site.name)}</div>
<div class="footer-links">
<a class="nav-link" href="${esc(site.linkedin)}" rel="me noopener" target="_blank">LinkedIn</a>
<a class="nav-link" href="${esc(site.github)}" rel="me noopener" target="_blank">GitHub</a>
<a class="nav-link" href="${R.contact}">${T('Contacto', 'Contact')}</a>
</div>
</footer>
</div>
<script src="/js/app.js" defer></script>
</body>
</html>`;
  }

  const projectCard = (p) => `<a class="card" href="${projectPath(p)}" data-project data-cat="${esc(p.category)}" data-search="${esc([L(p.title), catLabel(p), ...p.tech].join(' ').toLowerCase())}">
<div class="cover c-${esc(p.category)}"><span class="cover-tech">${esc(p.tech.slice(0, 3).join(' · '))}</span><span class="cover-name">${esc(p.cover || L(p.title))}</span></div>
<div class="card-body">
<div class="mono">${esc(catLabel(p))} · ${esc(p.tech.join(' · '))}</div>
<h3 class="card-title">${esc(L(p.title))}</h3>
<p class="muted">${esc(L(p.summary))}</p>
</div>
</a>`;

  const tags = (items) => `<ul class="tags">${items.map((i) => `<li>${esc(L(i))}</li>`).join('')}</ul>`;

  const timeline = (rows) => rows.map((r) => `<div class="row">
<div class="row-when mono-plain">${esc(L(r.period))}</div>
<div class="row-what">
<h3>${esc(L(r.role || r.title))}</h3>
<div class="muted">${esc(r.org)}</div>
${r.bullets ? `<ul class="bullets">${L(r.bullets).map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
${r.note ? `<p class="muted">${esc(L(r.note))}</p>` : ''}
</div>
</div>`).join('');

  function home() {
    const featured = projects.filter((p) => p.featured).slice(0, 3);
    const body = `<section class="hero">
<div class="hero-text">
<p class="mono">${esc(L(content.home.kicker))}</p>
<h1 class="display xl">${esc(L(content.home.title))}</h1>
<p class="lead">${esc(L(content.home.lead))}</p>
<div class="actions">
<a class="btn primary" href="${R.projects}">${T('Ver projetos', 'View projects')} ${ICON.arrow}</a>
<a class="btn" href="${CV_PDF[lang]}" download>${T('Descarregar CV', 'Download CV')} ${ICON.download}</a>
</div>
</div>
<dl class="facts">
${content.home.facts.map((f) => `<div><dt class="mono">${esc(L(f.label))}</dt><dd>${esc(L(f.value))}</dd></div>`).join('')}
</dl>
</section>

<section class="section" aria-labelledby="h-destaque">
<div class="section-head">
<h2 class="display" id="h-destaque">${T('Projetos em destaque', 'Featured projects')}</h2>
<a class="text-link" href="${R.projects}">${T('Ver todos os projetos', 'View all projects')}</a>
</div>
<div class="grid">${featured.map(projectCard).join('')}</div>
</section>

<section class="section split" aria-labelledby="h-comp">
<h2 class="display" id="h-comp">${T('O que sei fazer', 'What I can do')}</h2>
<div class="skill-cols">
${content.skills.map((g) => `<div><h3>${esc(L(g.group))}</h3><p class="muted">${g.items.map((i) => esc(L(i))).join('<br>')}</p></div>`).join('')}
</div>
</section>

<section class="cta">
<h2 class="display">${T('Tem um estágio, um projeto ou uma oportunidade?', 'Have an internship, a project or an opportunity?')}</h2>
<a class="btn inverse" href="${R.contact}">${T('Entrar em contacto', 'Get in touch')} ${ICON.arrow}</a>
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
    const body = `<section class="page-head narrow">
<p class="mono">${T('Sobre mim', 'About me')}</p>
<h1 class="display lg">${esc(L(content.about.title))}</h1>
<div class="prose">${L(content.about.paragraphs).map((p) => `<p>${esc(p)}</p>`).join('')}</div>
<div class="actions">
<a class="btn primary" href="${R.cv}">${T('Ver CV completo', 'View full CV')}</a>
<a class="btn" href="${R.contact}">${T('Falar comigo', 'Talk to me')}</a>
</div>
</section>

<section class="section split" aria-labelledby="h-exp">
<h2 class="display" id="h-exp">${T('Experiência', 'Experience')}</h2>
<div>${timeline(content.experience)}</div>
</section>

<section class="section split" aria-labelledby="h-form">
<h2 class="display" id="h-form">${T('Formação', 'Education')}</h2>
<div>${timeline(content.education)}</div>
</section>

<section class="section split" aria-labelledby="h-skills">
<h2 class="display" id="h-skills">${T('Competências', 'Skills')}</h2>
<div class="skill-groups">
${content.skills.map((g) => `<div><h3>${esc(L(g.group))}</h3>${tags(g.items)}</div>`).join('')}
<div><h3>${T('Línguas', 'Languages')}</h3>${tags(content.languages.map((l) => `${L(l.name)} — ${L(l.level)}`))}</div>
</div>
</section>`;
    return layout({
      page: 'about', title: T('Sobre mim', 'About me'), path: R.about, altPath: ROUTES[other].about, body,
      description: L(content.about.paragraphs)[0],
    });
  }

  function projectsPage() {
    const cats = [...new Set(projects.map((p) => p.category))];
    const body = `<section class="page-head">
<p class="mono">${T('Portefólio', 'Portfolio')}</p>
<h1 class="display xl">${T('Projetos', 'Projects')}</h1>
<p class="lead">${T('Trabalhos de escola, de estágio e pessoais, em web, Android e jogos. O código da maioria está no GitHub.', 'School, internship and personal work across web, Android and games. Most of the code is on GitHub.')}</p>
</section>

<div class="filters">
<div class="chips" role="group" aria-label="${T('Filtrar por categoria', 'Filter by category')}">
<button class="chip" type="button" data-filter="all" aria-pressed="true">${T('Todos', 'All')}</button>
${cats.map((c) => `<button class="chip" type="button" data-filter="${esc(c)}" aria-pressed="false">${esc(L(content.categories[c]) || c)}</button>`).join('')}
</div>
<div class="search">
<label class="mono" for="pesquisa">${T('Pesquisar', 'Search')}</label>
<input id="pesquisa" type="search" placeholder="${T('Nome ou tecnologia', 'Name or technology')}" autocomplete="off">
</div>
</div>

<p class="mono-plain count" id="contagem" aria-live="polite" data-one="${T('projeto', 'project')}" data-many="${T('projetos', 'projects')}">${projects.length} ${T('projetos', 'projects')}</p>

<div class="grid" id="lista-projetos">${projects.map(projectCard).join('')}</div>

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
    const body = `<article class="project">
<a class="text-link back" href="${R.projects}">${ICON.back} ${T('Todos os projetos', 'All projects')}</a>
<p class="mono">${esc(catLabel(p))}</p>
<h1 class="display lg">${esc(L(p.title))}</h1>
<p class="lead">${esc(L(p.summary))}</p>

<div class="cover wide c-${esc(p.category)}"><span class="cover-tech">${esc(p.tech.join(' · '))}</span><span class="cover-name">${esc(p.cover || L(p.title))}</span></div>

<dl class="meta">
<div><dt class="mono">${T('Categoria', 'Category')}</dt><dd>${esc(catLabel(p))}</dd></div>
<div><dt class="mono">${T('O meu papel', 'My role')}</dt><dd>${T('Design e desenvolvimento', 'Design and development')}</dd></div>
<div class="meta-wide"><dt class="mono">${T('Tecnologias', 'Technologies')}</dt><dd>${tags(p.tech)}</dd></div>
</dl>

<section class="split">
<h2 class="display sm">${T('Sobre o projeto', 'About the project')}</h2>
<div class="prose">${L(p.description).map((d) => `<p>${esc(d)}</p>`).join('')}</div>
</section>

<section class="split">
<h2 class="display sm">${T('O que faz', 'What it does')}</h2>
<div>
<ul class="bullets big">${L(p.features).map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
${p.repo ? `<div class="actions"><a class="btn primary" href="${esc(p.repo)}" target="_blank" rel="noopener">${T('Ver código no GitHub', 'View code on GitHub')} ${ICON.external}</a></div>` : ''}
</div>
</section>

<nav class="pager" aria-label="${T('Outros projetos', 'Other projects')}">
<a href="${projectPath(prev)}"><span class="mono">${T('Projeto anterior', 'Previous project')}</span><span class="pager-name">${esc(prev.cover || L(prev.title))}</span></a>
<a class="right" href="${projectPath(next)}"><span class="mono">${T('Projeto seguinte', 'Next project')}</span><span class="pager-name">${esc(next.cover || L(next.title))}</span></a>
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
<h2 class="mono">${T('Contacto', 'Contact')}</h2>
<p>${esc(L(site.location))}<br>
<a href="${esc(site.linkedin)}">linkedin.com/in/samuelcamargo-dev</a><br>
<a href="${esc(site.github)}">github.com/samuca13062009-cell</a></p>
</div>
${content.skills.map((g) => `<div><h2 class="mono">${esc(L(g.group))}</h2><p>${g.items.map((i) => esc(L(i))).join('<br>')}</p></div>`).join('')}
<div>
<h2 class="mono">${T('Línguas', 'Languages')}</h2>
<p>${content.languages.map((l) => `${esc(L(l.name))} — ${esc(L(l.level))}`).join('<br>')}</p>
</div>
</aside>
<div class="cv-main">
<section>
<h2 class="cv-h">${T('Perfil', 'Profile')}</h2>
<p>${esc(L(content.about.paragraphs)[0])} ${esc(L(content.about.paragraphs)[3])}</p>
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
    const body = `<section class="page-head cv-head">
<div>
<p class="mono">Curriculum vitae</p>
<h1 class="display xl">CV</h1>
</div>
<div class="actions">
<a class="btn primary" href="${CV_PDF[lang]}" download>${T('Descarregar PDF', 'Download PDF')} ${ICON.download}</a>
<a class="btn" href="${CV_PDF[lang]}" target="_blank" rel="noopener">${T('Abrir PDF no navegador', 'Open PDF in browser')}</a>
</div>
</section>
${cvSheet()}
<div class="after-cv">
<p>${T('Quer ver o trabalho por trás do CV?', 'Want to see the work behind the CV?')}</p>
<a class="text-link" href="${R.projects}">${T('Ver projetos', 'View projects')}</a>
</div>`;
    return layout({
      page: 'cv', title: 'CV', path: R.cv, altPath: ROUTES[other].cv, body,
      description: T('Curriculum vitae de Samuel Camargo: experiência, formação, competências e projetos. Disponível em PDF.', 'Curriculum vitae of Samuel Camargo: experience, education, skills and projects. Available as PDF.'),
    });
  }

  // Página sem cabeçalho nem rodapé, usada para gerar o PDF do CV.
  function cvPrint() {
    return `<!doctype html>
<html lang="${lang === 'pt' ? 'pt-PT' : 'en'}" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="robots" content="noindex">
<title>${esc(site.name)} — CV</title>
<link rel="stylesheet" href="${esc(FONTS)}">
<link rel="stylesheet" href="/css/style.css">
<link rel="stylesheet" href="/css/cv-print.css">
</head>
<body class="cv-print">${cvSheet()}</body>
</html>`;
  }

  function contact() {
    const field = (id, label, input) => `<div class="field"><label for="${id}">${label}</label>${input}<p class="error" id="${id}-erro" role="alert" hidden></p></div>`;
    const body = `<div class="contact">
<section class="contact-intro">
<p class="mono">${T('Contacto', 'Contact')}</p>
<h1 class="display lg">${T('Vamos falar.', "Let's talk.")}</h1>
<p class="lead">${T('Escreva-me sobre um estágio, um emprego ou um projeto. Leio todas as mensagens.', 'Write to me about an internship, a job or a project. I read every message.')}</p>
<div class="contact-links">
<a class="nav-link" href="${esc(site.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>
<a class="nav-link" href="${esc(site.github)}" target="_blank" rel="noopener">GitHub</a>
</div>
</section>

<section class="panel" aria-label="${T('Formulário de contacto', 'Contact form')}">
<form id="form-contacto" novalidate>
<div class="field-row">
${field('nome', T('Nome', 'Name'), '<input id="nome" name="name" type="text" autocomplete="name" maxlength="80" required aria-describedby="nome-erro">')}
${field('email', 'Email', '<input id="email" name="email" type="email" autocomplete="email" maxlength="120" required aria-describedby="email-erro">')}
</div>
${field('assunto', T('Assunto', 'Subject'), '<input id="assunto" name="subject" type="text" maxlength="120" required aria-describedby="assunto-erro">')}
${field('mensagem', T('Mensagem', 'Message'), '<textarea id="mensagem" name="message" rows="6" maxlength="4000" required aria-describedby="mensagem-erro"></textarea>')}
<div class="hp" aria-hidden="true"><label for="website">Website</label><input id="website" name="website" type="text" tabindex="-1" autocomplete="off"></div>
<div class="form-foot">
<button class="btn primary big" type="submit" id="enviar">${T('Enviar mensagem', 'Send message')} ${ICON.arrow}</button>
<p class="muted small">${T('Todos os campos são obrigatórios.', 'All fields are required.')}</p>
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

  function notFound(path) {
    const body = `<section class="page-head narrow">
<p class="mono">404</p>
<h1 class="display lg">${T('Esta página não existe.', 'This page does not exist.')}</h1>
<p class="lead">${T('O endereço pode ter mudado ou estar mal escrito.', 'The address may have changed or been mistyped.')}</p>
<div class="actions"><a class="btn primary" href="${R.home}">${T('Voltar ao início', 'Back to home')}</a><a class="btn" href="${R.projects}">${T('Ver projetos', 'View projects')}</a></div>
</section>`;
    return layout({ page: '', title: '404', path, altPath: ROUTES[other].home, body, noindex: true });
  }

  return { home, about, projects: projectsPage, project, cv, cvPrint, contact, notFound };
}

module.exports = { renderer, ROUTES, CV_PDF, esc };
