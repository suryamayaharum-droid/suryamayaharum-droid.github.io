# Lume integrada ao site, sem download de modelo

A Lume funciona como assistente local de navegação e consulta ao conteúdo
público. A base revisada, a biblioteca e o código são arquivos estáticos
normais do site. Não usa servidor de inferência, chave, CDN de runtime,
WebGPU, ONNX, Transformers.js nem download de pesos.

Isso não transforma busca em um modelo de conversa geral. A experiência
principal é busca com interpretação de intenções, tolerância a erros,
fatos revisados, práticas de desenho e continuidade de percursos.

## Tecnologia

- **MiniSearch 7.2.0**, MIT, servido pelo próprio site. Busca textual,
  prefixos, fuzzy matching, ranking e ponderação de campos. Módulo original:
  78.014 bytes, aproximadamente 18 KB com gzip. Origem e hash em
  `assets/vendor/README.md`.
- `lume-knowledge.mjs`: fatos, rotas revisadas e quatro práticas do Método.
- `lume-engine.mjs`: índice em memória, sinônimos, intenções e contexto.
- `lume-public-index.mjs`: descoberta e consulta progressiva das páginas.
- `lume-native.mjs`: interface compartilhada, cancelamento e adaptador opcional
  da Prompt API do navegador.
- `lume-native.css`: interface Noir independente de bibliotecas de UI.

A interface existente é reaproveitada. Páginas independentes que carregam
`ecossistema-links.js` recebem a mesma Lume, com proteção contra duplicação.
A cobertura acompanha os carregadores compartilhados; não altera automaticamente
outros repositórios ou páginas que não os utilizam.

## Crescimento com o conteúdo

Ao abrir a guia, a Lume consulta o sitemap do mesmo domínio. Descobre novas
rotas públicas e adiciona seus títulos derivados do caminho ao índice.
Para uma busca que corresponda a uma rota descoberta, consulta até duas
páginas relevantes e extrai título e trecho do conteúdo. Isso permite acompanhar
novas páginas listadas no sitemap, sem acrescentar cada uma ao código da guia.

Limites por sessão: até 400 rotas descobertas, sitemap de até 300.000 caracteres,
páginas de até 350.000 caracteres, trechos de até 550 caracteres e timeout de
1,8 segundo por consulta. Os limites evitam baixar todo o acervo no celular.
O índice fica na memória; novas visitas consultam novamente o mapa publicado.
Sitemaps em formato de índice não são percorridos recursivamente nesta versão.

A descoberta usa os nomes das URLs antes de consultar o conteúdo. Uma palavra
presente somente no corpo de uma página ainda não consultada pode não ser
encontrada. Não é pesquisa completa de toda a internet nem treinamento automático.
Crescimento do índice não significa que o sistema publique páginas ou modifique
seu próprio código.

## IA já disponível no navegador

A Prompt API é uma melhoria opcional para classificar perguntas que a busca
local não compreendeu. O código verifica a mesma configuração explícita de
português para entrada e saída e só chama `LanguageModel.create()` quando
`availability()` retorna exatamente `available`. Os estados `unavailable`,
`downloadable` e `downloading` usam a resposta local e não criam sessão.
Qualquer evento de progresso inesperado aborta a tentativa; timeout total de
6 segundos e cancelamento liberam a sessão, incluindo uma criação tardia.

O modelo só pode sugerir até dois IDs do catálogo conhecido. Texto, URLs,
ações administrativas e instruções produzidos pelo modelo não são executados
nem exibidos. A resposta final continua sendo conteúdo da base do site.

As condições documentadas do Chrome ainda excluem Android/iOS e não incluem
português entre os idiomas da Prompt API. Portanto, a experiência em português
funciona principalmente com o mecanismo local; a integração fica pronta para
navegadores que de fato reportem compatibilidade. Não instala polyfill, força
flags ou pede download para contornar a limitação.

Fontes oficiais consultadas em 2026-10-17:
https://developer.chrome.com/docs/ai/prompt-api
https://learn.microsoft.com/microsoft-edge/web-platform/prompt-api
https://github.com/lucaong/minisearch/tree/v7.2.0

## Privacidade e limites de autonomia

As perguntas não são enviadas a um serviço de IA. A descoberta faz requisições
normais às páginas públicas do próprio site, sem credenciais e sem seguir
redirecionamentos. Somente URLs do mesmo domínio, sem query/hash, fora de assets,
admin e API, são aceitas. Falhas não bloqueiam a orientação básica.

A Lume usa `textContent` para perguntas, trechos e respostas. Links vêm da base
revisada ou de URLs públicas aceitas pelo sitemap. O histórico visual é limitado
a 40 mensagens e não é persistido. A memória entre páginas guarda somente até
quatro IDs de temas revisados no `sessionStorage`, nunca perguntas, nomes ou
contatos. O botão **Limpar contexto** e o comando **apagar memória** removem
esse contexto. Bloqueio do armazenamento não impede o funcionamento.

Não há execução em segundo plano com a página fechada, acesso administrativo,
autopublicação, atualização de pacotes ou treinamento do modelo. As páginas
continuam hospedadas estaticamente no GitHub Pages; não exigem backend próprio.

## Verificação e reprodução

`node --test tests/lume-serverless.test.mjs tests/lume-index.test.mjs`

`node tests/lume-ui.mjs` verifica a interface real com Playwright, incluindo
home, Método e Galeria Viva, layout desktop/mobile, contexto entre páginas,
nova rota do sitemap, cancelamento/limpeza, teclado, texto malicioso e ausência
de requisições de modelos. `PLAYWRIGHT_MODULE` e `CHROMIUM_PATH` permitem usar
ferramentas do ambiente de desenvolvimento, que não são enviadas aos visitantes.
O servidor estático do teste nasce e termina no próprio processo.

A Prompt API é simulada nos testes de contrato para exercitar estados e falhas.
Isso não prova inferência generativa real ou suporte de um aparelho específico.

Preservar os arquivos Lume, MiniSearch e licença, além das integrações em
`assets/site.js` e `assets/ecossistema-links.js`, ao sincronizar o gerador privado.
