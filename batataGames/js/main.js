(() => {
  'use strict';
  const recommendationRank = game => Number.isInteger(game.curation_rank) && game.curation_rank > 0 ? game.curation_rank : Number.MAX_SAFE_INTEGER;
  const library = typeof games !== 'undefined' && Array.isArray(games)
    ? games.slice().sort((a,b) => recommendationRank(a) - recommendationRank(b)) : [];
  const labels = { recommended:'Recomendados', '2-player':'2 jogadores', '2d':'2D', '3d':'3D', geometry:'Geometry', adventure:'Aventura', shooting:'Tiro', brain:'Raciocínio', brainrot:'Brainrot', casual:'Casual', clicker:'Clicker', driving:'Corrida', emulator:'Emulador', fighting:'Luta', flash:'Flash', food:'Comida', fps:'FPS', girls:'Girls', horror:'Terror', idle:'Idle', io:'.io', minecraft:'Minecraft', multiplayer:'Multiplayer', music:'Ritmo', new:'Novos', platformer:'Plataforma', puzzle:'Quebra-cabeça', roblox:'Roblox', rpg:'RPG', sports:'Esportes', stickman:'Stickman', strategy:'Estratégia', temu:'Temu' };
  const number = new Intl.NumberFormat('pt-BR');
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const categoriesOf = game => {
    const categories = String(game.categories || '').split(/\s+/).filter(Boolean);
    if (/^geometry\b/i.test(String(game.title || '')) && !categories.includes('geometry')) categories.push('geometry');
    if (/\b(?:fnf|friday\s+(?:night|n\.?)\s+funkin)\b/i.test(String(game.title || '')) && !categories.includes('music')) categories.push('music');
    if (recommendationRank(game) !== Number.MAX_SAFE_INTEGER && !categories.includes('recommended')) categories.push('recommended');
    return categories;
  };
  const developerOf = game => {
    const value = String(game.developer || '').trim();
    if (value && value.length <= 72 && !/couldn.t find|not (explicitly|officially)|without more/i.test(value)) return value;
    const publisher = String(game.publisher || '').trim();
    return publisher ? `Via ${publisher}` : 'Criador não informado';
  };
  const devicesOf = game => String(game.devices || '').split(',').map(value => ({Desktop:'PC',Tablet:'Tablet',Mobile:'Celular'}[value.trim()] || value.trim())).filter(Boolean).join(' · ') || 'Dispositivos não informados';
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function card(game) {
    const link = element('a', 'game-card');
    link.href = `jogo.html?slug=${encodeURIComponent(game.slug)}`;
    link.setAttribute('aria-label', `Jogar ${game.title}`);
    const cover = element('div', 'game-thumb-wrap');
    const fallback = element('span','game-cover-fallback',String(game.title || '?').slice(0,1).toUpperCase());
    fallback.setAttribute('aria-hidden','true');
    cover.appendChild(fallback);
    const image = element('img','game-thumb');
    image.src = game.icon || '';
    image.alt = `Capa de ${game.title}`;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.width = 480;
    image.height = 360;
    image.referrerPolicy = 'no-referrer';
    image.addEventListener('error', () => { image.hidden = true; cover.classList.add('cover-unavailable'); }, { once:true });
    if (game.icon) cover.appendChild(image);
    const content = element('div','game-card-content');
    content.appendChild(element('h3','',game.title));
    content.appendChild(element('p','game-sub',developerOf(game)));
    const chips = element('div','game-chip-row');
    categoriesOf(game).slice(0,2).forEach(category => chips.appendChild(element('span','game-chip',labels[category] || category)));
    content.appendChild(chips);
    const bottom = element('div','game-card-bottom');
    bottom.appendChild(element('span','game-device',devicesOf(game)));
    bottom.appendChild(element('span','game-play-label','Jogar'));
    content.appendChild(bottom);
    link.append(cover, content);
    return link;
  }
  function renderCards(grid, list) {
    const fragment = document.createDocumentFragment();
    list.forEach(game => fragment.appendChild(card(game)));
    grid.replaceChildren(fragment);
  }
  const featuredGrid = document.querySelector('[data-featured-grid]');
  if (featuredGrid) {
    const featured = library.filter(game => game.featured).slice(0,6);
    document.getElementById('totalGames').textContent = number.format(library.length);
    const allGamesLink = document.querySelector('[data-all-games-link]');
    if (allGamesLink) allGamesLink.textContent = `Ver os ${number.format(library.length)} jogos`;
    document.getElementById('featuredGames').textContent = featured.length;
    renderCards(featuredGrid, featured);
  }
  const grid = document.getElementById('gamesGrid');
  const input = document.getElementById('searchInput');
  const filter = document.getElementById('categoryFilter');
  const count = document.getElementById('resultsCount');
  const pagination = document.getElementById('catalogPagination');
  const progress = document.getElementById('catalogProgress');
  const more = document.getElementById('loadMoreGames');
  if (!grid || !input || !filter || !count) return;
  const pageSize = 60;
  let matches = [];
  let visible = 0;
  const searchableLibrary = library.map(game => {
    const tags = categoriesOf(game);
    const aliases = /\b(?:fnf|friday\s+(?:night|n\.?)\s+funkin)\b/i.test(game.title) ? 'fnf friday night funkin' : '';
    return { game, tags, text: normalize(`${game.title} ${aliases} ${developerOf(game)} ${tags.join(' ')} ${tags.map(tag => labels[tag] || tag).join(' ')}`) };
  });
  [...new Set(library.flatMap(categoriesOf))].sort((a,b) => {
    if (a === 'recommended') return b === 'recommended' ? 0 : -1;
    if (b === 'recommended') return 1;
    return (labels[a] || a).localeCompare(labels[b] || b,'pt-BR');
  }).forEach(category => {
    const option = element('option','',labels[category] || category);
    option.value = category;
    filter.appendChild(option);
  });
  function appendPage() {
    const fragment = document.createDocumentFragment();
    const next = matches.slice(visible, visible + pageSize);
    next.forEach(game => fragment.appendChild(card(game)));
    grid.appendChild(fragment);
    visible += next.length;
    if (pagination) pagination.hidden = !matches.length;
    if (progress) progress.textContent = `Exibindo ${number.format(visible)} de ${number.format(matches.length)} ${matches.length === 1 ? 'jogo' : 'jogos'}`;
    if (more) more.hidden = visible >= matches.length;
  }
  function render() {
    const query = normalize(input.value);
    const category = filter.value;
    matches = searchableLibrary.filter(item => (!query || item.text.includes(query)) && (category === 'all' || item.tags.includes(category))).map(item => item.game);
    count.textContent = number.format(matches.length);
    const resultLabel = count.parentElement.querySelector('span');
    if (resultLabel) resultLabel.textContent = matches.length === 1 ? 'jogo encontrado' : 'jogos encontrados';
    visible = 0;
    grid.replaceChildren();
    appendPage();
    if (!matches.length) {
      const empty = element('div','empty-state catalog-empty');
      empty.appendChild(element('h2','','Nenhum jogo por aqui.'));
      empty.appendChild(element('p','','Tente outro nome ou escolha uma categoria diferente.'));
      grid.appendChild(empty);
    }
  }
  input.addEventListener('input',render);
  filter.addEventListener('change',render);
  more?.addEventListener('click', () => {
    const firstNewIndex = visible;
    const hadFocus = document.activeElement === more;
    appendPage();
    if (hadFocus) grid.children[firstNewIndex]?.focus({ preventScroll: true });
  });
  render();
})();
