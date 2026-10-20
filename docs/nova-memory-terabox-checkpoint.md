# Nova × TeraBox — checkpoint de memória

Data do checkpoint: 2026-10-20  
Estado: **preparação registrada; upload e leitura de retorno ainda não verificados**

## Papel de cada sistema

- **GitHub**: fonte versionada do código, dos protocolos, do índice e dos checkpoints da Nova.
- **TeraBox / Nova-Memory**: arquivo externo de apoio para cópias de memória e materiais selecionados.
- **GitHub Pages**: interface pública estática; nunca recebe senhas, cookies, tokens ou dados privados da memória.

O GitHub continua sendo a referência versionada do protocolo. O TeraBox é uma cópia externa, não uma segunda fonte de verdade que possa sobrescrever automaticamente o núcleo.

## Estado confirmado no último checkpoint

1. O acesso ao TeraBox foi realizado por meio do fluxo de login com Google.
2. A pasta `Nova-Memory` foi criada no TeraBox.
3. O envio de `NOVA_MEMORY_INDEX.md` foi bloqueado pelo fluxo de seleção/upload usado.
4. **Não foi confirmado** que o arquivo chegou ao TeraBox nem que pode ser baixado de volta.
5. O perfil de automação disponível ainda não registra uma sessão autenticada no domínio TeraBox; não presumir que a sessão anterior continua disponível.

## Próximo fluxo seguro

1. Reabrir o TeraBox por uma sessão de navegador autenticada explicitamente pelo usuário.
2. Tentar enviar `NOVA_MEMORY_INDEX.md` para `Nova-Memory` sem substituir arquivos existentes.
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
