# Redação Maker — Redator Batata

`/redacao-maker.html` mantém a página de instalação no formato do BatataHub. O favorito agora abre o Redator Batata v1.10.1: um painel preto e compacto dentro da página da atividade, com a marca Redator + BATATA, cinco níveis de escrita e preenchimento de título e redação.

## Instalação e uso

1. Abra `/redacao-maker.html` e arraste o botão “★ Redator Batata — Bookmarklet”, no topo, para a barra de favoritos. No celular, use “Copiar bookmarklet” e cole o endereço na URL de um favorito.
2. Substitua o favorito antigo. O código inteiro fica salvo no favorito; para atualizar uma instalação existente, copie novamente.
3. Entre na página da atividade e execute o favorito.
4. Confira o texto em Referência; use Ler página, Ler seleção ou cole a proposta.
5. Escolha o Tipo (Bem simples, Fraco, Médio, Bom ou Máximo), a Extensão (250, 350, 500 ou 700 palavras) e, se quiser, Tema e instruções.
6. Gere o texto. O Redator Batata detecta e preenche os campos automaticamente quando disponíveis; se necessário, use a escolha manual, copiar ou baixar o texto. Revise na página antes de enviar. O painel não clica em enviar.

O painel usa Shadow DOM e preserva os eventos necessários para que editores compatíveis reconheçam o preenchimento. A compatibilidade com uma página privada depende de teste por alguém com acesso. Sites que bloqueiam favoritos ou conexões externas podem impedir o funcionamento; quando disponível, a opção “Gerar em janela auxiliar” usa a conexão do serviço.

## Cliente e integração

`redacao/hub.js` é uma cópia integral do runtime v1.10.1 de `batataeyurimartins-cloud/Redacao-Maker` (`redator-batata.js`). O build valida a identidade e a origem canônica e incorpora o bookmarklet completo nos dois botões e na área de copiar da página publicada. Assim, os favoritos já estão disponíveis sem baixar o runtime durante a instalação. `redacao/install.js` mantém o carregamento sem cache como alternativa para servir o HTML fonte localmente. Não há substituição de `__BATATAHUB_ORIGIN__`, chave ou token no cliente e não é necessário carregar um script remoto na página da atividade.

A geração usa exclusivamente `https://redacao-maker.vercel.app/api/generate`. A conexão auxiliar usa `https://redacao-maker.vercel.app/connection.html`; a identidade pública de saúde do serviço continua `batata`. O runtime não depende dos endpoints antigos `/api/redacao/generate` e `/api/redacao/bookmarklet` do BatataHub, que permanecem disponíveis para compatibilidade com instalações anteriores.

O cliente lê até 18.000 caracteres de texto visível, excluindo formulários, editores, texto oculto e o próprio painel. A proposta pode ser revisada antes de gerar; a solicitação envia o contexto e as preferências de escrita para o serviço canônico. Resultados e proposta ficam na memória da página. Fechar remove o painel e cancela a solicitação; executar novamente reutiliza a instância da mesma versão.

## Atualização e validação

Ao publicar uma nova versão do Redator Batata, copie o runtime canônico completo para `redacao/hub.js`, confira versão e origem e valide o favorito gerado. Preserve a marca BatataHub, os outros projetos e o caminho `/redacao-maker.html`.

`npm test` cobre os servidores e políticas CORS existentes, usando respostas simuladas. `npm run build` publica somente páginas e pastas aprovadas, incluindo `redacao/`; `server/`, `tests/` e documentos operacionais ficam fora de `public/`. O fluxo de instalação e o runtime são verificados em navegador com geração simulada, sem chamadas ao provedor. A integração GitHub → Vercel publica a alteração.
