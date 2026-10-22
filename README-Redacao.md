# Redação Maker — hub injetável

`/redacao-maker.html` é a página de instalação no formato original do BatataHub. O produto é um bookmarklet: o favorito injeta todo o hub na página da atividade, dentro de um Shadow DOM, sem abrir popup, iframe ou workspace externo.

## Instalação e uso

1. Abra a página de instalação e copie o novo script ou arraste o botão para a barra de favoritos.
2. Substitua o favorito antigo. O antigo carregava um script de outro projeto e não recebe esta implementação automaticamente.
3. Entre normalmente na página da atividade e execute o favorito.
4. Confira a proposta capturada e os campos detectados: primeiro campo de texto = título; segundo = redação. Há seleção manual se necessário.
5. No próprio painel injetado, escolha entre Bem simples, Fraco, Médio, Bom e Máximo. Gere, revise e edite o título e a redação antes de preencher.
6. O Maker preenche somente após sua ação, oferece copiar e desfazer, e não clica em enviar. A página da atividade pode ter mecanismos próprios de salvamento automático.

A compatibilidade com o site privado real depende de teste por alguém com acesso. Não é necessário compartilhar credenciais com o BatataHub. Se a política do site bloquear bookmarklets, estilos ou conexões externas, o navegador pode impedir o funcionamento; o script não tenta contornar essas políticas.

## Cliente e captura

`redacao/install.js` lê `redacao/hub.js`, insere a origem do BatataHub e prepara um bookmarklet independente e codificado como URL. Não há script remoto, chave ou token a instalar na página privada. O código inteiro é salvo no favorito; atualizações exigem substituir o favorito pelo código novo.

O hub captura texto visível até 40.000 caracteres, excluindo valores de formulários, editores, texto oculto, scripts, estilos e o próprio painel. Frames visíveis da mesma origem podem ser lidos; frames de outra origem e componentes com Shadow DOM fechado são inacessíveis. A captura não inclui cookies, HTML, atributos de autenticação, query string nem fragmento da URL. O usuário revisa o texto antes de clicar em gerar; apenas essa proposta e as preferências são enviadas ao endpoint.

Propostas e resultados ficam na memória da página, sem armazenamento persistente. Mudanças na proposta ou preferências invalidam resultados antigos para preenchimento e cancelam ou descartam gerações em andamento. Fechar cancela a requisição e remove o painel. Abrir novamente foca/reabre a mesma instância.

Preenchimento usa setters nativos com eventos input/change. Contenteditable usa nós de texto e BRs criados pelo script, nunca HTML do modelo. Há verificação dos campos conectados, leitura após preenchimento, limites, mudanças desde a captura e rollback em falhas. Desfazer preserva edições posteriores. Editores que exigem APIs próprias podem precisar de copiar/colar.

## Servidor e CORS

`POST /api/redacao/bookmarklet` aceita JSON de páginas HTTP(S) de outras origens, deliberadamente, pois o favorito precisa funcionar dentro do site privado desconhecido. Preflight permite somente POST e Content-Type; não aceita credenciais/cookies e não expõe segredos. O endpoint existente `/api/redacao/generate` continua restrito à mesma origem. Ambos usam a mesma validação e o mesmo limitador de redação.

Entrada: `{ context, level, instructions?, minChars?, maxChars? }`. Níveis: `simple`, `fraco`, `medio`, `bom`, `maximo`. Contexto de 20–40.000 caracteres; notas até 3.000; limites inteiros de 300–12.000. Resposta: `{ title, essay, level }`. Os níveis mudam complexidade sem inserir erros intencionais; limites orientam a geração e a contagem real permite revisar.

O servidor usa exclusivamente `GROQ_API_KEY` do ambiente Vercel já configurado. Não há chave no cliente, código do favorito, resposta da API ou logs. O modelo é configurado no servidor, a resposta JSON é validada, o corpo e a resposta têm limites, há cancelamento e timeout de 55 s. A chave é enviada somente ao endpoint fixo do provedor. A proposta revisada é processada pelo serviço de geração, sujeito às políticas do provedor.

O limitador de redação é separado do chat: 3/minuto, 25/hora e 1 simultânea por IP, com 8 simultâneas totais por instância. É uma proteção por instância, não uma cota global persistente.

## Build e validação

`npm test` cobre servidor e políticas CORS; `npm run build` publica somente páginas e pastas aprovadas, incluindo redacao/. `server/`, `tests/` e documentos operacionais ficam fora de public/. As funções nativas Node 24 têm duração máxima de 60 s e cancelamento. A integração GitHub → Vercel publica a alteração.
