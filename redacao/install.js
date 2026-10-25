(() => {
  'use strict';
  const loaderButton = document.getElementById('copy-loader');
  const bookmarkletLink = document.getElementById('bookmarklet');
  const bookmarkletButton = document.getElementById('copy-bookmarklet');
  const copyButton = document.getElementById('copy-script');
  const downloadButton = document.getElementById('download-script');
  const status = document.getElementById('copy-status');
  const manual = document.getElementById('manual-script');
  const manualLabel = document.getElementById('manual-label');
  const health = document.getElementById('health-status');
  const serviceOrigin = 'https://redacao-maker.vercel.app';
  const publicScriptUrl = new URL('/hub.js',serviceOrigin).href;
  const loader = `(()=>{const s=document.createElement('script');s.src=${JSON.stringify(publicScriptUrl)};s.onload=()=>s.remove();s.onerror=()=>{s.remove();alert('Nao foi possivel abrir o hub nesta pagina. Acesse https://redacao-maker.vercel.app para ver as alternativas.')};document.documentElement.appendChild(s)})()`;
  const publishedBookmarklet = bookmarkletLink.getAttribute('href') || '';
  const bookmarklet = publishedBookmarklet.startsWith('javascript:')
    ? publishedBookmarklet
    : 'javascript:' + encodeURIComponent(loader);
  bookmarkletLink.href = bookmarklet;
  document.getElementById('loader-command').textContent = loader;

  async function copyText(source,successMessage,manualDescription,manualHint) {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('manual copy');
      await navigator.clipboard.writeText(source);
      manual.hidden = true;
      manualLabel.hidden = true;
      status.textContent = successMessage;
    } catch {
      manual.value = source;
      manualLabel.textContent = manualDescription;
      manual.hidden = false;
      manualLabel.hidden = false;
      manual.focus();
      manual.select();
      status.textContent = manualHint || 'O navegador bloqueou a cópia automática. Use Ctrl+C ou ⌘C no texto selecionado.';
    }
  }

  bookmarkletLink.addEventListener('click',event => {
    event.preventDefault();
    status.textContent = 'Arraste o botão para a barra de favoritos. Se preferir, use Copiar bookmarklet e cole no campo URL de um favorito novo.';
  });

  bookmarkletButton.addEventListener('click',async () => {
    bookmarkletButton.disabled = true;
    try {
      await copyText(bookmarklet,'Bookmarklet copiado. Cole no campo URL ou Endereço de um favorito chamado Redator Batata.','Bookmarklet para colar no campo URL do favorito','Use Ctrl+C ou ⌘C no texto selecionado e cole no campo URL ou Endereço de um favorito, incluindo javascript:.');
    } finally {
      bookmarkletButton.disabled = false;
    }
  });

  loaderButton.addEventListener('click',async () => {
    loaderButton.disabled = true;
    try {
      await copyText(loader,'Comando copiado. Cole no Console da página que deseja ler.','Comando para copiar manualmente');
    } finally {
      loaderButton.disabled = false;
    }
  });

  copyButton.addEventListener('click',async () => {
    copyButton.disabled = true;
    status.textContent = 'Preparando o script…';
    let source;
    try {
      const response = await fetch(new URL('/redator-batata.js',serviceOrigin),{ credentials:'omit', cache:'no-store' });
      if (!response.ok) throw new Error('script unavailable');
      source = await response.text();
      if (!source.trim()) throw new Error('empty script');
      await copyText(source,'Script completo copiado. Cole no Console da página que deseja ler.','Script completo para copiar manualmente');
    } catch {
      status.textContent = 'Não foi possível carregar o script. Tente novamente ou use Baixar .js.';
    } finally {
      copyButton.disabled = false;
    }
  });

  downloadButton.addEventListener('click',async () => {
    downloadButton.disabled = true;
    status.textContent = 'Preparando o download…';
    let downloadUrl;
    try {
      const response = await fetch(new URL('/redator-batata.js',serviceOrigin),{ credentials:'omit', cache:'no-store' });
      if (!response.ok) throw new Error('script unavailable');
      const source = await response.text();
      if (!source.trim()) throw new Error('empty script');
      downloadUrl = URL.createObjectURL(new Blob([source],{ type:'text/javascript;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'redator-batata.js';
      document.body.append(link);
      link.click();
      link.remove();
      status.textContent = 'Download do script iniciado.';
    } catch {
      status.textContent = 'Não foi possível baixar o script. Confira a conexão e tente novamente.';
    } finally {
      downloadButton.disabled = false;
      if (downloadUrl) window.setTimeout(() => URL.revokeObjectURL(downloadUrl),1000);
    }
  });

  fetch(new URL('/api/health',serviceOrigin),{ credentials:'omit', cache:'no-store' })
    .then(response => {
      if (!response.ok) throw new Error('health unavailable');
      return response.json();
    })
    .then(data => {
      if (data?.service !== 'batata' || typeof data.configured !== 'boolean' || data.publicAccess !== true) throw new Error('unexpected health');
      health.dataset.state = data.configured ? 'ready' : 'pending';
      health.textContent = data.configured ? 'Redator Batata disponível. Acesso público, sem login.' : 'A geração do Redator Batata está temporariamente indisponível. Tente novamente mais tarde.';
    })
    .catch(() => {
      health.dataset.state = 'pending';
      health.textContent = 'Não foi possível consultar o estado do servidor agora.';
    });
})();
