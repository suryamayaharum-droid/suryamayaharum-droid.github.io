# TeraBox × GitHub — ponte do ecossistema Arte Harum

Status: **ESPELHAMENTO PRIVADO COMO OBJETIVO; upload e leitura de retorno ainda não verificados**  
Data: 2026-10-20

## Objetivo e regra de distribuição

O objetivo da Nova é **espelhar a memória selecionada em uma pasta privada do TeraBox, sem distribuir seu conteúdo publicamente**. GitHub Pages continua público apenas para o ecossistema artístico; não deve servir de distribuição da memória privada da Nova. Não inserir conteúdo privado no catálogo público nem publicar links de compartilhamento. O espelho privado exige sessão autenticada e validação de retorno. Não mover, apagar ou substituir os acervos atuais nesta etapa.

## Estado operacional mais recente

- A pasta `Nova-Memory` foi criada no TeraBox durante uma sessão de login com Google.
- O envio de `NOVA_MEMORY_INDEX.md` foi bloqueado no fluxo de upload usado.
- A presença do arquivo no TeraBox e o teste de download/leitura de retorno **não foram confirmados**.
- O perfil de automação disponível não registra login no domínio TeraBox; uma sessão anterior não deve ser presumida ativa.
- O checkpoint de retomada está em [`docs/nova-memory-terabox-checkpoint.md`](nova-memory-terabox-checkpoint.md).

## O que foi preparado no GitHub

- Este documento registra a arquitetura e os limites de segurança.
- O arquivo `data/terabox-catalog.json` existe como catálogo inicial vazio. Nenhum link fictício foi publicado.
- **Não integrar a memória privada ao mapa público**. O catálogo permanece vazio e não deve receber links de memória.
- O fluxo inicial não exige GitHub Actions nem um servidor permanente: catálogo estático e importação manual/seletiva.

## Limites importantes

- GitHub Pages é estático: não pode guardar segredos nem executar com segurança chamadas privadas autenticadas ao TeraBox.
- Não inserir cookies de sessão, senhas de conta, access tokens, client secrets ou links privados no repositório.
- Links compartilhados podem expirar, exigir código de extração ou não permitir incorporação direta em páginas.
- A Open Platform oficial do TeraBox documenta um fluxo OAuth e exige credenciais de aplicação concedidas previamente. A elegibilidade e os endpoints de arquivos precisam ser confirmados na documentação disponível para a conta.
- O site `teraabox.com/developers` também documenta uma API de gestão de links/domínios/espaços; não assumir que ela é a mesma API de armazenamento de arquivos.
- Bibliotecas comunitárias podem depender de endpoints web não oficiais ou cookies de sessão. Não as tratar como APIs oficiais nem copiar cookies para código público.

## Arquitetura por etapas

1. **Espelho privado** — autenticar no TeraBox e enviar os arquivos de memória selecionados para `Nova-Memory`; não publicar links.
2. **Verificação** — conferir nome, tamanho e data; baixar cópia para uma pasta separada e comparar com a origem.
3. **Proteção contra distribuição** — manter `data/terabox-catalog.json` vazio; não inserir memória ou links privados em páginas públicas.
4. **Automação futura opcional** — considerar API oficial somente se houver acesso aprovado e um ambiente privado para segredos. Não usar credenciais em HTML/JavaScript público.
5. **Retomada** — registrar cada passo e não marcar como concluído antes de confirmar o download e a comparação.

## Estrutura do catálogo

O arquivo `data/terabox-catalog.json` usa este formato, atualmente sem itens:

```json
{
  "version": 1,
  "items": []
}
```

Cada item aprovado poderá ter `id`, `title`, `category`, `description`, `shareUrl`, `visibility` e `approvedForPublication`. Não adicionar itens até haver link real e aprovação de publicação.

## Próxima ação necessária

Abrir uma sessão TeraBox autenticada pelo usuário, enviar os arquivos selecionados para `Nova-Memory` como pasta privada, confirmar a presença e baixar uma cópia de teste para comparar com a origem. Não é necessário fornecer link público de compartilhamento. Não enviar senha, cookies ou tokens no chat.

## Referências oficiais

- TeraBox Open Platform: https://www.terabox.com/integrations/docs?lang=en
- TeraBox Developers — API de gestão de links: https://teraabox.com/developers/links
- TeraBox Developers: https://teraabox.com/developers
