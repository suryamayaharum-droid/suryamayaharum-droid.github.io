# Lume no navegador

A janela existente da Lume oferece **Ativar IA neste aparelho** quando não há
`data-guide-endpoint` configurado. Abrir o diálogo carrega apenas o controlador
local; o modelo e o runtime externos só são solicitados depois desse clique.

O Worker reutiliza a solução da Escola/Atlas: Transformers.js 3.8.1 e
`onnx-community/Qwen2.5-0.5B-Instruct`, revisão
`516c8d04add8a80c5228f32102b57953b8d421a9`. Usa WebGPU com shader-f16 e q4f16
quando disponível, ou CPU/WASM q8. O primeiro download é da ordem de 500 MB,
além do runtime; desempenho e cache dependem do aparelho e navegador.
Os arquivos vêm de Hugging Face e jsDelivr, que recebem as requisições de
download. As perguntas são processadas pelo Worker local e não são enviadas
a esses serviços. Não há chave, conta, cobrança por chamada ou instalação de app.

O modelo reformula a orientação pública já selecionada pelo índice do site.
Ele não decide nem executa ações administrativas. Os links continuam sendo
produzidos pelo código local e validados pela lista de destinos permitidos.
Texto do modelo é inserido com textContent, com limite e rejeição de URLs/HTML.
Modelos pequenos podem errar na reformulação; a fonte continua sendo a página
oficial vinculada. Cancelamento, erro e timeout encerram o Worker e liberam
qualquer pergunta pendente para a resposta local. Nenhum histórico é salvo.

O processo vive somente durante a sessão da página. Publicar conteúdo,
alterar repositórios ou continuar tarefas com o site fechado exige backend,
autenticação e permissões próprias; esta integração não concede esse acesso.
Um endpoint remoto já configurado mantém o comportamento anterior.

## Verificação

`node --test tests/lume-native.test.mjs` testa ativação explícita, cancelamento,
respostas correlacionadas, limites, timeout, erro, repetição e fallback.

Sirva o repositório por HTTP e execute `node tests/lume-browser.mjs` com
Playwright instalado. `SITE_URL` e `PLAYWRIGHT_MODULE` podem definir o servidor
e o caminho do módulo. O teste usa um Worker simulado para verificar a interface
desktop/mobile sem baixar o modelo. Isso não valida inferência real ou WebGPU.

Preservar `assets/lume-native.mjs`, `assets/lume-ai.worker.mjs`,
`assets/lume-native.css` e a integração em `assets/site.js` ao sincronizar
o gerador privado. As demais páginas, coleções e assets permanecem no repositório.
