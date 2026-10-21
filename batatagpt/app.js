import { cloudReply, contextFor } from './cloud.js';
import { renderMarkdown, createStreamingMarkdownRenderer } from './markdown.js';

const $ = selector => document.querySelector(selector);
const storageKey = 'batatahub-gpt-chats';
const activeKey = 'batatahub-gpt-active';
let chats = [], current = null, busy = false, controller, available = false;

try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (Array.isArray(saved)) {
    chats = saved.filter(chat => typeof chat?.id === 'string' && typeof chat.title === 'string' && Array.isArray(chat.messages)).map(chat => ({
      id: chat.id, title: chat.title,
      messages: chat.messages.filter(message => ['user', 'assistant'].includes(message?.role) && typeof message.content === 'string').map(({ role, content }) => ({ role, content }))
    })).filter(chat => chat.messages.length);
  }
  const selected = localStorage.getItem(activeKey);
  if (chats.some(chat => chat.id === selected)) current = selected;
} catch { /* Conversation storage is optional. */ }

function status(text, error = false) {
  $('#status').textContent = text;
  $('#status').classList.toggle('error', error);
}
function connection(text, state = '') {
  $('#connection').textContent = text;
  $('#connection').className = `connection ${state}`;
  $('#connection').setAttribute('aria-label', text);
  $('#connection').title = text;
}
function persist() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(chats));
    if (current) localStorage.setItem(activeKey, current);
    else localStorage.removeItem(activeKey);
  } catch {
    status('O navegador não conseguiu salvar o histórico. Exporte suas conversas para guardá-las.', true);
  }
}
function nearBottom() {
  const thread = $('#thread');
  return thread.scrollHeight - thread.scrollTop - thread.clientHeight < 160;
}
function scrollToLatest() {
  $('#thread').scrollTop = $('#thread').scrollHeight;
}
function animateMessage(article, className) {
  if (!article || matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('effects-paused')) return;
  const animationName = { 'message-sending': 'chat-message-send', 'message-receiving': 'chat-message-receive', 'message-received': 'chat-message-complete' }[className];
  const cleanup = () => {
    article.classList.remove(className);
    article.removeEventListener('animationend', onEnd);
    clearTimeout(timer);
  };
  const onEnd = event => { if (event.animationName === animationName && !event.pseudoElement) cleanup(); };
  article.classList.add(className);
  article.addEventListener('animationend', onEnd);
  const timer = setTimeout(cleanup, 900);
}
function addCopyButton(article, text) {
  const copy = document.createElement('button');
  copy.type = 'button'; copy.className = 'copy-answer'; copy.textContent = 'Copiar resposta';
  copy.onclick = async () => {
    try {
      await navigator.clipboard.writeText(text);
      copy.textContent = '✓ Copiado';
      setTimeout(() => { copy.textContent = 'Copiar resposta'; }, 2000);
    } catch { status('Selecione o texto da resposta para copiar.'); }
  };
  article.append(copy);
}
function bubble(role, text, { pending = false } = {}) {
  const article = document.createElement('article');
  article.className = `message ${role}`;
  const who = document.createElement('span');
  who.className = 'who';
  if (role === 'assistant') {
    const star = document.createElement('i'); star.textContent = '✦'; star.setAttribute('aria-hidden', 'true');
    who.append(star, 'BATATAGPT');
  } else who.textContent = 'VOCÊ';
  const content = document.createElement('div'); content.className = 'message-content';
  if (pending) {
    const waiting = document.createElement('span'); waiting.className = 'reply-waiting';
    const dots = document.createElement('span'); dots.className = 'typing-dots'; dots.setAttribute('aria-hidden', 'true');
    dots.append(...Array.from({ length: 3 }, () => document.createElement('i')));
    const label = document.createElement('span'); label.textContent = 'Preparando resposta';
    waiting.append(dots, label); content.append(waiting);
  } else if (role === 'assistant') renderMarkdown(content, text);
  else content.textContent = text;
  article.append(who, content);
  if (role === 'assistant' && text && !pending) addCopyButton(article, text);
  $('#messages').append(article);
  return content;
}
function renderMessages() {
  const chat = chats.find(item => item.id === current);
  $('#welcome').hidden = !!chat?.messages.length;
  $('#conversation-title').textContent = chat?.title || 'Uma nova exploração';
  $('#messages').replaceChildren();
  for (const message of chat?.messages || []) bubble(message.role, message.content);
}
function closeHistory() {
  $('#mobile-history').hidden = true;
  $('#history-mobile-button').setAttribute('aria-expanded', 'false');
}
function historyRow(chat) {
  const row = document.createElement('div'); row.className = 'history-row';
  const select = document.createElement('button');
  select.type = 'button'; select.className = chat.id === current ? 'active' : ''; select.title = chat.title;
  select.disabled = busy;
  if (chat.id === current) select.setAttribute('aria-current', 'true');
  const orbit = document.createElement('i'); orbit.textContent = '◌'; orbit.setAttribute('aria-hidden', 'true');
  const title = document.createElement('span'); title.textContent = chat.title;
  select.append(orbit, title);
  select.onclick = () => {
    if (busy) return;
    current = chat.id; persist(); renderMessages(); renderHistory(); closeHistory();
    scrollToLatest();
  };
  const remove = document.createElement('button');
  remove.type = 'button'; remove.className = 'delete-chat'; remove.textContent = '×'; remove.disabled = busy;
  remove.setAttribute('aria-label', `Apagar conversa: ${chat.title}`);
  remove.onclick = () => {
    if (busy) return;
    chats = chats.filter(item => item.id !== chat.id);
    if (current === chat.id) current = null;
    persist(); renderMessages(); renderHistory();
  };
  row.append(select, remove);
  return row;
}
function filteredChats(input) {
  const query = input.value.trim().toLocaleLowerCase('pt-BR');
  return chats.filter(chat => chat.title.toLocaleLowerCase('pt-BR').includes(query));
}
function renderHistory() {
  const desktop = filteredChats($('#search'));
  $('#history').replaceChildren(...desktop.map(historyRow));
  $('#history-empty').hidden = desktop.length > 0;
  $('#history-empty').textContent = chats.length ? 'Nenhuma conversa encontrada.' : 'Suas próximas ideias começam por aqui.';
  const mobile = filteredChats($('#mobile-search'));
  $('#mobile-history-list').replaceChildren(...mobile.map(historyRow));
  if (!mobile.length) {
    const empty = document.createElement('p'); empty.className = 'mobile-history-empty';
    empty.textContent = chats.length ? 'Nenhuma conversa encontrada.' : 'Sua próxima exploração começa com uma mensagem.';
    $('#mobile-history-list').append(empty);
  }
  $('#export').disabled = !chats.length;
  $('#export-mobile').disabled = !chats.length;
  $('#export-dialog').disabled = !chats.length;
  $('#clear').disabled = busy || !chats.length;
}
function resizePrompt() {
  const prompt = $('#prompt');
  prompt.style.height = 'auto';
  prompt.style.height = `${Math.min(180, Math.max(47, prompt.scrollHeight))}px`;
}
function newChat() {
  if (busy) return;
  current = null; persist(); renderMessages(); renderHistory(); closeHistory();
  $('#thread').scrollTop = 0;
  $('#prompt').value = ''; resizePrompt(); $('#prompt').focus();
  status(available ? 'Uma nova ideia começa com uma conversa.' : 'O BatataGPT está temporariamente indisponível. Tente novamente mais tarde.');
}
function exportChats() {
  if (!chats.length) return;
  const url = URL.createObjectURL(new Blob([JSON.stringify(chats, null, 2)], { type: 'application/json' }));
  const download = document.createElement('a'); download.href = url; download.download = 'batatahub-batatagpt-conversas.json';
  document.body.append(download); download.click(); download.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function setBusy(next) {
  busy = next;
  $('.chat-shell').classList.toggle('is-responding', next);
  $('#messages').setAttribute('aria-busy', String(next));
  $('#send').hidden = next; $('#stop').hidden = !next;
  $('#new').disabled = next; $('#new-mobile').disabled = next; $('#clear').disabled = next || !chats.length;
  for (const button of document.querySelectorAll('[data-prompt]')) button.disabled = next;
}
$('#new').onclick = newChat;
$('#new-mobile').onclick = newChat;
$('#search').oninput = renderHistory;
$('#mobile-search').oninput = renderHistory;
$('#export').onclick = exportChats;
$('#export-mobile').onclick = exportChats;
$('#export-dialog').onclick = exportChats;
$('#about').onclick = () => $('#info').showModal();
$('#history-about').onclick = () => { closeHistory(); $('#info').showModal(); };
$('#about-mobile').onclick = () => $('#info').showModal();
$('#close').onclick = () => $('#info').close();
$('#info').addEventListener('click', event => { if (event.target === $('#info')) { const rect = $('#info').getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) $('#info').close(); } });
$('#clear').onclick = () => {
  if (busy) return;
  chats = []; current = null; persist(); renderMessages(); renderHistory(); $('#info').close();
  status('Histórico apagado deste navegador. Vamos começar uma nova ideia?');
};
$('#history-mobile-button').onclick = () => {
  const open = $('#mobile-history').hidden;
  $('#mobile-history').hidden = !open;
  $('#history-mobile-button').setAttribute('aria-expanded', String(open));
  if (open) { renderHistory(); $('#mobile-search').focus(); }
};
$('#close-history').onclick = closeHistory;
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeHistory(); });
for (const button of document.querySelectorAll('[data-prompt]')) button.onclick = () => {
  $('#prompt').value = button.dataset.prompt; resizePrompt(); $('#prompt').focus();
};
$('#prompt').oninput = resizePrompt;
$('#prompt').onkeydown = event => {
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); $('#form').requestSubmit(); }
};
$('#stop').onclick = () => controller?.abort();
$('#form').onsubmit = async event => {
  event.preventDefault();
  if (busy) return;
  const text = $('#prompt').value.trim();
  if (!text) { $('#prompt').focus(); return; }
  setBusy(true); closeHistory();
  let chat = chats.find(item => item.id === current);
  if (!chat) {
    chat = { id: crypto.randomUUID(), title: text.slice(0, 45), messages: [] };
    chats.unshift(chat); current = chat.id;
  }
  chat.messages.push({ role: 'user', content: text });
  persist(); $('#prompt').value = ''; resizePrompt(); renderMessages(); renderHistory();
  animateMessage($('#messages').lastElementChild, 'message-sending');
  const output = bubble('assistant', '', { pending: true });
  const replyArticle = output.closest('.message');
  const renderer = createStreamingMarkdownRenderer(output);
  scrollToLatest();
  let answer = '', errorMessage = '', scrollFrame;
  controller = new AbortController();
  const timeout = setTimeout(() => controller?.abort(new DOMException('Tempo esgotado', 'TimeoutError')), 180000);
  status('BatataGPT está explorando sua ideia…'); connection('◉ Respondendo', 'busy');
  try {
    for await (const chunk of cloudReply(contextFor(chat.messages), controller.signal)) {
      if (!chunk) continue;
      const follow = nearBottom();
      if (!answer) {
        replyArticle.classList.add('message-streaming');
        animateMessage(replyArticle, 'message-receiving');
      }
      answer += chunk; renderer.update(answer);
      if (follow && !scrollFrame) scrollFrame = requestAnimationFrame(() => { scrollFrame = null; scrollToLatest(); });
    }
    if (!answer.trim()) throw Error('A IA não retornou texto. Tente novamente.');
    available = true;
  } catch (error) {
    if (controller.signal.aborted) errorMessage = controller.signal.reason?.name === 'TimeoutError' ? 'A resposta demorou demais. Tente novamente.' : 'Resposta interrompida por você.';
    else errorMessage = error instanceof TypeError ? 'Não foi possível conectar à IA. Verifique sua conexão e tente novamente.' : error.message || 'Não foi possível gerar a resposta. Tente novamente.';
  } finally {
    clearTimeout(timeout);
    if (scrollFrame) cancelAnimationFrame(scrollFrame);
    const follow = nearBottom();
    renderer.flush(answer);
    replyArticle.classList.remove('message-streaming');
    if (answer.trim()) {
      chat.messages.push({ role: 'assistant', content: answer });
      addCopyButton(replyArticle, answer);
      if (!errorMessage) animateMessage(replyArticle, 'message-received');
    }
    else {
      chat.messages.pop();
      if (!chat.messages.length) { chats = chats.filter(item => item.id !== chat.id); current = null; }
      if (!$('#prompt').value.trim()) { $('#prompt').value = text; resizePrompt(); }
    }
    persist(); setBusy(false); controller = null;
    if (!answer.trim()) renderMessages();
    renderHistory();
    if (follow) scrollToLatest();
    status(errorMessage || 'Pronto para a próxima ideia.', !!errorMessage);
    connection(errorMessage ? (available ? '● IA online' : '◌ Indisponível') : '● IA online', available ? 'ready' : 'unavailable');
  }
};
renderMessages(); renderHistory(); resizePrompt(); scrollToLatest();
fetch('/api/batatagpt/health', { signal: AbortSignal.timeout(10000) }).then(response => {
  if (!response.ok) throw Error('Servidor indisponível');
  return response.json();
}).then(data => {
  available = !!data.configured;
  if (busy) return;
  connection(available ? '● IA online' : '◌ Indisponível', available ? 'ready' : 'unavailable');
  status(available ? 'Pronto para conversar. Qual é a sua próxima ideia?' : 'O BatataGPT está temporariamente indisponível. Tente novamente mais tarde.', !available);
}).catch(() => {
  if (busy) return;
  connection('◌ Indisponível', 'unavailable');
  status('O BatataGPT está temporariamente indisponível. Tente novamente mais tarde.', true);
});
