(() => {
  'use strict';
  const slug = new URLSearchParams(location.search).get('slug');
  const game = typeof games !== 'undefined' && games.find(item => item.slug === slug);
  const title = document.getElementById('embedTitle');
  const status = document.getElementById('embedStatus');
  const button = document.getElementById('startGame');
  const stage = document.getElementById('embedStage');
  const panel = document.getElementById('launchPanel');
  const source = document.getElementById('sourceLink');
  let target;
  try { target = new URL(game?.link); } catch (_) { /* Unknown catalog entry. */ }
  if (!game || !['flash','gadget'].includes(game.format) || target?.protocol !== 'https:') {
    title.textContent = 'Jogo não encontrado';
    status.textContent = 'Volte ao catálogo para escolher uma partida.';
    button.hidden = true;
    return;
  }
  title.textContent = game.title;
  document.title = `${game.title} · Batata Games`;
  try {
    const original = new URL(game.source);
    if (original.protocol === 'https:') { source.href = original.href; source.hidden = false; }
  } catch (_) { /* A source link is optional. */ }
  let ruffleReady;
  const loadRuffle = () => ruffleReady ||= new Promise((resolve,reject) => {
    window.RufflePlayer = window.RufflePlayer || {};
    window.RufflePlayer.config = {autoplay:'on',allowScriptAccess:false,backgroundColor:'#0d0b18',warnOnUnsupportedContent:true};
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@ruffle-rs/ruffle@0.6.0/ruffle.js';
    script.crossOrigin = 'anonymous';
    script.onload = resolve;
    script.onerror = () => { ruffleReady = null; reject(new Error('Não foi possível carregar o player Flash.')); };
    document.head.appendChild(script);
  });
  async function launchFlash() {
    await loadRuffle();
    const player = window.RufflePlayer.newest().createPlayer();
    stage.appendChild(player);
    try {
      await player.ruffle().load({url:target.href,allowScriptAccess:false,autoplay:'on'});
      panel.hidden = true;
      player.tabIndex = 0;
      player.focus();
    } catch (error) { player.remove(); throw error; }
  }
  async function launchGadget() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(),30000);
    let text;
    try {
      const response = await fetch(target.href,{signal:controller.signal,credentials:'omit'});
      if (!response.ok) throw new Error('O servidor do jogo não respondeu.');
      text = await response.text();
    } finally { clearTimeout(timeout); }
    const xml = new DOMParser().parseFromString(text,'application/xml');
    let content = xml.querySelector('Content')?.textContent;
    if (!content && !/<Module\b/i.test(text) && /<!doctype\s+html|<html\b/i.test(text)) content = text;
    if (!content) throw new Error('O arquivo do jogo não está disponível.');
    const documentHTML = new DOMParser().parseFromString(content,'text/html');
    const base = documentHTML.querySelector('base') || documentHTML.createElement('base');
    const gameBase = new URL(base.getAttribute('href') || './',target.href);
    if (gameBase.protocol !== 'https:') throw new Error('O jogo não possui um endereço válido.');
    base.href = gameBase.href;
    documentHTML.head.prepend(base);
    const frame = document.createElement('iframe');
    frame.className = 'game-embed';
    frame.title = `Jogar ${game.title}`;
    frame.setAttribute('sandbox','allow-scripts allow-forms allow-pointer-lock allow-modals');
    frame.setAttribute('allow','autoplay; fullscreen; gamepad');
    frame.allowFullscreen = true;
    frame.addEventListener('load',() => { panel.hidden = true; frame.focus(); },{once:true});
    frame.srcdoc = '<!doctype html>\n'+documentHTML.documentElement.outerHTML;
    stage.appendChild(frame);
  }
  button.addEventListener('click',async () => {
    button.disabled = true;
    status.textContent = 'Carregando a partida…';
    try {
      if (game.format === 'flash') await launchFlash();
      else await launchGadget();
    } catch (error) {
      status.textContent = error.name === 'AbortError' ? 'O jogo demorou para responder. Tente novamente ou abra o original.' : 'Não foi possível carregar a partida. Tente novamente ou abra o original.';
      button.disabled = false;
      button.textContent = 'Tentar novamente';
    }
  });
})();
