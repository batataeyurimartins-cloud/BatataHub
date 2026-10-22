(() => {
  'use strict';
  const HUB_ORIGIN = '__BATATAHUB_ORIGIN__';
  const KEY = '__batataRedacaoHub';
  if (window[KEY]?.open) { window[KEY].open(); return; }
  if (!/^https?:$/.test(location.protocol) || !document.body) { alert('Abra o favorito na página da atividade, depois de ela carregar.'); return; }
  const previousFocus = document.activeElement;
  const host = document.createElement('div');
  host.dataset.batataRedacao = 'hub';
  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = `
    :host{all:initial!important;display:block!important;position:fixed!important;right:20px!important;bottom:20px!important;z-index:2147483647!important;width:min(1000px,calc(100vw - 40px))!important;color-scheme:dark!important}
    *{box-sizing:border-box} [hidden]{display:none!important} button,input,textarea,select{font:inherit}button{cursor:pointer}button:disabled{opacity:.45;cursor:not-allowed}button,input,textarea,select{border-radius:10px}button:focus-visible,input:focus-visible,textarea:focus-visible,select:focus-visible,summary:focus-visible{outline:2px solid #ceb0fa;outline-offset:3px}
    .hub{font:13px/1.5 system-ui,-apple-system,sans-serif;color:#f5edf9;background:linear-gradient(145deg,#211729,#100e17 65%);border:1px solid #695278;border-radius:21px;box-shadow:0 22px 100px #0008;max-height:88vh;max-height:88dvh;display:flex;flex-direction:column;overflow:hidden;animation:arrive .28s ease-out}
    header{display:flex;align-items:center;gap:12px;flex-shrink:0;padding:17px 22px;border-bottom:1px solid #b69acd30;background:#18131f}.logo{width:34px;height:36px;display:grid;place-items:center;background:#c7a8e917;border:1px solid #c7a8e940;border-radius:10px;font-size:24px;color:#d5b7f4}.heading{min-width:0;flex:1}h1{font-size:19px;font-weight:650;letter-spacing:-.7px;margin:0}.eyebrow{font:9px/1.7 ui-monospace,monospace;letter-spacing:1.5px;color:#af95be}.top-actions{display:flex;gap:7px}button{border:1px solid #745c854d;background:#2c2234;color:#e9dbf3;padding:9px 12px;line-height:1.4;font-weight:550;transition:background .15s,border-color .15s}button:hover:enabled{background:#3d2c49;border-color:#b28dc4}.icon{width:32px;height:32px;padding:0;font-size:19px}.content{padding:21px;overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:#6f547f #17121e}.intro{display:flex;align-items:center;gap:14px;margin-bottom:18px}.intro p{font-size:12px;color:#bba8c8;margin:0;flex:1}.badge{white-space:nowrap;display:inline-flex;gap:6px;align-items:center;padding:5px 8px;font:9px ui-monospace,monospace;color:#a8daca;border:1px solid #92d2c636;background:#92d2c60a;border-radius:5px}.badge:before{content:'';height:4px;width:4px;background:#92d2c6;border-radius:50%}.grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:18px}.column{min-width:0}.card{padding:18px;background:#100c17b3;border:1px solid #b393c72d;border-radius:14px;margin-bottom:14px}.card-heading{display:flex;gap:10px;align-items:center;margin-bottom:15px}.step{display:grid;place-items:center;width:27px;height:30px;border:1px solid #b99bff38;background:#b99bff0c;border-radius:7px;font:10px ui-monospace,monospace;color:#d3b7ef}.peach{border-color:#e5af8a44;color:#edc3a5;background:#f0b78f0b}h2{margin:0;font-size:15px;font-weight:600;letter-spacing:-.2px}.sub{font-size:10px;color:#a18aad;margin:2px 0 0}label{font-size:11px;font-weight:600;color:#d5c2e0;display:block;margin:15px 0 7px}textarea,input,select{display:block;width:100%;min-width:0;border:1px solid #ad8dc337;background:#0d0b12;color:#eee2f7;padding:11px 12px;line-height:1.7}textarea{resize:vertical;font-size:12px}textarea::placeholder,input::placeholder{color:#8e7b9b}#contextInput{min-height:140px}#resultEssay{min-height:240px;line-height:1.9}#resultTitle{font-size:14px}select{appearance:auto;background:#b99bff10}.note{font-size:10px;color:#a38baf;line-height:1.7;margin:8px 0 0}.row{display:flex;gap:8px;align-items:center}.row>*{min-width:0}.fields{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0 0}.field{min-width:0;padding:9px 10px;border:1px solid #b99bff25;border-radius:8px;background:#b99bff05}.field small{display:block;color:#a98dbf;font:8px ui-monospace,monospace;letter-spacing:.8px;margin-bottom:3px}.field span{display:block;color:#d6c2e2;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.fields button{width:100%;font-size:10px;margin-top:8px;padding:7px 5px}.read-row{justify-content:space-between;margin-top:12px}.read-row button{font-size:10px;padding:7px 10px}.read-row span{font-size:9px;color:#9d84ad}details{margin-top:14px;border-top:1px solid #b99bff22;padding-top:12px}summary{cursor:pointer;color:#bca2cd;font-size:11px;list-style:none}summary:before{content:'＋';margin-right:6px;color:#d4b6ec}details[open]>summary:before{content:'−'}.limits{display:grid;grid-template-columns:1fr 1fr;gap:10px}.limits label{font-size:10px}.limits input{font-size:12px}.primary{background:linear-gradient(110deg,#d4b4ed,#b993d8);color:#251632;border-color:#d7b6ee;width:100%;padding:12px 15px;display:flex;align-items:center;justify-content:center;gap:10px}.primary:hover:enabled{background:linear-gradient(110deg,#e3c8f5,#c5a4e1);border-color:#ead1fa}.primary svg{width:17px;height:17px}#cancel{width:100%;margin-top:8px}.loading .primary svg{animation:spin 2s linear infinite}.loading .primary{box-shadow:0 0 30px #b99bff20}.result-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}.result-head .badge{font-size:8px}.copy{font-size:10px;padding:5px 8px;background:transparent}.result-label{display:flex;align-items:center;justify-content:space-between;margin-top:12px;margin-bottom:7px}.result-label label{margin:0}.result-actions{display:flex;gap:8px;margin-top:14px}.fill{background:#92d2c616;border-color:#92d2c64a;color:#b8e4d6;flex:1;padding:11px}.fill:hover:enabled{background:#92d2c62b;border-color:#92d2c67a}#undo{font-size:11px}.stats{font:9px/1.8 ui-monospace,monospace;color:#a68ab6;margin:10px 0}.empty{min-height:390px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px 18px}.paper{width:62px;height:80px;border:1px solid #9d79b7;border-radius:5px;transform:rotate(-9deg);padding:16px 10px;margin-bottom:28px;background:#b99bff0b;position:relative}.paper i{display:block;height:1px;background:#a184b0;margin-bottom:8px}.paper i:first-child{width:70%;background:#e4d3ef;height:2px}.paper:after{content:'✦';position:absolute;right:-14px;top:-22px;color:#edbb98;font-size:27px}.empty h3{font-size:25px;line-height:1.2;font-weight:500;letter-spacing:-1px;margin:0 0 14px}.empty p{font-size:12px;color:#ad95bd;line-height:1.8;max-width:250px;margin:0}.empty .eyebrow{font-size:8px;margin-bottom:13px}.review{font-size:10px;line-height:1.7;color:#a78ab8;border-top:1px solid #b99bff22;padding-top:13px;margin:14px 0 0}footer{padding:12px 22px;background:#0e0b13;border-top:1px solid #b99bff25;flex-shrink:0}.status{font-size:11px;line-height:1.6;margin:0;color:#a9d6c7;overflow-wrap:anywhere}.error{background:#e3957c0c;border:1px solid #df9e8355;border-radius:9px;padding:11px 12px;font-size:11px;line-height:1.7;color:#edc4ad;margin-bottom:13px;white-space:pre-wrap}.mini-status{font-size:10px;color:#bfa6d1;display:none;margin:7px 0 0;max-width:270px}.hub.minimized .content,.hub.minimized footer{display:none}.hub.minimized header{border:0}.hub.minimized .mini-status{display:block}.hub.minimized h1{font-size:15px}.hub.minimized .eyebrow{font-size:7px}.hub.minimized .logo{width:28px;height:30px;font-size:21px}#cancelPick{font-size:10px;padding:5px 8px;margin-top:8px}#result{animation:arrive .3s both}@keyframes arrive{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}@keyframes spin{to{transform:rotate(360deg)}}
    @media(max-width:650px){:host{right:8px!important;bottom:8px!important;width:calc(100vw - 16px)!important}.hub{max-height:92vh;max-height:92dvh;border-radius:16px}header{padding:13px 15px;gap:10px}h1{font-size:17px}.eyebrow{font-size:8px}.content{padding:15px}.grid{grid-template-columns:1fr;gap:0}.intro{align-items:flex-start;gap:8px}.intro p{font-size:11px}.badge{font-size:8px}.card{padding:16px}.empty{min-height:290px}.result-label label{font-size:12px}textarea,input,select{font-size:14px}#contextInput{min-height:145px}#resultEssay{font-size:14px}footer{padding:12px 16px}.status{font-size:10px}.top-actions{gap:5px}.icon{width:29px;height:29px}.row{gap:6px}}
    @media(prefers-reduced-motion:reduce){*,*:before,*:after{animation:none!important;transition:none!important}}
  `;
  const root = document.createElement('section'); root.className = 'hub'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'false'); root.setAttribute('aria-labelledby', 'hubTitle');
  // This template is constant. Captured and generated text never becomes HTML.
  root.innerHTML = `
    <header><span class="logo" aria-hidden="true">✦</span><div class="heading"><div class="eyebrow">BATATAHUB / NA SUA PÁGINA</div><h1 id="hubTitle">Redação Maker</h1><p id="miniStatus" class="mini-status"></p><button id="cancelPick" type="button" hidden>Cancelar escolha</button></div><div class="top-actions"><button id="minimize" class="icon" type="button" aria-label="Minimizar Redação Maker" title="Minimizar">−</button><button id="close" class="icon" type="button" aria-label="Fechar Redação Maker" title="Fechar">×</button></div></header>
    <div class="content"><div class="intro"><p>O Maker leu esta página. Confira a proposta, escolha o nível e gere sua primeira versão aqui mesmo.</p><span class="badge">HUB INJETADO</span></div><div id="error" class="error" role="alert" hidden></div><div class="grid">
      <div class="column"><section class="card"><div class="card-heading"><span class="step">01</span><div><h2>A proposta da página</h2><p class="sub">Edite a leitura antes de gerar.</p></div></div><label for="contextInput">Tema, instruções e textos de apoio</label><textarea id="contextInput" rows="6" minlength="20" maxlength="40000" placeholder="O texto da página aparece aqui. Se necessário, cole a proposta completa."></textarea><p id="captureNote" class="note"></p><div class="read-row row"><button id="read" type="button">↻ Ler página novamente</button><span>Até 40.000 caracteres</span></div><div class="fields"><div class="field"><small>PRIMEIRO CAMPO · TÍTULO</small><span id="titleFieldLabel"></span><button id="pickTitle" type="button">Escolher título</button></div><div class="field"><small>SEGUNDO CAMPO · REDAÇÃO</small><span id="essayFieldLabel"></span><button id="pickEssay" type="button">Escolher redação</button></div></div><p class="note">Só a proposta revisada e suas preferências são enviadas ao clicar em gerar.</p></section>
      <section class="card"><div class="card-heading"><span class="step peach">02</span><div><h2>Seu jeito de escrever</h2><p class="sub">O nível muda a complexidade do texto.</p></div></div><label for="levelSelect">Nível de escrita</label><select id="levelSelect"><option value="simple">Bem simples</option><option value="fraco">Fraco</option><option value="medio" selected>Médio</option><option value="bom">Bom</option><option value="maximo">Máximo</option></select><p id="levelDescription" class="note"></p><label for="instructionsInput">Algum detalhe a mais? <span class="sub">Opcional</span></label><textarea id="instructionsInput" rows="2" maxlength="3000" placeholder="Ex.: quatro parágrafos, linguagem direta, uma conclusão com proposta…"></textarea><details><summary>Limites de tamanho · opcional</summary><div class="limits"><label for="minChars">Mínimo de caracteres<input id="minChars" type="number" min="300" max="12000" step="1" placeholder="Ex.: 1200"></label><label for="maxChars">Máximo de caracteres<input id="maxChars" type="number" min="300" max="12000" step="1" placeholder="Ex.: 2400"></label></div><p class="note">Confira a contagem no resultado. O tamanho gerado pode variar.</p></details></section>
      <button id="generate" class="primary" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3Z"/></svg><span>Gerar redação</span></button><button id="cancel" type="button" hidden>Cancelar geração</button></div>
      <div class="column"><section class="card"><div class="card-heading"><span class="step">03</span><div><h2>Seu espaço de revisão</h2><p class="sub">Leia, ajuste e preencha quando quiser.</p></div></div><div id="empty" class="empty"><div class="paper" aria-hidden="true"><i></i><i></i><i></i><i></i></div><span class="eyebrow">DA PROPOSTA À SUA VERSÃO</span><h3>As palavras<br>já vão chegar.</h3><p>Escolha um nível e gere a redação. O título e o texto ficam aqui para você revisar.</p></div><div id="result" hidden><div class="result-head"><span class="badge">VERSÃO PRONTA</span><span class="sub">Edite à vontade</span></div><div class="result-label"><label for="resultTitle">Título</label><button id="copyTitle" class="copy" type="button">Copiar título</button></div><input id="resultTitle" type="text" maxlength="180" autocomplete="off"><div class="result-label"><label for="resultEssay">Redação</label><button id="copyEssay" class="copy" type="button">Copiar texto</button></div><textarea id="resultEssay" rows="13" maxlength="16000"></textarea><p id="resultStats" class="stats" aria-live="polite"></p><div class="result-actions"><button id="fill" class="fill" type="button" disabled>Preencher na página</button><button id="undo" type="button" hidden>Desfazer</button></div><p id="fillNote" class="note">Revise o texto antes de preencher.</p></div><p class="review">O Maker não clica em enviar. Confira as informações e ajuste o texto antes de entregar. Editores específicos podem exigir copiar e colar.</p></section></div>
    </div></div><footer><p id="status" class="status" role="status" aria-live="polite">Lendo a página…</p></footer>`;
  shadow.append(style, root); document.documentElement.append(host);
  const $ = id => shadow.getElementById(id);
  const descriptions = { simple:'Frases curtas, palavras do dia a dia e ideias diretas.', fraco:'Linguagem básica e argumentos simples, sem erros intencionais.', medio:'Ideias desenvolvidas, organização clara e linguagem equilibrada.', bom:'Argumentos consistentes, boas conexões e vocabulário mais elaborado.', maximo:'Análise aprofundada, repertório pertinente e construção cuidadosa.' };
  let titleField, essayField, baseline, undoState, lastFill, selection, highlighted, pickDocs = [];
  let minimized = false, pickingWasMinimized = false, controller, busy = false, revision = 0, resultRevision = -1, lastCapturedText = '', closed = false;
  function status(message) { $('status').textContent = message; $('miniStatus').textContent = message; }
  function error(message) { $('error').textContent = message; $('error').hidden = !message; }
  function visible(element) {
    if (!element?.isConnected || element.closest('[hidden],[aria-hidden="true"],[inert]')) return false;
    const view = element.ownerDocument.defaultView;
    for (let current = element; current; current = current.parentElement) {
      const computed = view.getComputedStyle(current);
      if (computed.display === 'none' || ['hidden','collapse'].includes(computed.visibility) || computed.opacity === '0') return false;
    }
    return element.getClientRects().length > 0;
  }
  function documents() {
    const docs = [];
    function visit(doc, depth) {
      if (docs.length >= 12 || depth > 3 || !doc.body) return;
      docs.push(doc);
      for (const frame of doc.querySelectorAll('iframe')) {
        try { if (visible(frame) && frame.contentDocument?.body) visit(frame.contentDocument, depth + 1); } catch (_) { /* Cross-origin frames are not accessible. */ }
      }
    }
    visit(document, 0); return docs;
  }
  function editable(element) {
    if (!element || element === host || host.contains(element) || element.getRootNode() === shadow || !visible(element) || element.disabled || element.readOnly) return false;
    if (element.localName === 'textarea') return true;
    if (element.localName === 'input') return element.type === 'text';
    return element.isContentEditable && !element.parentElement?.isContentEditable;
  }
  function label(element) {
    if (!element) return 'Não identificado';
    return (element.getAttribute('aria-label') || element.labels?.[0]?.innerText || element.getAttribute('placeholder') || element.getAttribute('name') || element.id || element.localName).replace(/\s+/g,' ').trim().slice(0,90);
  }
  function candidates() {
    const fields = [];
    for (const doc of documents()) for (const element of doc.querySelectorAll('input,textarea,[contenteditable]')) {
      const hint = [element.id,element.name,element.getAttribute('autocomplete'),label(element)].join(' ');
      if (editable(element) && !/password|senha|search|pesquis|busca|username|login|e-mail|email/i.test(hint)) fields.push(element);
    }
    return fields;
  }
  const read = element => element?.isContentEditable ? element.innerText : element?.value ?? '';
  function remember() { baseline = { title:read(titleField), essay:read(essayField) }; $('titleFieldLabel').textContent = label(titleField); $('essayFieldLabel').textContent = label(essayField); updateFill(); }
  function importLimits() {
    let changed = false;
    for (const [key,attribute] of [['minChars','minLength'],['maxChars','maxLength']]) {
      const value = essayField?.[attribute]; if (!$(key).value && Number.isInteger(value) && value >= 300 && value <= 12000) { $(key).value = value; changed = true; }
    }
    if (changed && resultRevision >= 0) invalidate();
  }
  function captureText() {
    const parts = []; let size = 0, nodes = 0, truncated = false;
    for (const doc of documents()) {
      const walker = doc.createTreeWalker(doc.body, 4); let node;
      while ((node = walker.nextNode())) {
        if (++nodes > 20000) { truncated = true; break; }
        const parent = node.parentElement;
        if (!parent || parent.closest('script,style,noscript,template,input,textarea,select,button,option,svg,[data-batata-redacao],[contenteditable]:not([contenteditable="false"])') || !visible(parent)) continue;
        const text = node.textContent.replace(/\s+/g,' ').trim(); if (!text) continue;
        const available = 40000 - size;
        if (text.length > available) { parts.push(text.slice(0,available)); truncated = true; size = 40000; break; }
        parts.push(text); size += text.length + 1;
      }
      if (size >= 40000 || truncated) break;
    }
    return { text:parts.join('\n').slice(0,40000), truncated };
  }
  function invalidate() {
    revision++; controller?.abort(); updateFill();
    if (resultRevision >= 0) $('fillNote').textContent = 'A proposta ou as preferências mudaram. Gere novamente antes de preencher; o resultado anterior continua disponível para copiar.';
  }
  function capture(initial = false) {
    const captured = captureText();
    if (!initial && $('contextInput').value !== lastCapturedText && $('contextInput').value !== captured.text && !confirm('Substituir suas edições pela nova leitura da página?')) {
      if (captured.text !== lastCapturedText) invalidate();
      lastCapturedText = captured.text; remember(); status('Suas edições foram preservadas.'); return;
    }
    if (captured.text !== lastCapturedText || $('contextInput').value !== captured.text) invalidate();
    lastCapturedText = captured.text; $('contextInput').value = captured.text;
    if (!editable(titleField) || !editable(essayField)) { const fields = candidates(); [titleField,essayField] = fields; }
    importLimits(); remember();
    $('captureNote').textContent = captured.truncated ? 'A leitura foi limitada a 40.000 caracteres. Confira se a proposta e as regras estão completas.' : 'Confira o tema, o gênero e as regras. Valores dos campos e texto oculto não entram nesta leitura.';
    status(captured.text.trim() ? 'Página lida. Escolha o nível e clique em gerar.' : 'Nenhum texto legível encontrado. Cole a proposta no campo acima.');
  }
  function validResult() { return $('resultTitle').value.trim() && $('resultTitle').value.length <= 180 && !/[\r\n]/.test($('resultTitle').value) && $('resultEssay').value.trim() && $('resultEssay').value.length <= 16000; }
  function updateFill() { $('fill').disabled = busy || resultRevision !== revision || !validResult() || !editable(titleField) || !editable(essayField) || titleField === essayField; }
  function stats() {
    const text = $('resultEssay').value, words = text.trim() ? text.trim().split(/\s+/u).length : 0, paragraphs = text.trim() ? text.trim().split(/\n\s*\n/).length : 0;
    let note = '';
    if ($('maxChars').value && text.length > Number($('maxChars').value)) note = ' · acima do máximo escolhido';
    else if ($('minChars').value && text.length < Number($('minChars').value)) note = ' · abaixo do mínimo escolhido';
    $('resultStats').textContent = `${words.toLocaleString('pt-BR')} palavras · ${text.length.toLocaleString('pt-BR')} caracteres · ${paragraphs} ${paragraphs === 1 ? 'parágrafo' : 'parágrafos'}${note}`; updateFill();
  }
  function setBusy(value) { busy = value; root.classList.toggle('loading',value); $('generate').disabled = value; $('generate').querySelector('span').textContent = value ? 'Escrevendo sua redação…' : 'Gerar redação'; $('cancel').hidden = !value; root.setAttribute('aria-busy',String(value)); updateFill(); }
  async function generate() {
    if (busy) return; error('');
    const body = { context:$('contextInput').value.trim(), level:$('levelSelect').value };
    if (body.context.length < 20 || body.context.length > 40000) { error('Inclua a proposta com 20 a 40.000 caracteres.'); $('contextInput').focus(); return; }
    const notes = $('instructionsInput').value.trim(); if (notes) body.instructions = notes;
    if (notes.length > 3000) { error('Use até 3.000 caracteres nas preferências.'); return; }
    for (const key of ['minChars','maxChars']) if ($(key).value !== '') body[key] = Number($(key).value);
    if (['minChars','maxChars'].some(key => body[key] !== undefined && (!Number.isInteger(body[key]) || body[key] < 300 || body[key] > 12000)) || (body.minChars && body.maxChars && body.minChars > body.maxChars)) { error('Use limites inteiros entre 300 e 12.000 caracteres, com mínimo menor ou igual ao máximo.'); return; }
    const requestRevision = revision, requestController = new AbortController(); controller = requestController; let timedOut = false;
    const timeout = setTimeout(() => { timedOut = true; requestController.abort(); },60000);
    setBusy(true); status('Lendo a proposta e organizando a redação. Isso pode levar alguns segundos.');
    try {
      const response = await fetch(HUB_ORIGIN + '/api/redacao/bookmarklet',{ method:'POST',mode:'cors',credentials:'omit',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:requestController.signal });
      const data = await response.json().catch(() => null);
      if (closed) return;
      if (requestRevision !== revision) { status('A proposta ou as preferências mudaram. Confira e gere novamente.'); return; }
      if (requestController.signal.aborted) { status(timedOut ? 'A geração demorou além do esperado. Tente novamente.' : 'Geração cancelada. Sua proposta foi preservada.'); return; }
      if (!response.ok) throw new Error(typeof data?.error?.message === 'string' ? data.error.message.slice(0,400) : 'Não foi possível gerar agora. Tente novamente em instantes.');
      if (!data || typeof data.title !== 'string' || !data.title.trim() || data.title.length > 180 || /[\r\n]/.test(data.title) || typeof data.essay !== 'string' || !data.essay.trim() || data.essay.length > 16000) throw new Error('A resposta chegou incompleta. Tente gerar novamente.');
      $('resultTitle').value = data.title; $('resultEssay').value = data.essay; resultRevision = requestRevision;
      $('empty').hidden = true; $('result').hidden = false; $('fillNote').textContent = 'Revise o título e a redação. O preenchimento só acontece quando você clicar no botão.';
      stats(); status('Redação pronta. Revise e ajuste o que quiser antes de preencher.');
      $('result').scrollIntoView({ block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    } catch (failure) {
      if (closed) return;
      if (requestRevision !== revision) status('A proposta ou as preferências mudaram. Confira e gere novamente.');
      else if (requestController.signal.aborted) status(timedOut ? 'A geração demorou além do esperado. Tente novamente.' : 'Geração cancelada. Sua proposta foi preservada.');
      else { error(failure instanceof TypeError ? 'Não foi possível conectar à IA. Confira a internet. Alguns sites bloqueiam conexões externas; nesse caso o favorito não consegue gerar nesta página.' : failure.message || 'Não foi possível gerar. Tente novamente.'); status('Sua proposta foi preservada para tentar novamente.'); }
    } finally { clearTimeout(timeout); if (controller === requestController) controller = null; if (!closed) setBusy(false); }
  }
  function write(element,text) {
    const view = element.ownerDocument.defaultView;
    if (element.isContentEditable) {
      const fragment = element.ownerDocument.createDocumentFragment();
      text.split('\n').forEach((line,index) => { if (index) fragment.append(element.ownerDocument.createElement('br')); fragment.append(element.ownerDocument.createTextNode(line)); });
      element.replaceChildren(fragment);
    } else {
      const prototype = element.localName === 'textarea' ? view.HTMLTextAreaElement.prototype : view.HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(prototype,'value').set.call(element,text);
    }
    element.dispatchEvent(new view.InputEvent('input',{bubbles:true,inputType:'insertText',data:null,composed:true})); element.dispatchEvent(new view.Event('change',{bubbles:true}));
  }
  function fill() {
    error('');
    if (busy || resultRevision !== revision || !validResult()) { status('Gere novamente após mudar a proposta ou as preferências.'); return; }
    if (captureText().text !== lastCapturedText) { invalidate(); error('O conteúdo da página mudou. Use “Ler página novamente”, confira a proposta e gere novamente antes de preencher.'); return; }
    if (!editable(titleField) || !editable(essayField) || titleField === essayField) { error('Escolha os dois campos na página antes de preencher.'); return; }
    if (read(titleField) !== baseline.title || read(essayField) !== baseline.essay) { error('Os campos mudaram desde a leitura. Confira a página e use “Ler página novamente” antes de preencher.'); return; }
    const title = $('resultTitle').value.trim(), essay = $('resultEssay').value.trim();
    if ((titleField.maxLength > 0 && title.length > titleField.maxLength) || (essayField.maxLength > 0 && essay.length > essayField.maxLength)) { error('O texto ultrapassa o limite de um dos campos. Reduza-o no espaço de revisão.'); return; }
    if ((baseline.title.trim() || baseline.essay.trim()) && !confirm('Os campos já contêm texto. Substituir pelo resultado revisado? Você poderá desfazer pelo Maker.')) return;
    const previous = { titleField,essayField,title:read(titleField),essay:read(essayField) };
    try {
      write(titleField,title); write(essayField,essay);
      if (!editable(titleField) || !editable(essayField) || read(titleField) !== title || read(essayField) !== essay) throw new Error();
      undoState = previous; lastFill = { title:read(titleField),essay:read(essayField) }; remember(); $('undo').hidden = false;
      $('fillNote').textContent = 'Título e redação preenchidos. Revise na página antes de enviar.'; status('Preenchido! O Maker não clicou em enviar.');
    } catch (_) {
      try { write(previous.titleField,previous.title); write(previous.essayField,previous.essay); remember(); } catch (_) { /* Editor may have replaced its fields. */ }
      error('Este editor não aceitou o preenchimento. Confira os campos e use os botões de copiar.');
    }
  }
  function undo() {
    if (!undoState || !editable(undoState.titleField) || !editable(undoState.essayField)) { error('Os campos originais não estão mais disponíveis.'); return; }
    if (read(undoState.titleField) !== lastFill.title || read(undoState.essayField) !== lastFill.essay) { status('Você editou os campos depois de preencher. O desfazer foi cancelado para preservar sua edição.'); return; }
    try { write(undoState.titleField,undoState.title); write(undoState.essayField,undoState.essay); remember(); undoState = null; $('undo').hidden = true; status('Preenchimento desfeito.'); } catch (_) { error('O editor não aceitou desfazer. Confira os campos na página.'); }
  }
  function setMinimized(value) { minimized = value; root.classList.toggle('minimized',value); host.style.setProperty('width',value ? 'min(370px,calc(100vw - 32px))' : 'min(1000px,calc(100vw - 40px))','important'); $('minimize').textContent = value ? '＋' : '−'; $('minimize').setAttribute('aria-label',value ? 'Expandir Redação Maker' : 'Minimizar Redação Maker'); }
  function restoreHighlight() { if (highlighted) { highlighted.element.style.outline = highlighted.outline; highlighted.element.style.outlineOffset = highlighted.offset; highlighted = null; } }
  function targetField(target) { if (!target?.ownerDocument?.defaultView || !(target instanceof target.ownerDocument.defaultView.Element)) return null; const element = target.closest('input,textarea,[contenteditable]'); return editable(element) ? element : null; }
  function stopPick(restore = true) {
    for (const doc of pickDocs) { doc.removeEventListener('click',pickClick,true); doc.removeEventListener('pointerover',pickOver,true); if (doc !== document) doc.removeEventListener('keydown',onKey,true); }
    pickDocs = []; selection = null; restoreHighlight(); $('cancelPick').hidden = true; if (restore) setMinimized(pickingWasMinimized);
  }
  function pickOver(event) {
    if (event.composedPath().includes(host)) return; const element = targetField(event.target); restoreHighlight();
    if (element) { highlighted = {element,outline:element.style.outline,offset:element.style.outlineOffset}; element.style.outline = '3px solid #bd91ee'; element.style.outlineOffset = '3px'; }
  }
  function pickClick(event) {
    if (event.composedPath().includes(host)) return; event.preventDefault(); event.stopImmediatePropagation(); const element = targetField(event.target);
    if (!element) { status('Clique em um campo de texto editável. Esc cancela a escolha.'); return; }
    if (selection === 'title') {
      if (element === essayField) [titleField,essayField] = [essayField,titleField]; else titleField = element;
    } else {
      if (element === titleField) [titleField,essayField] = [essayField,titleField]; else essayField = element;
    }
    stopPick(); error(''); importLimits(); remember(); status('Campo escolhido. Continue revisando sua redação no Maker.');
  }
  function startPick(which) {
    error(''); if (selection) stopPick(); pickingWasMinimized = minimized; selection = which; pickDocs = documents(); setMinimized(true);
    for (const doc of pickDocs) { doc.addEventListener('click',pickClick,true); doc.addEventListener('pointerover',pickOver,true); if (doc !== document) doc.addEventListener('keydown',onKey,true); }
    $('cancelPick').hidden = false; status('Clique no campo de ' + (which === 'title' ? 'título' : 'redação') + ' da página. Esc cancela.');
  }
  async function copy(id,field) {
    const text = $(field).value, button = $(id), previous = button.textContent;
    try {
      try { await navigator.clipboard.writeText(text); }
      catch (_) { const area = document.createElement('textarea'); area.value = text; area.style.cssText = 'position:fixed;opacity:0;pointer-events:none'; shadow.append(area); area.focus(); area.select(); const copied = document.execCommand('copy'); area.remove(); if (!copied) throw new Error(); }
      button.textContent = 'Copiado!'; setTimeout(() => { button.textContent = previous; },1600);
    } catch (_) { error('Selecione o texto no espaço de revisão e copie manualmente.'); }
  }
  function open() { if (closed) return; if (selection) stopPick(); setMinimized(false); if (captureText().text !== lastCapturedText) capture(); $('generate').focus({preventScroll:true}); }
  function close() { if (closed) return; closed = true; controller?.abort(); stopPick(false); document.removeEventListener('keydown',onKey,true); window.removeEventListener('pagehide',close); host.remove(); delete window[KEY]; if (previousFocus?.isConnected && typeof previousFocus.focus === 'function') previousFocus.focus({preventScroll:true}); }
  function onKey(event) { if (event.key !== 'Escape') return; event.preventDefault(); event.stopPropagation(); if (selection) { stopPick(); status('Escolha cancelada.'); } else close(); }
  for (const id of ['contextInput','instructionsInput','minChars','maxChars']) $(id).addEventListener('input',invalidate);
  $('levelSelect').onchange = () => { $('levelDescription').textContent = descriptions[$('levelSelect').value]; invalidate(); };
  $('levelDescription').textContent = descriptions[$('levelSelect').value];
  $('resultTitle').addEventListener('input',updateFill); $('resultEssay').addEventListener('input',stats);
  $('generate').onclick = generate; $('cancel').onclick = () => controller?.abort(); $('fill').onclick = fill; $('undo').onclick = undo;
  $('read').onclick = () => { error(''); capture(); }; $('pickTitle').onclick = () => startPick('title'); $('pickEssay').onclick = () => startPick('essay');
  $('cancelPick').onclick = () => { stopPick(); status('Escolha cancelada.'); }; $('minimize').onclick = () => { if (selection) { stopPick(false); status('Escolha cancelada.'); } setMinimized(!minimized); }; $('close').onclick = close;
  $('copyTitle').onclick = () => copy('copyTitle','resultTitle'); $('copyEssay').onclick = () => copy('copyEssay','resultEssay');
  document.addEventListener('keydown',onKey,true); window.addEventListener('pagehide',close,{once:true});
  const detected = candidates(); [titleField,essayField] = detected; capture(true);
  window[KEY] = { open }; $('generate').focus({preventScroll:true});
})();
