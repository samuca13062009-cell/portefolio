// Aplica o modo (claro/escuro) e o tema guardados antes de a página ser desenhada, para não piscar.
(function () {
  try {
    var root = document.documentElement;
    var saved = localStorage.getItem('tema');
    if (saved === 'dark' || saved === 'light') root.setAttribute('data-theme', saved);
    // O tema escolhido pelo visitante só não se aplica durante uma pré-visualização (?tema=).
    // Se o tema do site mudou no backoffice desde essa escolha, a escolha antiga é esquecida,
    // para que a mudança feita no backoffice se veja logo.
    var skin = localStorage.getItem('skin');
    var base = root.getAttribute('data-skin-default');
    if (skin && base && localStorage.getItem('skinBase') !== base) {
      localStorage.removeItem('skin');
      localStorage.removeItem('skinBase');
      skin = null;
    }
    var known = (root.getAttribute('data-skins') || '').split(' ');
    if (skin && known.indexOf(skin) !== -1 && !root.hasAttribute('data-skin-locked')) root.setAttribute('data-skin', skin);
  } catch (e) { /* sem armazenamento: segue a preferência do sistema */ }
})();
