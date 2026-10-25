# Redação Maker — Redator Batata

`/redacao-maker.html` contém a nova página de instalação do Redator Batata no BatataHub, com visual grafite e verde suave, navegação do site e layout responsivo. O favorito abre o Redator Batata original v1.11.0: um painel compacto dentro da página da atividade, com a marca Redator + BATATA, cinco níveis de escrita e preenchimento de título e redação.

## Instalação e uso

1. Abra `/redacao-maker.html` e arraste o botão “★ Redator Batata” para a barra de favoritos. No celular, use “Copiar bookmarklet” e cole o endereço na URL de um favorito. “Baixar favorito” oferece um arquivo HTML para importar no gerenciador de favoritos.
2. Substitua a URL do favorito antigo pelo novo código. O bookmarklet original carrega a versão atual do Redator direto do projeto; as próximas atualizações do painel passam a chegar pelo mesmo favorito.
3. Entre na página da atividade e execute o favorito.
4. Confira o texto em Referência; use Ler página, Ler seleção ou cole a proposta.
5. Escolha o Tipo (Bem simples, Fraco, Médio, Bom ou Máximo), a Extensão (250, 350, 500 ou 700 palavras) e, se quiser, Tema e instruções.
6. Gere o texto. O Redator Batata detecta e preenche os campos automaticamente quando disponíveis; se necessário, use a escolha manual, copiar ou baixar o texto. Revise na página antes de enviar. O painel não clica em enviar.

O painel usa Shadow DOM e preserva os eventos necessários para que editores compatíveis reconheçam o preenchimento. A compatibilidade com uma página privada depende de teste por alguém com acesso. Sites que bloqueiam favoritos ou conexões externas podem impedir o funcionamento; quando disponível, a opção “Gerar em janela auxiliar” usa a conexão do serviço.

## Cliente e integração

`redacao/bookmarklet.txt` contém o mesmo bookmarklet distribuído em `https://redacao-maker.vercel.app/bookmarklet.txt`. O build o incorpora no botão de instalação e no arquivo de importação `redacao/favorito-batata.html`. Ao executar o favorito na atividade, ele carrega `https://redacao-maker.vercel.app/hub.js`, o runtime mantido em `batataeyurimartins-cloud/Redacao-Maker`. Não há uma implementação separada do painel no BatataHub. `redacao/hub.js` permanece como um carregador de compatibilidade para o mesmo script canônico. `redacao/install.js` controla cópia, download e estado do serviço, com URLs absolutas para o Redator canônico; o HTML fonte também prepara o favorito ao abrir em um servidor local. Chaves e tokens ficam no servidor.

A geração usa exclusivamente `https://redacao-maker.vercel.app/api/generate`. A conexão auxiliar usa `https://redacao-maker.vercel.app/connection.html`; a identidade pública de saúde do serviço continua `batata`. O runtime não depende dos endpoints antigos `/api/redacao/generate` e `/api/redacao/bookmarklet` do BatataHub, que permanecem disponíveis para compatibilidade com instalações anteriores.

O cliente lê até 18.000 caracteres de texto visível, excluindo formulários, editores, texto oculto e o próprio painel. A proposta pode ser revisada antes de gerar; a solicitação envia o contexto e as preferências de escrita para o serviço canônico. Resultados e proposta ficam na memória da página. Fechar remove o painel e cancela a solicitação; executar novamente reutiliza a instância da mesma versão.

## Atualização e validação

Ao publicar uma nova versão do Redator Batata, o bookmarklet carrega o runtime atualizado da mesma URL canônica. Se o próprio carregador mudar, atualize `redacao/bookmarklet.txt` com o arquivo oficial e valide a igualdade do código copiado, do botão de instalação e do favorito para importar. Preserve a marca BatataHub, os outros projetos e o caminho `/redacao-maker.html`.

`npm test` cobre os servidores e políticas CORS existentes, usando respostas simuladas. `npm run build` publica somente páginas e pastas aprovadas, incluindo `redacao/`; `server/`, `tests/` e documentos operacionais ficam fora de `public/`. O fluxo de instalação e o runtime são verificados em navegador com geração simulada, sem chamadas ao provedor. A integração GitHub → Vercel publica a alteração.
