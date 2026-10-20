# Nova × TeraBox — checkpoint de memória

Data do checkpoint: 2026-10-20  
Estado: **espelhamento privado solicitado; upload e leitura de retorno ainda não verificados**

## Atualização geral da Nova — 2026-10-20

- Documento de continuidade criado: [Consciência operacional e plano de avanço](nova-consciencia-operacional.md).
- Índice canônico atualizado para a versão 2 e ligado ao novo documento.
- Foram lidos o README, a home, o mapa `/explorar/`, o sitemap e a navegação global como inspeção inicial; nenhuma falha específica foi confirmada nesta leitura parcial, portanto nenhuma página foi alterada.
- O próximo passo de código é uma auditoria de links com validação real, preservando os acervos existentes.

## Verificação visual pública — 2026-10-20

- A página inicial pública carregou no navegador e não mostrou erros visíveis nem imagens quebradas durante a inspeção.
- O link “Explorar tudo” abriu `/explorar/`.
- `/explorar/` carregou e mostrou as áreas principais: Noivas e retratos; Harum Noir/modelo vivo; Studio 23/tatuagens; Escola/Atlas; informações úteis.
- Esta foi uma inspeção visual pontual, não uma auditoria automatizada de todos os URLs nem garantia de ausência de erros em outros dispositivos.

## Regra de privacidade atualizada

- A memória da Nova deve ser espelhada em `Nova-Memory` como arquivo privado, não distribuída em páginas públicas nem por links de compartilhamento.
- `data/terabox-catalog.json` permanece vazio de propósito. Não o preencher com arquivos de memória ou links privados.
- A presença atual de `NOVA_MEMORY_INDEX.md` no repositório público significa que o índice já foi publicado; alterações futuras não apagam automaticamente cópias ou histórico de commits. Para sigilo real, a memória completa deve ficar em armazenamento privado e o índice público deve conter apenas informação não sensível.

## Papel de cada sistema

- **GitHub**: fonte versionada do código, dos protocolos, do índice e dos checkpoints da Nova.
- **TeraBox / Nova-Memory**: arquivo externo de apoio para cópias de memória e materiais selecionados.
- **GitHub Pages**: interface pública estática; nunca recebe senhas, cookies, tokens ou dados privados da memória.

O GitHub continua sendo a referência versionada do protocolo. O TeraBox é uma cópia externa, não uma segunda fonte de verdade que possa sobrescrever automaticamente o núcleo.

## Estado confirmado no último checkpoint

1. O acesso ao TeraBox foi realizado por meio do fluxo de login com Google.
2. A pasta `Nova-Memory` foi criada no TeraBox.
3. O envio anterior de `NOVA_MEMORY_INDEX.md` foi bloqueado pelo fluxo de seleção/upload usado.
4. O índice foi agora criado e versionado no GitHub em [`NOVA_MEMORY_INDEX.md`](../NOVA_MEMORY_INDEX.md), pronto para nova tentativa de upload.
5. **Não foi confirmado** que o arquivo chegou ao TeraBox nem que pode ser baixado de volta.
6. O perfil de automação disponível ainda não registra uma sessão autenticada no domínio TeraBox; não presumir que a sessão anterior continua disponível.

## Próximo fluxo seguro

1. Abrir uma sessão do TeraBox para o usuário autenticar sem compartilhar a senha no chat.
2. Enviar o conjunto de memória selecionado para `Nova-Memory` como conteúdo privado, sem criar link público e sem substituir arquivos existentes.
3. Conferir nome, tamanho e data do arquivo no TeraBox.
4. Baixar uma cópia de teste para uma área separada e comparar o conteúdo com o original.
5. Só depois marcar o espelhamento como **verificado**. Registrar falhas e retomar do passo pendente, sem repetir etapas concluídas.

## Regras de integridade

- Nunca pedir nem registrar senha, cookie, token de sessão ou segredo OAuth no chat ou no repositório.
- Não enviar todo o histórico bruto por padrão; usar um índice e arquivos de memória selecionados.
- Não apagar nem substituir a memória original durante testes de restauração.
- Não afirmar sincronização automática: neste estado, o processo é manual e ainda não foi validado.
- Não depender de GitHub Actions nem de servidor permanente nesta fase.
- Para integração oficial via API, confirmar elegibilidade e obter credenciais de aplicação no TeraBox; segredos exigem um ambiente privado, nunca HTML/JavaScript público.

## Critério de conclusão

Marcar a etapa como concluída somente quando houver evidência dos dois lados:
- arquivo visível dentro de `Nova-Memory`;
- cópia baixada e comparada com o arquivo de origem.

## Relação com a ponte pública

A documentação pública de integração está em [TeraBox × GitHub](terabox-github-bridge.md). Não colocar links privados da memória no catálogo público `data/terabox-catalog.json`.
