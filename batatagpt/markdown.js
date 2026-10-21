import { marked } from './vendor/marked.js';
import DOMPurify from './vendor/purify.js';

const ALLOWED_TAGS = [
  'p', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'strong', 'em', 'del', 's', 'a', 'ul', 'ol', 'li', 'blockquote',
  'pre', 'code', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
];

function safeLink(value, document) {
  const href = value.trim();
  // Backslashes and control characters can be normalized into an unsafe URL.
  if (!href || /[\u0000-\u001f\u007f\\]/.test(href) || href.startsWith('//')) return false;
  try {
    const url = new URL(href, document.baseURI || 'https://batatagpt.local/');
    return ['http:', 'https:', 'mailto:'].includes(url.protocol);
  } catch { return false; }
}

function decorateContent(target) {
  const document = target.ownerDocument;
  // Classes from model-produced HTML cannot take over other application styles.
  for (const element of target.querySelectorAll('[class]')) {
    const language = element.tagName === 'CODE' && element.className.match(/^language-([\w+#.-]{1,40})$/);
    if (!language) element.removeAttribute('class');
  }
  for (const cell of target.querySelectorAll('[align]')) {
    if (!['left', 'center', 'right'].includes(cell.getAttribute('align'))) cell.removeAttribute('align');
  }
  for (const link of target.querySelectorAll('a')) {
    const href = link.getAttribute('href');
    if (!href || !safeLink(href, document)) {
      link.replaceWith(...link.childNodes);
      continue;
    }
    link.setAttribute('href', href.trim());
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  }
  for (const table of target.querySelectorAll('table')) {
    const region = document.createElement('div');
    region.className = 'markdown-table-wrap';
    region.setAttribute('role', 'region');
    region.setAttribute('aria-label', 'Tabela da resposta');
    region.tabIndex = 0;
    for (const heading of table.querySelectorAll('thead th')) heading.setAttribute('scope', 'col');
    table.replaceWith(region);
    region.append(table);
  }
  for (const pre of target.querySelectorAll('pre')) {
    let code = pre.querySelector('code');
    if (!code) {
      code = document.createElement('code');
      code.textContent = pre.textContent;
      pre.replaceChildren(code);
    }
    const language = code.className.match(/^language-([\w+#.-]{1,40})$/)?.[1];
    const source = code.textContent;
    const block = document.createElement('div'); block.className = 'code-block';
    const bar = document.createElement('div'); bar.className = 'code-bar';
    const label = document.createElement('span'); label.textContent = language || 'Código';
    const copy = document.createElement('button'); copy.type = 'button'; copy.textContent = 'Copiar';
    copy.setAttribute('aria-label', 'Copiar código');
    copy.addEventListener('click', async () => {
      try {
        await document.defaultView.navigator.clipboard.writeText(source);
        copy.textContent = 'Copiado';
      } catch { copy.textContent = 'Selecione para copiar'; }
    });
    bar.append(label, copy);
    pre.replaceWith(block);
    block.append(bar, pre);
  }
}

export function renderMarkdown(target, text, { streaming = false } = {}) {
  const source = String(text ?? '');
  target.classList.add('markdown-body');
  target.setAttribute('aria-busy', streaming ? 'true' : 'false');
  try {
    const html = marked.parse(source, { gfm: true, breaks: true, async: false });
    const safe = DOMPurify.sanitize(html, {
      ALLOWED_TAGS,
      ALLOWED_ATTR: ['href', 'title', 'start', 'align', 'class'],
      ALLOW_DATA_ATTR: false,
      ALLOW_ARIA_ATTR: false,
      FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'img', 'svg', 'math'],
    });
    target.innerHTML = safe;
    decorateContent(target);
  } catch {
    // Partial streamed syntax and rendering failures always have a safe fallback.
    target.replaceChildren(target.ownerDocument.createTextNode(source));
  }
}

export function createStreamingMarkdownRenderer(target) {
  const view = target.ownerDocument.defaultView;
  const hasAnimationFrame = typeof view?.requestAnimationFrame === 'function' && typeof view?.cancelAnimationFrame === 'function';
  const schedule = hasAnimationFrame ? view.requestAnimationFrame.bind(view) : callback => setTimeout(callback, 16);
  const cancel = hasAnimationFrame ? view.cancelAnimationFrame.bind(view) : clearTimeout;
  let latest = '', pending = null, generation = 0;
  const stopFrame = () => {
    generation++;
    if (pending !== null) cancel(pending);
    pending = null;
  };
  return {
    update(text) {
      latest = String(text ?? '');
      if (pending !== null) return;
      const ticket = ++generation;
      pending = schedule(() => {
        if (ticket !== generation) return;
        pending = null;
        renderMarkdown(target, latest, { streaming: true });
      });
    },
    flush(text) {
      if (text !== undefined) latest = String(text ?? '');
      stopFrame();
      renderMarkdown(target, latest);
    },
    cancel: stopFrame,
  };
}
