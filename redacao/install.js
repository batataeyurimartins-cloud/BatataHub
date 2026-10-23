const code = document.getElementById('scriptCode');
const link = document.getElementById('saveBookmarklet');
const buttons = [...document.querySelectorAll('[data-copy]')];

link.addEventListener('click', event => {
  event.preventDefault();
  window.showToast?.('Arraste para a barra de favoritos, ou copie o código e cole no endereço de um favorito.');
});

try {
  const response = await fetch('redacao/hub.js', { credentials: 'same-origin', cache: 'no-store' });
  if (!response.ok) throw new Error();
  const source = await response.text();
  if (!source.includes("const PANEL_ID = 'redator-batata-console';") || !source.includes("const SERVICE_ORIGIN = 'https://redacao-maker.vercel.app';") || source.length > 150000) throw new Error();
  const bookmarklet = 'javascript:' + encodeURIComponent(source);
  code.textContent = bookmarklet;
  link.textContent = 'Arrastar Redator Batata';
  link.title = 'Redator Batata';
  link.href = bookmarklet;
  link.removeAttribute('aria-disabled');
  buttons.forEach(button => { button.disabled = false; });
} catch (_) {
  code.textContent = 'Não foi possível preparar o favorito. Atualize a página para tentar novamente.';
  link.removeAttribute('href');
  window.showToast?.('Falha ao carregar o novo favorito. Atualize a página.');
}
