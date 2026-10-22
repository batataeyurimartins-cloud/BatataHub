(() => {
  'use strict';
  const HUB_ORIGIN = '__BATATAHUB_ORIGIN__';
  const CHANNEL = 'batatahub-redacao-v1';
  const KEY = '__batataRedacaoV1';
  if (window[KEY]?.open) { window[KEY].open(); return; }
  if (!/^https?:$/.test(location.protocol) || !document.body) {
    alert('Abra o favorito em uma página de redação já carregada.'); return;
  }
  let popup, nonce, connected = false, helloTimer, closedTimer, selection, highlighted;
  let titleField, essayField, baseline, undoState, lastFill;
  const host = document.createElement('div');
  host.dataset.batataRedacao = 'panel';
  const shadow = host.attachShadow({ mode: 'open' });
  const css = document.createElement('style');
  css.textContent = ':host{all:initial!important;position:fixed!important;inset:auto 16px 16px auto!important;z-index:2147483647!important;display:block!important;width:min(344px,calc(100vw - 32px))!important;color-scheme:dark!important}.panel{font:14px/1.5 system-ui,sans-serif;background:#181421;color:#f4eefb;border:1px solid #625077;border-radius:20px;padding:20px;box-shadow:0 16px 70px #0007;max-height:calc(100dvh - 32px);overflow:auto;box-sizing:border-box}*{box-sizing:border-box}h2{font-size:18px;margin:0 0 4px}p{margin:8px 0;color:#c2b8cf;font-size:12px}button{font:600 12px/1.4 system-ui;cursor:pointer;border:1px solid #54465f;border-radius:10px;padding:10px 12px;background:#282132;color:#eee7f8}button:hover{border-color:#ccb5ff}button:focus-visible{outline:2px solid #d6bdff;outline-offset:3px}button:disabled{opacity:.5;cursor:default}.primary{background:#d3bcfa;color:#20172f;width:100%;margin-top:12px}.row{display:flex;gap:8px;margin:10px 0}.row button{flex:1}.close{float:right;padding:3px 8px;font-size:17px}.field{padding:8px 10px;border:1px solid #3c3346;border-radius:9px;overflow-wrap:anywhere;font-size:12px;margin:6px 0}.label{color:#c9b0f2}#status{color:#c5e8d4;min-height:36px}#undo{width:100%;margin-top:8px}small{font-size:11px;color:#a99db7}';
  shadow.append(css);
  const panel = document.createElement('section');
  panel.className = 'panel'; panel.setAttribute('aria-label', 'Redação Maker');
  // Only this constant template is HTML. Page text and generated content always use textContent/value.
  panel.innerHTML = '<button class="close" id="close" title="Fechar Redação Maker" aria-label="Fechar Redação Maker">×</button><h2>✦ Redação Maker</h2><small>BATATAHUB · CONECTAR PÁGINA</small><p>O primeiro campo é o título; o segundo, a redação. Confira ou escolha manualmente.</p><div class="field"><span class="label">Título · </span><span id="titleLabel"></span></div><div class="field"><span class="label">Redação · </span><span id="essayLabel"></span></div><div class="row"><button id="pickTitle">Escolher título</button><button id="pickEssay">Escolher redação</button></div><p id="status" role="status" aria-live="polite"></p><button class="primary" id="open">Abrir Redação Maker ↗</button><div class="row"><button id="read">Ler página novamente</button><button id="cancelPick" hidden>Cancelar escolha</button></div><button id="undo" hidden>Desfazer preenchimento</button><p>Revise a proposta no BatataHub antes de gerar. Nenhuma atividade é enviada automaticamente.</p>';
  shadow.append(panel); document.documentElement.append(host);
  const $ = id => shadow.getElementById(id);
  const status = message => { $('status').textContent = message; };

  function documents() {
    const result = [];
    function visit(doc, depth) {
      if (result.length >= 12 || depth > 3) return;
      result.push(doc);
      for (const frame of doc.querySelectorAll('iframe')) {
        try { if (visible(frame) && frame.contentDocument?.body) visit(frame.contentDocument, depth + 1); } catch (_) { /* Private cross-origin frames remain inaccessible. */ }
      }
    }
    visit(document, 0); return result;
  }
  function visible(element) {
    if (!element?.isConnected || element.closest('[hidden],[aria-hidden="true"],[inert]')) return false;
    const view = element.ownerDocument.defaultView;
    for (let current = element; current; current = current.parentElement) {
      const style = view.getComputedStyle(current);
      if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse' || style.opacity === '0') return false;
    }
    return element.getClientRects().length > 0;
  }
  function editable(element) {
    if (!element || host.contains(element) || !visible(element) || element.disabled || element.readOnly) return false;
    if (element.localName === 'textarea') return true;
    if (element.localName === 'input') return ['text', ''].includes(element.type);
    return element.isContentEditable && !element.parentElement?.isContentEditable;
  }
  function label(element) {
    if (!element) return 'Não identificado';
    return (element.getAttribute('aria-label') || element.labels?.[0]?.innerText || element.getAttribute('placeholder') || element.getAttribute('name') || element.id || element.localName).replace(/\s+/g, ' ').trim().slice(0, 90);
  }
  function candidates() {
    const fields = [];
    for (const doc of documents()) {
      for (const element of doc.querySelectorAll('input,textarea,[contenteditable]')) {
        const hint = [element.id, element.name, element.getAttribute('autocomplete'), label(element)].join(' ');
        if (editable(element) && !/password|senha|search|pesquis|busca|username|login|e-mail|email/i.test(hint)) fields.push(element);
      }
    }
    return fields;
  }
  const read = element => element?.isContentEditable ? element.innerText : element?.value ?? '';
  function remember() {
    baseline = { title: read(titleField), essay: read(essayField) };
    $('titleLabel').textContent = label(titleField); $('essayLabel').textContent = label(essayField);
  }
  function fieldInfo() {
    return {
      title: !!titleField && editable(titleField), essay: !!essayField && editable(essayField),
      hasContent: !!(read(titleField).trim() || read(essayField).trim()),
      ...(essayField?.minLength >= 300 && essayField.minLength <= 12000 ? { minChars: essayField.minLength } : {}),
      ...(essayField?.maxLength >= 300 && essayField.maxLength <= 12000 ? { maxChars: essayField.maxLength } : {}),
    };
  }
  function send(type, extra = {}) {
    if (popup && !popup.closed) popup.postMessage({ channel: CHANNEL, nonce, type, ...extra }, HUB_ORIGIN);
  }
  function captureText() {
    const parts = []; let size = 0, truncated = false, nodes = 0;
    for (const doc of documents()) {
      const walker = doc.createTreeWalker(doc.body, 4);
      let node;
      while ((node = walker.nextNode())) {
        if (++nodes > 20000) { truncated = true; break; }
        const parent = node.parentElement;
        if (!parent || parent.closest('script,style,noscript,template,input,textarea,select,button,option,svg,[data-batata-redacao],[contenteditable]:not([contenteditable="false"])') || !visible(parent)) continue;
        const text = node.textContent.replace(/\s+/g, ' ').trim();
        if (!text) continue;
        const remaining = 40000 - size;
        if (text.length > remaining) { parts.push(text.slice(0, remaining)); truncated = true; size = 40000; break; }
        parts.push(text); size += text.length + 1;
      }
      if (size >= 40000 || truncated) break;
    }
    return { text: parts.join('\n').slice(0, 40000), truncated };
  }
  function capture() {
    const captured = captureText(); remember();
    send('capture', { capture: { ...captured, title: document.title.slice(0, 180), url: location.origin + location.pathname, fields: fieldInfo() } });
    status(captured.text ? 'Página lida. Revise a proposta na janela do BatataHub.' : 'Sem texto legível. Cole a proposta manualmente no BatataHub.');
  }
  function restoreHighlight() {
    if (highlighted) { highlighted.element.style.outline = highlighted.outline; highlighted.element.style.outlineOffset = highlighted.offset; highlighted = null; }
  }
  function targetField(target) {
    if (!(target instanceof target.ownerDocument.defaultView.Element)) return null;
    const candidate = target.closest('input,textarea,[contenteditable]');
    return editable(candidate) ? candidate : null;
  }
  let pickDocs = [];
  function stopPick() {
    for (const doc of pickDocs) { doc.removeEventListener('click', pickClick, true); doc.removeEventListener('pointerover', pickOver, true); doc.removeEventListener('keydown', pickKey, true); }
    pickDocs = []; selection = null; restoreHighlight(); $('cancelPick').hidden = true;
  }
  function pickOver(event) {
    if (event.composedPath().includes(host)) return;
    const element = targetField(event.target); restoreHighlight();
    if (element) { highlighted = { element, outline: element.style.outline, offset: element.style.outlineOffset }; element.style.outline = '3px solid #b78bed'; element.style.outlineOffset = '3px'; }
  }
  function pickClick(event) {
    if (event.composedPath().includes(host)) return;
    event.preventDefault(); event.stopImmediatePropagation();
    const element = targetField(event.target);
    if (!element) { status('Clique em um campo de texto editável, ou pressione Esc para cancelar.'); return; }
    if (element === (selection === 'title' ? essayField : titleField)) { status('Escolha um campo diferente para o título e a redação.'); return; }
    if (selection === 'title') titleField = element; else essayField = element;
    stopPick(); remember(); send('fields', { fields: fieldInfo() }); status('Campo escolhido. Continue no BatataHub.');
  }
  function pickKey(event) { if (event.key === 'Escape') { stopPick(); status('Escolha cancelada.'); } }
  function startPick(which) {
    stopPick(); selection = which; pickDocs = documents();
    for (const doc of pickDocs) { doc.addEventListener('click', pickClick, true); doc.addEventListener('pointerover', pickOver, true); doc.addEventListener('keydown', pickKey, true); }
    $('cancelPick').hidden = false; status('Clique no campo de ' + (which === 'title' ? 'título' : 'redação') + ' na página. Esc cancela.');
  }
  function write(element, text) {
    const view = element.ownerDocument.defaultView;
    if (element.isContentEditable) {
      // Explicit line breaks preserve paragraphs even when the editor uses
      // normal whitespace. User text never becomes markup.
      const fragment = element.ownerDocument.createDocumentFragment();
      text.split('\n').forEach((line, index) => {
        if (index) fragment.append(element.ownerDocument.createElement('br'));
        fragment.append(element.ownerDocument.createTextNode(line));
      });
      element.replaceChildren(fragment);
    }
    else {
      const prototype = element.localName === 'textarea' ? view.HTMLTextAreaElement.prototype : view.HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(prototype, 'value').set.call(element, text);
    }
    element.dispatchEvent(new view.InputEvent('input', { bubbles: true, inputType: 'insertText', data: null, composed: true }));
    element.dispatchEvent(new view.Event('change', { bubbles: true }));
  }
  function fill(data) {
    const reply = (ok, message) => send('fill-result', { requestId: data.requestId, ok, message });
    if (typeof data.requestId !== 'string' || data.requestId.length > 80) return;
    if (typeof data.title !== 'string' || !data.title.trim() || data.title.length > 180 || /[\r\n]/.test(data.title) || typeof data.essay !== 'string' || !data.essay.trim() || data.essay.length > 16000) { reply(false, 'O texto recebido é inválido.'); return; }
    if (!editable(titleField) || !editable(essayField) || titleField === essayField) { reply(false, 'Escolha os dois campos na página antes de preencher.'); return; }
    if (read(titleField) !== baseline.title || read(essayField) !== baseline.essay) { reply(false, 'Os campos mudaram desde a leitura. Confira a página e use “Ler página novamente” antes de preencher.'); return; }
    if ((titleField.maxLength > 0 && data.title.length > titleField.maxLength) || (essayField.maxLength > 0 && data.essay.length > essayField.maxLength)) { reply(false, 'O texto ultrapassa o limite de um dos campos. Reduza o texto no BatataHub.'); return; }
    undoState = { titleField, essayField, title: read(titleField), essay: read(essayField) };
    try {
      write(titleField, data.title.trim()); write(essayField, data.essay.trim());
      if (!editable(titleField) || !editable(essayField) || read(titleField) !== data.title.trim() || read(essayField) !== data.essay.trim()) throw new Error();
      remember();
      lastFill = { title: read(titleField), essay: read(essayField) };
      $('undo').hidden = false; status('Título e redação preenchidos. Revise na página; o Maker não clicou em enviar.'); reply(true, 'Preenchido! Revise os campos na página antes de enviar.');
    } catch (_) {
      try { write(undoState.titleField, undoState.title); write(undoState.essayField, undoState.essay); remember(); } catch (_) { /* The editor may have removed the original nodes. */ }
      status('Este editor não aceitou o preenchimento. Confira os campos e use copiar/colar.');
      reply(false, 'Este editor não aceitou o preenchimento. Confira os campos e use os botões de copiar no BatataHub.');
    }
  }
  function onMessage(event) {
    const data = event.data;
    if (event.source !== popup || event.origin !== HUB_ORIGIN || !data || data.channel !== CHANNEL || data.nonce !== nonce) return;
    if (data.type === 'ready') { connected = true; clearInterval(helloTimer); capture(); }
    else if (data.type === 'fill' && connected) fill(data);
    else if (data.type === 'captured') status('Proposta recebida pelo BatataHub. Revise e escolha o nível de escrita.');
    else if (data.type === 'disconnect') { connected = false; status('Conexão encerrada. Abra o Redação Maker novamente para reconectar.'); }
  }
  function open() {
    if (popup && !popup.closed && connected) { popup.focus(); send('hello'); return; }
    if (popup && !popup.closed) popup.close();
    connected = false; clearInterval(helloTimer); clearInterval(closedTimer);
    nonce = Array.from(crypto.getRandomValues(new Uint8Array(24)), byte => byte.toString(16).padStart(2, '0')).join('');
    popup = window.open(HUB_ORIGIN + '/redacao-maker.html#rm=' + nonce, '_blank', 'popup=yes,width=1180,height=880');
    if (!popup) { status('O navegador bloqueou a janela. Clique em “Abrir Redação Maker” para tentar novamente. Se continuar, cole a proposta manualmente no site.'); return; }
    status('Conectando à janela do BatataHub…');
    const started = Date.now();
    helloTimer = setInterval(() => {
      if (popup.closed || Date.now() - started > 30000) { clearInterval(helloTimer); if (!connected) status('Não foi possível conectar. Clique em abrir novamente ou use o modo manual no BatataHub.'); return; }
      send('hello');
    }, 400);
    closedTimer = setInterval(() => { if (popup.closed) { clearInterval(closedTimer); clearInterval(helloTimer); connected = false; status('Janela fechada. Você pode abrir o Redação Maker novamente.'); } }, 1500);
  }
  function close() {
    send('disconnect'); stopPick(); clearInterval(helloTimer); clearInterval(closedTimer);
    window.removeEventListener('message', onMessage); window.removeEventListener('pagehide', close);
    host.remove(); delete window[KEY];
  }
  const fields = candidates(); [titleField, essayField] = fields; remember();
  $('open').onclick = open; $('close').onclick = close;
  $('pickTitle').onclick = () => startPick('title'); $('pickEssay').onclick = () => startPick('essay');
  $('cancelPick').onclick = () => { stopPick(); status('Escolha cancelada.'); };
  $('read').onclick = () => { if (connected) capture(); else status('Abra o Redação Maker para conectar e ler a página.'); };
  $('undo').onclick = () => {
    if (!undoState || !editable(undoState.titleField) || !editable(undoState.essayField)) { status('Os campos originais não estão mais disponíveis.'); return; }
    if (read(undoState.titleField) !== lastFill.title || read(undoState.essayField) !== lastFill.essay) { status('Você alterou os campos depois de preencher. O desfazer foi cancelado para preservar sua edição.'); return; }
    write(undoState.titleField, undoState.title); write(undoState.essayField, undoState.essay);
    remember(); undoState = null; $('undo').hidden = true; status('Preenchimento desfeito.'); send('fields', { fields: fieldInfo() });
  };
  window.addEventListener('message', onMessage); window.addEventListener('pagehide', close, { once: true });
  window[KEY] = { open }; open();
})();
