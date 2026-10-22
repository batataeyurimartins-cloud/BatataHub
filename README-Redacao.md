# Redação Maker

Workspace: `/redacao-maker.html`. A interface é estática; a geração usa `POST /api/redacao/generate` em uma Vercel Function Node 24. A função lê somente `GROQ_API_KEY` do ambiente do servidor. Nenhuma credencial vai no favorito ou no navegador. O mesmo segredo já usado pelo BatataGPT atende os dois recursos.

## Uso

1. Abra o Redação Maker e salve o favorito mostrado em “Instalar favorito”.
2. Entre normalmente na página privada da atividade e execute o favorito.
3. Confira os campos detectados no painel: primeiro campo de texto = título; segundo = redação. Se necessário, use os botões de escolha manual.
4. Na janela do BatataHub, revise o texto capturado, escolha o nível, limites e preferências. Só clicar em gerar envia a proposta ao servidor.
5. Edite o resultado, copie-o ou clique em preencher na página. O script nunca submete o formulário. O painel oferece desfazer enquanto os campos não forem alterados novamente.

Se favoritos, popups, editores específicos ou políticas do site impedirem a conexão, cole a proposta e use os botões de copiar. Não é necessário compartilhar login com o BatataHub. A compatibilidade com a página privada real depende de teste por alguém com acesso; o desenvolvimento usa páginas de simulação.

## Captura e comunicação

`redacao/connector.js` vira um bookmarklet independente, com a origem do Hub inserida pela interface. Não injeta um script remoto na página privada. Captura texto visível de até 40.000 caracteres, excluindo valores de formulários, editores, texto oculto, scripts e estilos. Lê frames visíveis da mesma origem (até 12 documentos e profundidade 3); frames de outra origem e shadow roots de componentes privados não são acessíveis. A captura não inclui query string nem fragmento da URL e não realiza navegação para outras páginas.

O favorito abre uma janela do Hub e comunica-se por `postMessage`. Ambos os lados conferem referência da janela, origem e nonce aleatório de 192 bits por sessão. A primeira mensagem de handshake fixa a origem da página; mensagens com texto usam `targetOrigin` explícito. Propostas e resultados ficam na memória da página, sem persistência em localStorage. O texto revisado é enviado ao serviço de geração quando solicitado, sujeito às políticas de processamento do provedor.

Preenchimento usa setters nativos e eventos `input`/`change`; contenteditable recebe texto, nunca HTML. Campos desconectados, não editáveis, iguais, alterados desde a captura ou com limites insuficientes são recusados. Editores que exigem APIs próprias podem precisar do modo copiar/colar. Os níveis mudam complexidade, sem inserir erros intencionais. Limites orientam a geração e a interface mostra a contagem real para revisão.

## API e validação

Entrada: `{ context, level, instructions?, minChars?, maxChars? }`. Níveis: `simple`, `fraco`, `medio`, `bom`, `maximo`. Contexto de 20–40.000 caracteres; notas de até 3.000; limites inteiros de 300–12.000. Resposta: `{ title, essay, level }`, título de uma linha até 180 caracteres e redação em texto simples, parágrafos separados por linha em branco.

O endpoint aceita JSON da mesma origem, não oferece CORS público, limita corpos/respostas, valida o JSON gerado, cancela em desconexão e tem timeout de 55 segundos. O limitador é separado do chat (3/minuto, 25/hora, 1 simultânea por IP), mas é apenas por instância e não constitui uma cota global persistente. Logs não incluem proposta, resposta, segredo nem erro bruto do provedor. A configuração de modelo permanece no servidor.

## Verificação e publicação

`npm test` executa os testes de servidor. `npm run build` publica somente páginas e pastas de assets aprovadas, incluindo `redacao/`; `server/`, `tests/` e estes documentos não vão para `public/`. `api/redacao/generate.js` é empacotado como função nativa, com duração máxima de 60 segundos e suporte a cancelamento. Publicação ocorre pela integração GitHub → Vercel do BatataHub.
