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
    if (skin && localStorage.getItem('skinBase') !== root.getAttribute('data-skin-default')) {
      localStorage.removeItem('skin');
      localStorage.removeItem('skinBase');
      skin = null;
    }
    if (skin && /^[a-z]+$/.test(skin) && !root.hasAttribute('data-skin-locked')) root.setAttribute('data-skin', skin);
  } catch (e) { /* sem armazenamento: segue a preferência do sistema */ }
})();
