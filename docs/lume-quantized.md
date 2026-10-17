# Lume com modelo quantizado e ferramentas de internet

O modo básico continua disponível. O visitante pode abrir **Pesquisa leve e IA opcional** e escolher **Instalar e ativar IA quantizada**. Só então nasce
um Worker e são solicitados o runtime, o tokenizer e os pesos. Não há inferência
remota, chave de API nem instalação de aplicativo.

## Modelo e execução

- Modelo: `onnx-community/Qwen3-0.6B-ONNX`, Qwen3 0.6B.
- Revisão fixa: `58ca03a5e7b354b480b1a82b34bde8dc7b854cc0`.
- Runtime: Transformers.js **3.8.1**, bundle completo `transformers.min.js`
  servido por jsDelivr. O bundle `transformers.web.min.js` contém imports de
  pacotes e não deve ser carregado diretamente neste Worker sem um bundler.
- WebGPU com `shader-f16`: variante **q4f16**, pesos de cerca de 570 MB.
- Fallback de CPU/WASM: variante **q8**, arquivo `model_quantized.onnx` com
  617.687.575 bytes. Um thread, sem exigir isolamento de origem/SharedArrayBuffer.
- A interface informa aproximadamente **650 MB** no primeiro uso, incluindo
  arquivos auxiliares. O tamanho não é confundido com memória RAM: a execução
  exige memória adicional e pode falhar em aparelhos com poucos recursos.
- O template oficial do tokenizer usa `enable_thinking: false`. São gerados
  até 96 tokens na resposta (48 no planejamento); a interface permite só uma pergunta por vez.

O download completo pode ser reaproveitado pelo cache do navegador enquanto
ele permanecer disponível. Cancelar um download incompleto pode exigir reinício.
A ativação e a permissão online são guardadas apenas na sessão da aba. Ao
navegar para outra página, um novo Worker recarrega o modelo, preferencialmente
do cache; não é um processo permanente compartilhado entre páginas. Desativar
a IA limpa as permissões e libera o Worker. Fechar a janela de conversa cancela
uma consulta ativa; sair da página encerra o processo local.

## Agente e acesso à internet

`LumeAgent` encaminha pedidos explícitos e perguntas factuais diretamente à
pesquisa, antes de qualquer inferência. Isso elimina uma rodada de geração
nessas consultas. Nos outros casos, pode usar o modelo para escolher a ferramenta. O plano é JSON validado com ações `search` ou `answer`, query
limitada e provedor `wikipedia` ou `museum`. Pedidos explícitos e perguntas factuais não dependem de um plano produzido
pelo modelo. Há no máximo uma etapa de pesquisa e uma resposta
final por pergunta; não há ciclo de ferramentas ilimitado.

A **pesquisa leve funciona sem modelo**: entrega trechos identificados como fontes,
sem fingir síntese por IA. Perguntas de navegação já conhecidas continuam no
guia local, salvo pedido explícito de pesquisa. Se o modelo falhar ou atingir o prazo depois da
consulta, os trechos recuperados continuam disponíveis. Os links aparecem antes
da geração e o status indica atividade e tempo decorrido. O contexto
enviado ao modelo contém até duas mensagens anteriores de 240 caracteres, duas
fontes de 450 caracteres e até 400 caracteres do catálogo.

O controle **Permitir pesquisa na internet** começa desmarcado. Quando marcado,
termos podem ser enviados diretamente a:

- `https://pt.wikipedia.org/w/api.php`: busca e trechos introdutórios, CORS
  anônimo com `origin=*`, até três resultados.
- `https://www.wikidata.org/w/api.php`: fatos estruturados de entidades para
  capital, autoria, criador, nacionalidade, local/data de nascimento e morte.
  Resolve rótulos por IDs, prioriza afirmações preferenciais e exclui valores
  com vigência encerrada. Não mistura uma capital histórica com a atual.
- `https://api.artic.edu/api/v1/artworks/search`: metadados de obras do museu,
  até três resultados. Não transfere imagens nem atribui domínio público a
  imagens contemporâneas.

Há fallback entre os provedores e um prazo total de 8 segundos. São requisições
GET, sem cookies/credenciais, sem JSONP e sem seguir redirecionamentos. URLs de
fontes são construídas com IDs válidos e domínios fixos; o modelo não decide
um endereço arbitrário para acessar. Consultas não vão a um serviço de IA.

As fontes são passadas como dados, separadas das instruções. O modelo escreve
a síntese em português; a interface mostra os links efetivamente recuperados.
URLs inventadas e referências a números de fonte inexistentes são retiradas do
texto. Falha de pesquisa é informada separadamente. Isso não garante veracidade
de toda frase: modelos deste tamanho podem errar até fatos básicos, e devem ser
conferidos nas fontes. O acesso é às APIs públicas integradas, não navegação
irrestrita por qualquer site ou acesso a conteúdo com login.

## Memória, cancelamento e limites

Até quatro mensagens anteriores da conversa de IA ficam em memória na página,
sem persistir perguntas em armazenamento. Ao trocar de página, continuam somente
os IDs de temas do guia básico e as preferências da aba. **Limpar contexto**
apaga os temas e essa conversa. Não há treinamento ou modificação automática
dos pesos a partir das perguntas.

O botão de cancelamento aborta pesquisas; se há geração ativa, encerra o Worker
e resolve a promessa pendente. Timeout de inferência: 120 segundos; timeout de
carregamento: 15 minutos. IDs separam respostas e Workers terminados não podem
reativar a interface. Erros restauram a navegação básica e permitem nova tentativa. Falhas reconhecidas
de memória, rede e prazo recebem mensagens distintas. Um encerramento do processo
pelo sistema operacional pode não produzir uma mensagem JavaScript de erro.

Não há publicação, terminal, execução de JavaScript gerado, acesso administrativo,
alteração de arquivos ou trabalho com a página fechada. A inteligência é a
capacidade do modelo de gerar texto e usar estas ferramentas, não consciência
ou autoaperfeiçoamento autônomo.

## Verificação

Contratos e casos de falha:

`node --test tests/lume-agent.test.mjs tests/lume-serverless.test.mjs tests/lume-index.test.mjs`

Interface básica sem download de pesos:

`node tests/lume-ui.mjs`

Inferência real no navegador com pesos previamente baixados:

`node tests/lume-model-real.mjs`

O último teste exige `TRANSFORMERS_DIST` apontando para o runtime 3.8.1,
`LUME_MODEL_CACHE` com os pesos da revisão fixa, `PLAYWRIGHT_MODULE` e
`CHROMIUM_PATH`. Ele serve localmente os mesmos bytes para não baixá-los duas
vezes, usa o Worker e o backend WASM reais e consulta as APIs públicas reais
com TLS verificado pelo host de teste. Não simula os pesos nem o gerador.
Isso é distinto de validar WebGPU ou um celular Android físico.

Validação desta implementação: **46 testes Node passaram**, os fluxos básicos
passaram em Chromium com 1440 px e 390 px, incluindo primeiro clique com
carregamento lento, e o teste real de CPU/WASM completou carregamento,
pesquisa leve sem download, consulta ao Wikidata, geração de resposta em português
com fonte e desativação. A revisão dos pesos acima foi efetivamente baixada e
executada. Não se reivindica validação real de WebGPU/q4f16 ou de Android físico.

## Fontes e preservação

Modelo: https://huggingface.co/onnx-community/Qwen3-0.6B-ONNX
Base: https://huggingface.co/Qwen/Qwen3-0.6B
Quantização: https://huggingface.co/docs/transformers.js/v3.8.1/en/guides/dtypes
MediaWiki CORS: https://www.mediawiki.org/wiki/API:Cross-site_requests
Wikidata: https://www.wikidata.org/w/api.php
Museu: https://api.artic.edu/docs/

Preservar os módulos `lume-model-config.mjs`, `lume-model.worker.mjs`,
`lume-quantized.mjs`, `lume-web-research.mjs`, a integração em `lume-native.mjs`
e os estilos ao sincronizar o gerador privado. Os pesos permanecem no provedor
e no cache do visitante; não são incluídos no repositório GitHub Pages.

Os pesos foram baixados no ambiente de validação e servidos como arquivos locais
para o teste real. Isso não os instala no ChatGPT. Inserir os bytes em JavaScript
ou base64 não reduz o download nem a RAM necessária à inferência. Hospedar os
mesmos pesos junto ao site muda a origem da transferência, mas não corrige uma
falha que acontece depois de carregá-los. O arquivo q8 de 617 MB também excede
o limite de 100 MiB por arquivo do GitHub. Não houve publicação desses pesos no
repositório nem promessa de compatibilidade com todo celular.

Limites: https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github
