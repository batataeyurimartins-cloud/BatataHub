const $ = selector => document.querySelector(selector);
const params = new URLSearchParams(location.search);
let category = params.get('categoria') || 'todas';
let query = (params.get('busca') || '').slice(0, 120);
let groupFilter = params.get('grupo') || '';
let tabs = [], groups = [], loaded = false;

const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').replace(/[ºª°]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const element = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};
function icon(kind) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  for (const [key, value] of Object.entries({ viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' })) svg.setAttribute(key, value);
  const path = document.createElementNS(svg.namespaceURI, 'path');
  path.setAttribute('d', kind === 'chevron' ? 'm7 10 5 5 5-5' : kind === 'external' ? 'M14 3h7v7m0-7-11 11M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5' : 'M12 5v16m0-16C9 3 5 3 2 4v15c3-1 7-1 10 2m0-16c3-2 7-2 10-1v15c-3-1-7-1-10 2');
  svg.append(path);
  return svg;
}
function safeURL(value) {
  try { const url = new URL(value); return url.protocol === 'https:' ? url.href : null; } catch { return null; }
}
function parseCatalog(raw) {
  if (!Array.isArray(raw?.tabs) || !raw.data || typeof raw.data !== 'object') throw Error('Catálogo inválido');
  const validTabs = raw.tabs.filter(tab => typeof tab?.key === 'string' && typeof tab.label === 'string' && Array.isArray(raw.data[tab.key]));
  const validGroups = [];
  for (const tab of validTabs) {
    raw.data[tab.key].forEach((card, index) => {
      if (typeof card?.name !== 'string' || !Array.isArray(card.volumes)) return;
      const volumes = card.volumes.filter(volume => Array.isArray(volume?.pdfs)).map(volume => ({
        label: typeof volume.label === 'string' ? volume.label : '',
        pdfs: volume.pdfs.filter(pdf => typeof pdf?.label === 'string' && typeof pdf.href === 'string' && safeURL(pdf.href)).map(pdf => ({ label: pdf.label, href: safeURL(pdf.href) }))
      })).filter(volume => volume.pdfs.length);
      if (volumes.length) validGroups.push({ id: `${tab.key}-${index}`, category: tab.key, categoryLabel: tab.label, name: card.name, volumes });
    });
  }
  if (!validGroups.length) throw Error('Catálogo vazio');
  tabs = validTabs.filter(tab => validGroups.some(group => group.category === tab.key));
  groups = validGroups;
}
const countPDFs = volumes => volumes.reduce((total, volume) => total + volume.pdfs.length, 0);
function matches(value, terms) {
  const text = normalize(value), compact = text.replace(/\s/g, '');
  return terms.every(term => text.includes(term) || compact.includes(term));
}
function results() {
  const terms = normalize(query).split(' ').filter(Boolean);
  return groups.filter(group => (category === 'todas' || group.category === category) && (!groupFilter || group.name === groupFilter)).map(group => ({
    ...group,
    volumes: group.volumes.map(volume => ({ ...volume, pdfs: volume.pdfs.filter(pdf => matches([group.categoryLabel, group.name, volume.label, pdf.label].join(' '), terms)) })).filter(volume => volume.pdfs.length)
  })).filter(group => group.volumes.length);
}
function updateURL() {
  const next = new URLSearchParams(location.search);
  for (const [key, value] of [['categoria', category === 'todas' ? '' : category], ['busca', query], ['grupo', groupFilter]]) {
    if (value) next.set(key, value); else next.delete(key);
  }
  const suffix = next.toString();
  try { history.replaceState(null, '', location.pathname + (suffix ? '?' + suffix : '') + location.hash); } catch { /* Filtering still works if URL updates are unavailable. */ }
}
function updateGroups() {
  const options = [...new Set(groups.filter(group => category === 'todas' || group.category === category).map(group => group.name))];
  if (!options.includes(groupFilter)) groupFilter = '';
  const all = element('option', '', 'Todos os grupos'); all.value = '';
  $('#grade').replaceChildren(all, ...options.map(name => { const option = element('option', '', name); option.value = name; return option; }));
  $('#grade').value = groupFilter;
}
function renderCategories() {
  const options = [{ key: 'todas', label: 'Todas as coleções' }, ...tabs];
  const rail = $('#categories'), previousScroll = rail.scrollLeft;
  rail.replaceChildren(...options.map(tab => {
    const button = element('button', 'category-button' + (category === tab.key ? ' active' : ''));
    button.type = 'button'; button.setAttribute('aria-pressed', String(category === tab.key));
    button.dataset.category = tab.key;
    const symbol = element('span', 'category-symbol'); symbol.append(icon('book'));
    const label = element('span', 'category-copy', tab.label);
    button.append(symbol, label, element('small', '', String(groups.filter(group => tab.key === 'todas' || group.category === tab.key).reduce((sum, group) => sum + countPDFs(group.volumes), 0))));
    button.onclick = () => {
      category = tab.key; updateGroups(); renderCategories(); render();
      [...rail.children].find(item => item.dataset.category === category)?.focus({ preventScroll: true });
    };
    return button;
  }));
  rail.scrollLeft = previousScroll;
  const active = [...rail.children].find(item => item.dataset.category === category);
  if (active && rail.scrollWidth > rail.clientWidth) {
    const item = active.getBoundingClientRect(), box = rail.getBoundingClientRect();
    if (item.left < box.left + 8) rail.scrollLeft -= box.left + 8 - item.left;
    else if (item.right > box.right - 8) rail.scrollLeft += item.right - box.right + 8;
  }
}
function fillGroup(content, group) {
  for (const volume of group.volumes) {
    const section = element('section', 'volume-section');
    if (volume.label) section.append(element('h4', 'volume-label', volume.label));
    const list = element('div', 'pdf-list');
    for (const pdf of volume.pdfs) {
      const link = element('a', 'pdf-link');
      link.href = pdf.href; link.target = '_blank'; link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', `${pdf.label} — ${group.name}${volume.label ? ', ' + volume.label : ''} (PDF, abre em nova aba)`);
      const copy = element('span', 'pdf-copy');
      copy.append(element('span', 'pdf-name', pdf.label), element('span', 'pdf-action', 'Abrir material'));
      link.append(element('span', 'file-mark', 'PDF'), copy, icon('external'));
      list.append(link);
    }
    section.append(list); content.append(section);
  }
}
function gradeCard(group, autoOpen) {
  const details = element('details', 'grade-card');
  details.dataset.category = group.category;
  const summary = element('summary', 'grade-summary');
  const symbol = element('span', 'grade-symbol'); symbol.append(icon('book'));
  const heading = element('span', 'grade-heading'); heading.append(element('span', 'category-label', group.categoryLabel), element('h3', '', group.name));
  const count = countPDFs(group.volumes);
  const meta = element('span', 'grade-count'); meta.append(element('span', '', `${count} ${count === 1 ? 'PDF' : 'PDFs'}`));
  const chevron = icon('chevron'); chevron.classList.add('chevron'); meta.append(chevron);
  summary.append(symbol, heading, meta);
  const content = element('div', 'grade-content'); content.id = `content-${group.id}`;
  summary.setAttribute('aria-controls', content.id); summary.setAttribute('aria-expanded', String(autoOpen));
  let filled = false;
  const fill = () => { if (!filled) { fillGroup(content, group); filled = true; } };
  details.addEventListener('toggle', () => { summary.setAttribute('aria-expanded', String(details.open)); if (details.open) fill(); });
  if (autoOpen) { fill(); details.open = true; }
  details.append(summary, content);
  return details;
}
function render() {
  if (!loaded) return;
  const found = results(), total = found.reduce((sum, group) => sum + countPDFs(group.volumes), 0);
  $('#catalog').replaceChildren(...found.map(group => gradeCard(group, !!(query || groupFilter) && found.length <= 6)));
  $('#empty-state').hidden = total !== 0;
  $('#result-count').textContent = `${total} ${total === 1 ? 'material encontrado' : 'materiais encontrados'} em ${found.length} ${found.length === 1 ? 'grupo' : 'grupos'}`;
  $('#reset-filters').hidden = category === 'todas' && !query && !groupFilter;
  $('#clear-search').hidden = !query;
  $('#suggested-searches').hidden = !!query || !!groupFilter || category !== 'todas';
  updateURL();
}
function resetFilters() {
  category = 'todas'; query = ''; groupFilter = '';
  $('#search').value = ''; updateGroups(); renderCategories(); render(); $('#search').focus();
}
async function loadCatalog() {
  loaded = false;
  $('#search').disabled = true; $('#grade').disabled = true;
  for (const button of document.querySelectorAll('[data-search]')) button.disabled = true;
  $('#load-state').hidden = false;
  $('#load-state').classList.remove('has-error');
  $('#load-state h3').textContent = 'Organizando os livros da estação…';
  $('#load-state p').textContent = 'Seu próximo capítulo está chegando.';
  $('#retry').hidden = true; $('#catalog').setAttribute('aria-busy', 'true');
  $('#result-count').textContent = 'Preparando a biblioteca…';
  try {
    const response = await fetch('./catalogo.json', { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw Error('Catálogo indisponível');
    parseCatalog(await response.json());
    if (!tabs.some(tab => tab.key === category)) category = 'todas';
    $('#total-materials').textContent = String(groups.reduce((sum, group) => sum + countPDFs(group.volumes), 0));
    $('#total-categories').textContent = String(tabs.length);
    $('#total-groups').textContent = String(groups.length);
    $('#search').value = query; $('#search').disabled = false; $('#grade').disabled = false;
    for (const button of document.querySelectorAll('[data-search]')) button.disabled = false;
    loaded = true; $('#load-state').hidden = true;
    updateGroups(); renderCategories(); render();
  } catch {
    $('#load-state').classList.add('has-error');
    $('#load-state h3').textContent = 'A biblioteca não abriu desta vez.';
    $('#load-state p').textContent = 'Não foi possível carregar as apostilas. Tente novamente em instantes.';
    $('#retry').hidden = false;
    $('#result-count').textContent = 'Catálogo temporariamente indisponível.';
  } finally { $('#catalog').setAttribute('aria-busy', 'false'); }
}
$('#search').addEventListener('input', event => { query = event.target.value; render(); });
$('#clear-search').onclick = () => { query = ''; $('#search').value = ''; render(); $('#search').focus(); };
$('#grade').onchange = event => { groupFilter = event.target.value; render(); };
$('#reset-filters').onclick = resetFilters;
$('#empty-reset').onclick = resetFilters;
$('#retry').onclick = loadCatalog;
for (const button of document.querySelectorAll('[data-search]')) button.onclick = () => {
  if (!loaded) return;
  query = button.dataset.search;
  $('#search').value = query;
  render();
  $('#search').focus({ preventScroll: true });
};
document.addEventListener('keydown', event => {
  if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey || !loaded) return;
  if (event.target instanceof HTMLElement && (event.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName))) return;
  event.preventDefault();
  $('#search').focus();
});
loadCatalog();
