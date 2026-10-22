const code = document.getElementById('scriptCode');
const link = document.getElementById('saveBookmarklet');
const buttons = [...document.querySelectorAll('[data-copy]')];

link.addEventListener('click', event => {
  event.preventDefault();
  window.showToast?.('Arraste para a barra de favoritos, ou copie o código e cole no endereço de um favorito.');
});

try {
  const response = await fetch('redacao/hub.js', { credentials: 'same-origin' });
  if (!response.ok) throw new Error();
  const source = await response.text();
  if (!source.includes('__BATATAHUB_ORIGIN__') || source.length > 150000) throw new Error();
  const bookmarklet = 'javascript:' + encodeURIComponent(source.replaceAll('__BATATAHUB_ORIGIN__', location.origin));
  code.textContent = bookmarklet;
  link.href = bookmarklet;
  link.removeAttribute('aria-disabled');
  buttons.forEach(button => { button.disabled = false; });
} catch (_) {
  code.textContent = 'Não foi possível preparar o favorito. Atualize a página para tentar novamente.';
  link.removeAttribute('href');
  window.showToast?.('Falha ao carregar o novo favorito. Atualize a página.');
}
