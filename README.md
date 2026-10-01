# Batata Hub

Hub de scripts, jogos e projetos com tema espacial compartilhado em todas as páginas.

## Conteúdo

- Home, Scripts, Games, Redação Maker e Farm Moedas Leia.
- Batata Games: destaques, catálogo de 2.000 jogos, busca, categoria Geometry, carregamento em blocos de 60 cards e player com tela cheia.
- Batata Robótica: cinco downloads VRBlocks e três guias.

## Estrutura

- `assets/css/hub.css`: identidade do hub, navegação, efeitos e adaptações para celular.
- `assets/css/areas.css`: catálogo, player, robótica e tutoriais.
- `assets/js/hub.js`: estrelas, controle de movimento, cópia de scripts e avisos.
- `batataGames/js/games.js`: catálogo dos jogos, com a base original preservada e novas entradas.
- `batataGames/js/main.js`: destaques, busca, categorias e cards.
- `batataGames/js/jogo.js`: player, dados do jogo e tela cheia.
- `scripts/batatarobotica/`: páginas, guias e arquivos originais `.vrblocks`.

## Publicação

Site estático, sem instalação de dependências nem etapa de build. Publique esta pasta mantendo os caminhos relativos.

Os jogos são carregados dos servidores de seus criadores ou dos hosts da base original. A disponibilidade pode variar. As 1.000 entradas anteriores foram preservadas. Os 1.000 novos jogos vêm dos catálogos G+ e da coleção Geometry; todas as 1.753 adições desde a base original têm capas locais e referências em `batataGames/FONTES-DOS-JOGOS.md`. Os arquivos VRBlocks e os códigos dos bookmarklets foram preservados.

## Verificação

As 12 páginas mantêm os mesmos caminhos e arquivos. A área de jogos foi conferida em larguras de 320, 375, 768 e 1440 pixels. Busca nos 2.000 títulos, categorias, carregamento de mais jogos, ausência de resultados, player e tela cheia foram verificados. Os cinco downloads foram comparados com os arquivos originais.

As fontes locais mantêm sua licença em `assets/fonts/LICENSE.txt`.
