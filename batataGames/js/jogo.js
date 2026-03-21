function getGameBySlug(slug) {
  return Array.isArray(games) ? games.find((game) => game.slug === slug) : null;
}

function escapeHTML(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderMissing() {
  const gameInfo = document.getElementById("gameInfo");
  const playerBox = document.getElementById("playerBox");
  if (gameInfo) {
    gameInfo.innerHTML = `
      <span class="section-tag">Erro</span>
      <h1 class="game-info-title">Jogo não encontrado</h1>
      <p class="game-meta-text">Ou o slug está errado, ou a URL foi aberta sem parâmetro.</p>
      <div class="hero-actions" style="margin-top:18px;">
        <a class="btn btn-primary" href="jogos.html">Voltar ao catálogo</a>
      </div>
    `;
    gameInfo.classList.add('visible');
  }
  if (playerBox) {
    playerBox.innerHTML = `
      <div class="empty-state">
        <h3>Sem jogo para carregar</h3>
        <p>Confere o parâmetro <code>slug</code> na URL.</p>
      </div>
    `;
  }
}

function initGamePage() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const game = getGameBySlug(slug);

  if (!game) {
    renderMissing();
    return;
  }

  document.title = `${game.title} • Batata Games`;

  const gameInfo = document.getElementById("gameInfo");
  const frame = document.getElementById("gameFrame");
  const openExternalBtn = document.getElementById("openExternalBtn");
  const fullscreenBtn = document.getElementById("fullscreenBtn");
  const playerBox = document.getElementById("playerBox");

  const categories = String(game.categories || "").split(/\s+/).filter(Boolean).slice(0, 8);
  gameInfo.innerHTML = `
    <span class="section-tag">${escapeHTML(game.slug)}</span>
    <h1 class="game-info-title">${escapeHTML(game.title)}</h1>
    <p class="game-meta-text">Jogo carregado por link externo. Layout teu; hospedagem do jogo, nem sempre.</p>
    <img class="game-cover" src="${escapeHTML(game.icon)}" alt="Capa de ${escapeHTML(game.title)}" referrerpolicy="no-referrer">
    <div class="game-meta-stack">
      <span class="game-chip">${escapeHTML(game.developer || "Desconhecido")}</span>
      <span class="device-chip">${escapeHTML(game.devices || "Sem info")}</span>
    </div>
    <div class="game-chip-row">
      ${categories.map((category) => `<span class="game-chip">${escapeHTML(category)}</span>`).join("")}
    </div>
    <div class="hero-actions" style="margin-top:18px;">
      <a class="btn btn-secondary" href="jogos.html">Voltar</a>
    </div>
  `;

  frame.src = game.link;
  openExternalBtn.href = game.link;

  fullscreenBtn.addEventListener("click", () => {
    if (playerBox.requestFullscreen) {
      playerBox.requestFullscreen();
      return;
    }

    if (frame.requestFullscreen) {
      frame.requestFullscreen();
    }
  });
}

initGamePage();
