# Apostilas no BatataHub

A área `/apostilas/` organiza links públicos de materiais de estudo no visual do BatataHub. Os PDFs abrem na hospedagem de origem; os arquivos não são copiados nem republicados pelo Hub.

## Catálogo e origem

`apostilas/catalogo.json` contém nomes, categorias, volumes e URLs extraídos do catálogo público [OpenFuture](https://apostilas.nejizzuki.xyz/), consultado em **21 de outubro de 2026**. A referência é creditada como origem do catálogo; a interface do BatataHub é própria e não importa anúncios, rastreadores ou scripts dessa página.

O catálogo desta versão reúne **208 links**, em **56 grupos** e **8 categorias**:

| Categoria | Links |
| --- | ---: |
| Ensino Fundamental | 40 |
| Ensino Médio | 29 |
| São Paulo em Ação | 6 |
| Moderna Plus | 18 |
| Moderna em Ação | 8 |
| SuperAção | 15 |
| Coleções PNLD | 81 |
| Revisa Goiás | 11 |

## Formato e atualização

O JSON preserva `tabs: [{key, label}]` e `data: {key: [{name, count, volumes: [{label, pdfs: [{href, label}]}]}]}`. Os campos `source` e `retrievedAt` registram a referência e a data da consulta.

`volumes[].label` pode ser `null`; nesse caso, a interface deve omitir o subtítulo do volume. As contagens exibidas podem ser calculadas a partir de `pdfs`, sem depender do texto `count` recebido da origem. Todos os links desta versão usam HTTPS e apontam para caminhos PDF.

Para atualizar, confira o catálogo na referência, preserve o formato acima e valide os novos endereços. Atualizar o JSON não deve importar HTML, anúncios ou scripts de terceiros. Como os PDFs permanecem em hospedagens externas, seus endereços e sua disponibilidade podem mudar.

## Verificação

Em 21 de outubro de 2026, foi consultado por HTTP HEAD um PDF de cada uma das oito categorias. As oito amostras retornaram **HTTP 200** e `Content-Type: application/pdf`. Essa checagem não examinou todos os 208 arquivos nem o conteúdo dos materiais. Nenhum PDF foi baixado para o repositório.
