# Batata Games

O catálogo tem 10.000 jogos e mantém o tema espacial do Batata Hub.

- `index.html`: seis destaques variados: Geometry Vibes, Smash Karts, Run 3, Basket Random, Moto X3M e Snow Rider 3D.
- `jogos.html`: 200 recomendações no começo, busca no catálogo inteiro, filtro Recomendados, categorias e cards em blocos de 60.
- `jogo.html`: partida individual, informações, tela cheia e link original.
- `embed.html`: início dos novos jogos Flash e módulos HTML G+.
- `js/games.js`: as 2.000 entradas anteriores e 8.000 adições desta versão.
- `js/main.js`, `js/jogo.js` e `js/embed.js`: comportamento das páginas.
- `CURADORIA.md`: ordem dos 200 jogos escolhidos e instruções para atualizar a seleção.
- `css/style.css` e `css/embed.css`: estilos da área de jogos.

Vibes, Vibes 2 Online, 3D, X-Ball, X-Arrow e Monster estão entre os primeiros 60 jogos. O filtro Geometry reúne os jogos dessa linha; Ritmo inclui os mods de Friday Night Funkin identificados nas fontes. Os recomendados mantêm sua prioridade também nos resultados de busca e nos filtros por gênero.

As 9.753 adições desde a base original têm capas locais. As 247 entradas originais mantêm seus IDs, slugs e links de partida; 23 capas quebradas foram substituídas por imagens locais. Consulte `FONTES-DOS-JOGOS.md` para os endereços, a distribuição por fonte e o alcance das checagens.

Os arquivos de partida e o player Ruffle são carregados dos servidores externos. Os módulos G+ são executados em um iframe isolado, sem acesso à origem do hub. Não há instalação de dependências ou build para publicar este site estático.
