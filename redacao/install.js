const code = document.getElementById('scriptCode');
const links = [...document.querySelectorAll('[data-bookmarklet]')];
const buttons = [...document.querySelectorAll('[data-copy]')];

for (const link of links) {
  link.addEventListener('click', event => {
    event.preventDefault();
    window.showToast?.('Arraste o botão para a barra de favoritos. No celular, use Copiar bookmarklet e cole no endereço de um favorito.');
  });
}

function prepareBookmarklet(bookmarklet) {
  if (!bookmarklet.startsWith('javascript:') || bookmarklet.length > 4096 ||
      !decodeURIComponent(bookmarklet.slice('javascript:'.length)).includes('https://redacao-maker.vercel.app/hub.js')) {
    throw new Error('Bookmarklet original inválido.');
  }
  code.textContent = bookmarklet;
  for (const link of links) {
    link.title = 'Redator Batata';
    link.href = bookmarklet;
    link.removeAttribute('aria-disabled');
  }
  buttons.forEach(button => { button.disabled = false; });
}

try {
  const publishedBookmarklet = code.textContent.trim();
  if (publishedBookmarklet.startsWith('javascript:')) {
    prepareBookmarklet(publishedBookmarklet);
  } else {
    // Also support opening the source page on a local static server.
    const response = await fetch('redacao/bookmarklet.txt', { credentials: 'same-origin', cache: 'no-store' });
    if (!response.ok) throw new Error();
    prepareBookmarklet((await response.text()).trim());
  }
} catch (_) {
  code.textContent = 'Não foi possível preparar o favorito. Atualize a página para tentar novamente.';
  links.forEach(link => { link.removeAttribute('href'); });
  window.showToast?.('Falha ao carregar o novo favorito. Atualize a página.');
}
