const CHANNEL = 'batatahub-redacao-v1';
const $ = id => document.getElementById(id);
const form = $('generateForm');
const context = $('contextInput');
const resultTitle = $('resultTitle');
const resultEssay = $('resultEssay');
const descriptions = {
  simple: 'Bem simples · frases curtas, vocabulário cotidiano e ideias diretas.',
  fraco: 'Fraco · escrita básica, com argumentos pouco aprofundados e linguagem correta.',
  medio: 'Médio · ideias desenvolvidas, organização clara e vocabulário equilibrado.',
  bom: 'Bom · argumentos consistentes, boas conexões e linguagem mais elaborada.',
  maximo: 'Máximo · análise aprofundada, repertório pertinente e construção cuidadosa.',
};
let controller, busy = false, bridge, fields = {}, pendingFill, dirtyContext = false;
let proposalRevision = 0, resultRevision = -1, lastCaptureKey;
const hash = new URLSearchParams(location.hash.slice(1));
const nonce = hash.get('rm');
const bridgeNonce = /^[a-f0-9]{48}$/.test(nonce || '') && window.opener ? nonce : null;
// Keep the non-secret nonce in the fragment so a popup reload can reconnect.
// Source-window reference and exact origin remain mandatory on every message.

function showError(message) {
  $('errorBox').textContent = message;
  $('errorBox').hidden = !message;
}
function setStatus(message) { $('generationStatus').textContent = message; }
function validResult() {
  return resultTitle.value.trim() && resultTitle.value.length <= 180 && !/[\r\n]/.test(resultTitle.value) && resultEssay.value.trim() && resultEssay.value.length <= 16000;
}
function updateFill() {
  $('fillButton').disabled = busy || !!pendingFill || !bridge || !fields.title || !fields.essay || resultRevision !== proposalRevision || !validResult();
}
function invalidateProposal() {
  proposalRevision++;
  controller?.abort();
  if (resultRevision >= 0) $('fillStatus').textContent = 'A proposta ou as preferências mudaram. Gere novamente antes de preencher a página; o resultado anterior continua disponível para copiar.';
  updateFill();
}
function send(type, extra = {}) {
  if (bridge && !bridge.source.closed) bridge.source.postMessage({ channel: CHANNEL, nonce: bridgeNonce, type, ...extra }, bridge.origin);
}
function disconnected(message) {
  bridge = null; fields = {}; $('connectionStatus').textContent = 'Modo manual';
  $('connectionStatus').classList.remove('is-connected');
  $('sourceInfo').textContent = message || 'Cole a proposta abaixo ou abra o favorito na página da atividade.';
  if (pendingFill) { clearTimeout(pendingFill.timer); pendingFill = null; $('fillStatus').textContent = 'A conexão foi encerrada. Você ainda pode copiar os textos.'; }
  updateFill();
}
function describeFields() {
  $('connectionStatus').textContent = 'Página conectada';
  $('connectionStatus').classList.add('is-connected');
  $('fillStatus').textContent = resultRevision >= 0 && resultRevision !== proposalRevision ? 'A proposta ou as preferências mudaram. Gere novamente antes de preencher a página.' : fields.title && fields.essay ? 'Os dois campos foram identificados. Revise o resultado antes de preencher.' : 'Escolha os campos de título e redação no painel da página original. Os botões de copiar também estão disponíveis.';
  updateFill();
}
function capturedFields(info) {
  const value = { title: info?.title === true, essay: info?.essay === true, hasContent: info?.hasContent === true };
  for (const key of ['minChars', 'maxChars']) {
    if (Number.isInteger(info?.[key]) && info[key] >= 300 && info[key] <= 12000 && !$(key).value) $(key).value = info[key];
  }
  return value;
}
function applyCapture(capture) {
  if (context.value !== capture.text) invalidateProposal();
  context.value = capture.text; dirtyContext = false;
  $('captureNotice').replaceChildren();
  $('captureNotice').textContent = capture.truncated ? 'A página é longa: a leitura foi limitada a 40.000 caracteres. Confira se a proposta e as regras estão completas.' : 'Página lida. Confira o tema, as instruções e os limites antes de gerar.';
  if (!capture.text.trim()) $('captureNotice').textContent = 'Nenhum texto legível foi encontrado. Cole a proposta aqui para continuar.';
}
window.addEventListener('message', event => {
  const data = event.data;
  if (!bridgeNonce || event.source !== window.opener || !/^https?:\/\//.test(event.origin) || !data || data.channel !== CHANNEL || data.nonce !== bridgeNonce) return;
  if (bridge && (event.source !== bridge.source || event.origin !== bridge.origin)) return;
  if (data.type === 'hello') {
    bridge = { source: event.source, origin: event.origin };
    send('ready'); return;
  }
  if (!bridge) return;
  if (data.type === 'capture') {
    const capture = data.capture;
    if (!capture || typeof capture.text !== 'string' || capture.text.length > 40000 || typeof capture.url !== 'string' || capture.url.length > 4000) return;
    let sourceUrl;
    try { sourceUrl = new URL(capture.url); } catch (_) { return; }
    if (sourceUrl.origin !== bridge.origin) return;
    const captureKey = sourceUrl.origin + sourceUrl.pathname + '\0' + capture.text;
    if (captureKey !== lastCaptureKey) { invalidateProposal(); lastCaptureKey = captureKey; }
    fields = capturedFields(capture.fields);
    $('sourceInfo').textContent = 'Conectado a ' + sourceUrl.host + ' · o texto abaixo pode ser editado.';
    if (dirtyContext && context.value.trim() && context.value !== capture.text) {
      $('captureNotice').replaceChildren(document.createTextNode('Uma nova leitura está disponível. Suas edições foram preservadas. '));
      const button = document.createElement('button'); button.type = 'button'; button.className = 'capture-action'; button.textContent = 'Usar nova leitura';
      button.onclick = () => applyCapture(capture); $('captureNotice').append(button);
    } else applyCapture(capture);
    describeFields(); send('captured');
  } else if (data.type === 'fields') {
    fields = capturedFields(data.fields); describeFields();
  } else if (data.type === 'fill-result' && pendingFill && data.requestId === pendingFill.id) {
    clearTimeout(pendingFill.timer); pendingFill = null;
    $('fillStatus').textContent = typeof data.message === 'string' ? data.message.slice(0, 400) : 'Confira o preenchimento na página original.';
    if (data.ok === true) { fields.hasContent = true; $('fillButton').textContent = 'Preencher novamente'; }
    updateFill();
  } else if (data.type === 'disconnect') disconnected('O painel da página foi fechado. Abra o favorito novamente para conectar.');
});
if (bridgeNonce) {
  $('connectionStatus').textContent = 'Conectando…';
  $('sourceInfo').textContent = 'Aguardando a página da redação. Você também pode colar a proposta manualmente.';
}
const connectionTimer = setInterval(() => {
  if (bridge?.source.closed) disconnected('A página original foi fechada. Você ainda pode copiar o título e a redação.');
}, 2000);
window.addEventListener('pagehide', () => { controller?.abort(); send('disconnect'); clearInterval(connectionTimer); }, { once: true });

context.addEventListener('input', () => { dirtyContext = true; invalidateProposal(); });
$('levelSelect').addEventListener('change', () => { $('levelDescription').textContent = descriptions[$('levelSelect').value]; invalidateProposal(); });
for (const id of ['instructionsInput', 'minChars', 'maxChars']) $(id).addEventListener('input', invalidateProposal);
$('levelDescription').textContent = descriptions[$('levelSelect').value];

function setBusy(value) {
  busy = value; form.setAttribute('aria-busy', String(value));
  for (const element of form.querySelectorAll('input,textarea,select,button[type="submit"]')) element.disabled = value;
  $('cancelButton').hidden = !value; $('generateButton').disabled = value;
  $('generateButton').querySelector('span').textContent = value ? 'Escrevendo sua redação…' : 'Gerar minha redação';
  $('resultPanel').classList.toggle('is-generating', value);
  updateFill();
}
function updateStats() {
  const text = resultEssay.value;
  const count = text.trim() ? text.trim().split(/\s+/u).length : 0;
  const paragraphs = text.trim() ? text.trim().split(/\n\s*\n/).length : 0;
  const limit = $('maxChars').value; const minimum = $('minChars').value;
  $('resultStats').textContent = `${count.toLocaleString('pt-BR')} palavras · ${text.length.toLocaleString('pt-BR')} caracteres · ${paragraphs} ${paragraphs === 1 ? 'parágrafo' : 'parágrafos'}` + (limit && text.length > Number(limit) ? ' · acima do limite escolhido' : minimum && text.length < Number(minimum) ? ' · abaixo do mínimo escolhido' : '');
  updateFill();
}
resultTitle.addEventListener('input', updateFill); resultEssay.addEventListener('input', updateStats);
$('cancelButton').addEventListener('click', () => controller?.abort());
form.addEventListener('submit', async event => {
  event.preventDefault(); if (busy) return;
  showError('');
  const body = { context: context.value.trim(), level: $('levelSelect').value };
  if (body.context.length < 20 || body.context.length > 40000) { showError('Inclua a proposta com 20 a 40.000 caracteres para gerar a redação.'); context.focus(); return; }
  if ($('instructionsInput').value.trim()) body.instructions = $('instructionsInput').value.trim();
  for (const key of ['minChars', 'maxChars']) if ($(key).value !== '') body[key] = Number($(key).value);
  if (['minChars', 'maxChars'].some(key => body[key] !== undefined && (!Number.isInteger(body[key]) || body[key] < 300 || body[key] > 12000)) || (body.minChars && body.maxChars && body.minChars > body.maxChars)) {
    showError('Use limites entre 300 e 12.000 caracteres, com mínimo menor ou igual ao máximo.'); return;
  }
  controller = new AbortController();
  const current = controller; const revision = proposalRevision; let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; current.abort(); }, 60000);
  setBusy(true); setStatus('Lendo a proposta e organizando o texto. Isso pode levar alguns segundos.');
  try {
    const response = await fetch('/api/redacao/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: current.signal, credentials: 'same-origin' });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(typeof data?.error?.message === 'string' ? data.error.message.slice(0, 400) : 'Não foi possível gerar agora. Tente novamente em alguns instantes.');
    if (revision !== proposalRevision || current.signal.aborted) return;
    if (!data || typeof data.title !== 'string' || !data.title.trim() || data.title.length > 180 || /[\r\n]/.test(data.title) || typeof data.essay !== 'string' || !data.essay.trim() || data.essay.length > 16000) throw new Error('A resposta chegou incompleta. Tente gerar novamente.');
    resultTitle.value = data.title; resultEssay.value = data.essay; resultRevision = revision;
    $('emptyState').hidden = true; $('resultPanel').hidden = false;
    $('fillButton').textContent = 'Preencher na página'; updateStats(); describeResultConnection();
    setStatus('Redação pronta. Confira o conteúdo e ajuste o que quiser antes de usar.');
    $('resultPanel').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  } catch (error) {
    if (revision !== proposalRevision) setStatus('A proposta mudou durante a geração. Confira o texto e gere novamente.');
    else if (current.signal.aborted) setStatus(timedOut ? 'A geração demorou além do esperado. Tente novamente.' : 'Geração cancelada. Sua proposta foi preservada.');
    else { showError(error.message || 'Falha na conexão. Verifique a internet e tente novamente.'); setStatus('Sua proposta foi preservada para tentar novamente.'); }
  } finally { clearTimeout(timer); controller = null; setBusy(false); }
});
function describeResultConnection() {
  if (bridge) describeFields();
  else $('fillStatus').textContent = 'No modo manual, copie os textos. Para preencher diretamente, abra o favorito na página da atividade.';
}
$('fillButton').addEventListener('click', () => {
  if (!bridge || !validResult() || resultRevision !== proposalRevision || pendingFill) return;
  if (bridge.source.closed) { disconnected(); return; }
  if (fields.hasContent && !confirm('Os campos já contêm texto. Substituir pelo título e pela redação revisados? Você poderá desfazer pelo painel da página.')) return;
  const id = crypto.randomUUID();
  pendingFill = { id, timer: setTimeout(() => { pendingFill = null; $('fillStatus').textContent = 'A página não confirmou o preenchimento. Confira a página original ou copie os textos.'; updateFill(); }, 6000) };
  $('fillStatus').textContent = 'Preenchendo os campos na página…'; updateFill();
  send('fill', { requestId: id, title: resultTitle.value.trim(), essay: resultEssay.value.trim() });
});

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return; } catch (_) { /* Older/unsecured browser fallback. */ }
  const area = document.createElement('textarea'); area.value = text; area.style.position = 'fixed'; area.style.opacity = '0'; document.body.append(area); area.select();
  const copied = document.execCommand('copy'); area.remove();
  if (!copied) throw new Error('Selecione e copie o texto manualmente.');
}
function bindCopy(id, getText) {
  const button = $(id); const label = [...button.childNodes];
  button.addEventListener('click', async () => {
    try { await copyText(getText()); button.textContent = 'Copiado!'; setTimeout(() => { button.replaceChildren(...label); }, 1800); }
    catch (error) { showError(error.message); }
  });
}
bindCopy('copyTitle', () => resultTitle.value); bindCopy('copyEssay', () => resultEssay.value);
$('clearButton').addEventListener('click', () => {
  if (busy) return;
  if ((resultTitle.value || resultEssay.value) && !confirm('Limpar este resultado? Copie o texto antes se quiser guardá-lo.')) return;
  resultTitle.value = ''; resultEssay.value = ''; resultRevision = -1; $('resultPanel').hidden = true; $('emptyState').hidden = false; showError(''); setStatus('Resultado limpo. A proposta continua disponível.'); updateFill();
});

async function prepareBookmarklet() {
  try {
    const response = await fetch('redacao/connector.js', { credentials: 'same-origin' });
    if (!response.ok) throw new Error();
    const source = await response.text();
    if (!source.includes('__BATATAHUB_ORIGIN__') || source.length > 100000) throw new Error();
    const code = 'javascript:' + encodeURIComponent(source.replaceAll('__BATATAHUB_ORIGIN__', location.origin));
    $('bookmarkletLink').href = code; $('bookmarkletCode').value = code;
    $('bookmarkletLink').addEventListener('click', event => { event.preventDefault(); $('captureNotice').textContent = 'Arraste “Redação Maker” para a barra de favoritos. Depois, abra esse favorito na página da redação. Você também pode copiar o código e usá-lo como URL de um favorito.'; });
    bindCopy('copyBookmarklet', () => code); $('copyBookmarklet').disabled = false;
  } catch (_) {
    $('bookmarkletLink').removeAttribute('href'); $('copyBookmarklet').disabled = true;
    $('bookmarkletCode').value = 'Não foi possível carregar o favorito. Atualize a página para tentar novamente.';
  }
}
prepareBookmarklet(); updateFill();
