// Aplica o tema guardado antes de a página ser desenhada, para não piscar.
(function () {
  try {
    var saved = localStorage.getItem('tema');
    if (saved === 'dark' || saved === 'light') document.documentElement.setAttribute('data-theme', saved);
  } catch (e) { /* sem armazenamento: segue a preferência do sistema */ }
})();
