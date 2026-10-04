# Batata Hub

Hub de scripts, jogos e projetos com tema espacial compartilhado em todas as páginas.

## Conteúdo

- Home, Scripts, Games, Redação Maker e Farm Moedas Leia.
- Batata Games: catálogo de 10.000 jogos, 200 recomendações no começo, seis destaques variados, busca, categorias, carregamento em blocos de 60 cards e player com tela cheia.
- Batata Robótica: cinco downloads VRBlocks e três guias.

## Estrutura

- `assets/css/hub.css`: identidade do hub, navegação, efeitos e adaptações para celular.
- `assets/css/areas.css`: catálogo, player, robótica e tutoriais.
- `assets/js/hub.js`: estrelas, controle de movimento, cópia de scripts e avisos.
- `batataGames/js/games.js`: catálogo dos jogos, com a base original preservada e novas entradas.
- `batataGames/js/main.js`: destaques, busca, categorias e cards.
- `batataGames/CURADORIA.md`: seleção editorial, ordem dos 200 recomendados e instruções para preservar a prioridade nas próximas adições.
- `batataGames/js/jogo.js`: player, dados do jogo e tela cheia.
- `batataGames/js/embed.js`: início de SWFs com Ruffle e módulos HTML G+.
- `scripts/batatarobotica/`: páginas, guias e arquivos originais `.vrblocks`.

## Publicação

Site estático, sem instalação de dependências nem etapa de build. Publique esta pasta mantendo os caminhos relativos.

Os jogos são carregados dos servidores de seus criadores ou dos hosts da base original. A disponibilidade pode variar. As 2.000 entradas anteriores foram preservadas. As 8.000 adições incluem o Google Sites indicado, catálogos G+ e o feed público de GameMonetize; todas as 9.753 adições desde a base original têm capas locais e referências em `batataGames/FONTES-DOS-JOGOS.md`. Os arquivos VRBlocks e os códigos dos bookmarklets foram preservados.

## Verificação

As 12 páginas anteriores mantêm seus caminhos; uma página adicional prepara os novos jogos Flash e módulos G+. Esta versão foi conferida com testes de dados, lógica do catálogo e player, arquivos locais, links e recursos iniciais das partidas. Não houve nova inspeção visual em navegador nem testes de partidas completas. Os cinco downloads e os códigos dos bookmarklets foram comparados com os arquivos originais. Veja o alcance das checagens em `batataGames/FONTES-DOS-JOGOS.md`.

As fontes locais mantêm sua licença em `assets/fonts/LICENSE.txt`.

## Organização do catálogo

Os 200 jogos escolhidos aparecem primeiro, incluindo a coleção Geometry Vibes, Smash Karts, Run 3, Moto X3M, Basket Random, Snow Rider 3D, Monkey Mart, Subway Surfers e outros clássicos. O filtro Recomendados permite consultar só essa seleção. A propriedade `curation_rank` mantém sua prioridade mesmo que novas entradas sejam acrescentadas antes delas no arquivo de dados. Todos os 10.000 IDs, slugs e links de partida foram preservados. Também foram corrigidas 23 capas antigas, agora hospedadas nesta pasta.
