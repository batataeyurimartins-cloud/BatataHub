function normalizeText(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getCategories(game) {
  return String(game.categories || "")
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function createGameCard(game) {
  const categories = getCategories(game).slice(0, 3);
  const article = document.createElement("article");
  article.className = "game-card reveal tilt-card";
  article.innerHTML = `
    <div class="shine"></div>
    <div class="game-thumb-wrap">
      <img class="game-thumb" src="${game.icon}" alt="Capa de ${game.title}" loading="lazy" referrerpolicy="no-referrer">
    </div>
    <h3>${game.title}</h3>
    <p class="game-sub">${game.developer || "Desconhecido"}</p>
    <div class="game-chip-row">
      ${categories.map((category) => `<span class="game-chip">${category}</span>`).join("")}
    </div>
    <div class="game-chip-row">
      <span class="device-chip">${game.devices || "Sem info"}</span>
    </div>
    <div class="game-actions">
      <a class="btn btn-primary card-link" href="jogo.html?slug=${encodeURIComponent(game.slug)}">Jogar agora</a>
    </div>
  `;
  return article;
}

function hydrateCards(scope = document) {
  scope.querySelectorAll('.reveal').forEach(el => {
    if (window.observer) {
      window.observer.observe(el);
    } else {
      el.classList.add('visible');
    }
  });
  if (window.bindTiltCards) window.bindTiltCards();
}

function initHome() {
  const totalGames = document.getElementById("totalGames");
  const featuredGames = document.getElementById("featuredGames");
  const featuredGrid = document.querySelector("[data-featured-grid]");
  if (!totalGames || !featuredGames || !featuredGrid || !Array.isArray(games)) return;

  const featuredList = games.filter((game) => game.featured).slice(0, 6);
  totalGames.textContent = games.length;
  featuredGames.textContent = featuredList.length;

  featuredList.forEach((game) => featuredGrid.appendChild(createGameCard(game)));
  hydrateCards(featuredGrid);
}

function initCatalog() {
  const grid = document.getElementById("gamesGrid");
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const resultsCount = document.getElementById("resultsCount");
  if (!grid || !searchInput || !categoryFilter || !resultsCount || !Array.isArray(games)) return;

  const categories = [...new Set(games.flatMap(getCategories))].sort((a, b) => a.localeCompare(b));
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  function render() {
    const term = normalizeText(searchInput.value);
    const selectedCategory = categoryFilter.value;

    const filtered = games.filter((game) => {
      const matchTerm = !term || normalizeText(`${game.title} ${game.developer} ${game.categories}`).includes(term);
      const matchCategory = selectedCategory === "all" || getCategories(game).includes(selectedCategory);
      return matchTerm && matchCategory;
    });

    grid.innerHTML = "";
    resultsCount.textContent = filtered.length;

    if (!filtered.length) {
      grid.innerHTML = `
        <article class="empty-state reveal">
          <h3>Nada encontrado.</h3>
          <p>Ou teu filtro ficou restrito demais, ou a base tem nome ruim demais em alguns jogos.</p>
        </article>
      `;
      hydrateCards(grid);
      return;
    }

    filtered.forEach((game) => grid.appendChild(createGameCard(game)));
    hydrateCards(grid);
  }

  searchInput.addEventListener("input", render);
  categoryFilter.addEventListener("change", render);
  render();
}

initHome();
initCatalog();
