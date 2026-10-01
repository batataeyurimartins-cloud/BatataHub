(() => {
  'use strict';
  const library = typeof games !== 'undefined' && Array.isArray(games) ? games : [];
  const slug = new URLSearchParams(location.search).get('slug');
  const game = library.find(item => item.slug === slug);
  const title = document.getElementById('gameTitle');
  const info = document.getElementById('gameInfo');
  const playerBox = document.getElementById('playerBox');
  const tools = document.getElementById('playerTools');
  const hint = document.getElementById('playerHint');
  const frame = document.getElementById('gameFrame');
  const external = document.getElementById('openExternalBtn');
  const fullscreen = document.getElementById('fullscreenBtn');
  const labels = {'2-player':'2 jogadores','2d':'2D','3d':'3D',geometry:'Geometry', adventure:'Aventura', shooting:'Tiro', brain:'Raciocínio',brainrot:'Brainrot',casual:'Casual',clicker:'Clicker',driving:'Corrida',emulator:'Emulador',fighting:'Luta',flash:'Flash',food:'Comida',fps:'FPS',girls:'Girls',horror:'Terror',idle:'Idle',io:'.io',minecraft:'Minecraft',multiplayer:'Multiplayer',new:'Novos',platformer:'Plataforma',puzzle:'Quebra-cabeça',roblox:'Roblox',rpg:'RPG',sports:'Esportes',stickman:'Stickman',strategy:'Estratégia',temu:'Temu'};
  const element = (tag,className,text) => {
    const node=document.createElement(tag);
    if(className)node.className=className;
    if(text!==undefined)node.textContent=text;
    return node;
  };
  if (!game) {
    title.textContent = 'Jogo não encontrado.';
    document.title = 'Jogo não encontrado · Batata Games';
    tools.hidden = true;
    hint.hidden = true;
    info.hidden = true;
    const empty = element('div','player-empty');
    empty.appendChild(element('span','eyebrow','HORA DE ESCOLHER OUTRO JOGO'));
    empty.appendChild(element('h2','','Vamos voltar ao catálogo?'));
    empty.appendChild(element('p','','Esse jogo não está na biblioteca. Abra o catálogo para escolher uma partida.'));
    const back = element('a','btn btn-primary','Explorar catálogo');back.href='jogos.html';empty.appendChild(back);
    playerBox.replaceChildren(empty);
    return;
  }
  title.textContent = game.title;
  document.title = `${game.title} · Batata Games`;
  document.getElementById('playerGameName').textContent = game.title;
  const cover = element('div','game-info-cover');
  const fallback = element('span','game-cover-fallback',String(game.title).slice(0,1).toUpperCase());
  fallback.setAttribute('aria-hidden','true');cover.appendChild(fallback);
  if(game.icon){
    const image=element('img','game-cover');image.src=game.icon;image.alt=`Capa de ${game.title}`;image.width=240;image.height=240;image.referrerPolicy='no-referrer';
    image.addEventListener('error',()=>{image.hidden=true;},{once:true});cover.appendChild(image);
  }
  info.appendChild(cover);
  info.appendChild(element('span','eyebrow','INFORMAÇÕES DO JOGO'));
  const developer=String(game.developer || '').trim();
  const publisher=String(game.publisher || '').trim();
  const credit=developer && developer.length<=72 && !/couldn.t find|not (explicitly|officially)|without more/i.test(developer) ? developer : publisher ? `Via ${publisher}` : 'Criador não informado';
  info.appendChild(element('h2','',credit));
  const devices=String(game.devices || '').split(',').map(value=>({Desktop:'PC',Tablet:'Tablet',Mobile:'Celular'}[value.trim()] || value.trim())).filter(Boolean).join(' · ');
  info.appendChild(element('p','game-devices-info',devices || 'Dispositivos não informados'));
  const chips=element('div','game-chip-row');
  const categories = String(game.categories || '').split(/\s+/).filter(Boolean);
  if (/^geometry\b/i.test(String(game.title || '')) && !categories.includes('geometry')) categories.push('geometry');
  categories.slice(0,8).forEach(tag=>chips.appendChild(element('span','game-chip',labels[tag] || tag)));
  info.appendChild(chips);
  const back=element('a','text-link','Voltar ao catálogo');back.href='jogos.html';info.appendChild(back);
  let url;
  try{url=new URL(game.link);if(!['https:','http:'].includes(url.protocol))url=null;}catch(_){url=null;}
  if(!url){
    external.hidden=true;fullscreen.hidden=true;
    const empty=element('div','player-empty');empty.appendChild(element('h2','','Este jogo está sem um link válido.'));empty.appendChild(element('p','','Escolha outro jogo no catálogo.'));playerBox.replaceChildren(empty);hint.hidden=true;
    return;
  }
  frame.src = game.link;
  frame.title = `Jogar ${game.title}`;
  external.href = game.link;
  fullscreen.addEventListener('click',async()=>{
    try{
      if(document.fullscreenElement){await document.exitFullscreen();return;}
      if(playerBox.requestFullscreen){await playerBox.requestFullscreen();return;}
      if(frame.webkitRequestFullscreen){frame.webkitRequestFullscreen();return;}
      window.showToast?.('Seu navegador não oferece tela cheia. Use “Abrir original”.');
    }catch(_){window.showToast?.('Não foi possível abrir em tela cheia. Tente o link original.');}
  });
})();
