# BatataGPT no BatataHub

O chat fica em `/batatagpt/`. Ele usa a API do próprio BatataHub para conversar com um modelo aberto executado pela Groq. Não há download de modelo nem cadastro para o visitante. A marca e a aplicação são BatataGPT; o modelo base não foi treinado do zero pelo projeto.

A interface e as respostas de metadados da API exibem somente a identidade BatataGPT. Os caminhos HTTP de código do servidor, testes e deste guia retornam 404. Este repositório é público: o código e seu histórico continuam permitindo identificar a integração; remover nomes do site não torna a implementação confidencial.

## Ativar na Vercel

Antes de publicar, abra o projeto **batata-hub → Settings → Environment Variables** e adicione:

| Nome | Valor | Ambientes |
| --- | --- | --- |
| `GROQ_API_KEY` | A chave criada na sua conta Groq | Production e Preview |

Salve como segredo. A chave fica exclusivamente nas funções do servidor. Não coloque a chave no GitHub, no HTML ou em arquivos JavaScript do navegador. O arquivo `.env.example` contém apenas o nome da variável.

Se o deploy já tiver sido criado antes de salvar ou alterar a variável, faça um **Redeploy** para ele receber a configuração. As variáveis não são aplicadas retroativamente a deployments existentes. Quando o GitHub está conectado à Vercel, novos commits na branch de produção geram um novo deploy.

Opcionalmente, configure `GROQ_MODEL` com um modelo de texto disponível na sua conta Groq. O padrão é `openai/gpt-oss-20b`. Os modelos GPT OSS usam `reasoning_effort: low`, sem devolver raciocínio interno, e limite de 2.048 tokens de conclusão. A conta Groq pode ter cotas menores ou diferentes; o app não promete uso ilimitado.

O projeto mantém os arquivos HTML existentes e adiciona funções Node.js 24 em `api/batatagpt/`. `npm run build` prepara somente as páginas e os diretórios `assets`, `batatagpt`, `batataGames`, `scripts` e `apostilas` em `public/`, a pasta servida pelo CDN. O código do servidor, testes e configuração ficam fora dessa saída, disponíveis ao empacotador das funções. Não há redirecionamento geral que substitua as páginas do Hub. O chat tem duração máxima de 60 segundos na Vercel, com timeout interno de 55 segundos e cancelamento quando o visitante interrompe a resposta.

## Contrato da API

`GET /api/batatagpt/health` responde JSON sem cache:

```json
{"configured":true,"name":"BatataGPT"}
```

`configured` informa somente se a configuração está presente; não testa a validade da chave nem a cota do provedor. Sem chave, o valor é `false`, e o chat retorna HTTP 503 com uma mensagem de indisponibilidade para o visitante.

`POST /api/batatagpt/chat` recebe JSON do mesmo site:

```json
{"messages":[{"role":"user","content":"Olá, BatataGPT!"}],"stream":true}
```

O histórico deve alternar `user` e `assistant`, começar e terminar com `user`, conter até 24 mensagens, até 8.000 caracteres por mensagem e até 60.000 caracteres no total. O corpo tem limite de 96 KiB. O servidor adiciona a instrução de sistema e escolhe o modelo; campos de configuração enviados pelo navegador não controlam o provedor.

A resposta usa `text/event-stream` com eventos `data: {...}` compatíveis com `choices[0].delta.content`. O modelo público se chama `batatagpt`. O evento final é `data: [DONE]`. Se o stream falhar, um evento com `{"error":{"message":"..."}}` informa a interrupção. Falhas antes do stream usam esse mesmo formato em JSON e o status HTTP correspondente, incluindo 400, 403, 413, 415, 429, 502, 503 ou 504. Um cancelamento antes do stream pode retornar 499. O cabeçalho `Retry-After`, quando presente, informa quantos segundos aguardar.

Somente o texto público da resposta é repassado ao navegador. Erros brutos, metadados e campos de raciocínio do provedor são descartados.

## Histórico, privacidade e limites

As conversas ficam no armazenamento local do navegador, sem conta ou banco de dados do BatataHub. Apagar dados do navegador remove esse histórico; a interface também permite limpar e exportar conversas. Para responder, o texto da conversa enviado ao chat passa pelo servidor na Vercel e é processado pela Groq, conforme as políticas desses serviços. Evite enviar informações sensíveis. O código não registra o conteúdo das conversas ou a chave nos logs.

Há um controle de uso **por instância aquecida**: até 6 solicitações por minuto, 60 por hora e 2 respostas simultâneas por IP; até 12 respostas simultâneas no total da instância. Esses contadores ficam apenas em memória, reiniciam em novos deployments e não são compartilhados entre instâncias ou regiões. Eles ajudam a reduzir uso acidental, mas não garantem um orçamento global nem impedem abuso distribuído. Para limites públicos rígidos, use armazenamento persistente para o controle de uso ou regras no Vercel Firewall.

## Verificação

Com Node.js 24, execute `npm test`. Os testes usam respostas simuladas e não consomem a API nem precisam de uma chave real. Eles cobrem validação, origem, limites, normalização SSE, UTF-8, falhas, vazamento de segredos, contrapressão e cancelamento.

Depois do deploy, verifique `/api/batatagpt/health` e envie uma pergunta pelo chat. A integração real só pode ser confirmada depois que o proprietário configurar uma chave válida no ambiente do deployment.
