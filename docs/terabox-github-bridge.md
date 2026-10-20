# TeraBox × GitHub — ponte do ecossistema Arte Harum

Status: **BASE TÉCNICA CRIADA; arquivo de memória ainda não validado no TeraBox**  
Data: 2026-10-20

## Objetivo

Manter o GitHub Pages como núcleo público do ecossistema Arte Harum / Studio 23 / HARUM NOIR e usar o TeraBox como acervo de origem quando apropriado. Não mover, apagar ou substituir os acervos atuais nesta etapa.

## Estado operacional mais recente

- A pasta `Nova-Memory` foi criada no TeraBox durante uma sessão de login com Google.
- O envio de `NOVA_MEMORY_INDEX.md` foi bloqueado no fluxo de upload usado.
- A presença do arquivo no TeraBox e o teste de download/leitura de retorno **não foram confirmados**.
- O perfil de automação disponível não registra login no domínio TeraBox; uma sessão anterior não deve ser presumida ativa.
- O checkpoint de retomada está em [`docs/nova-memory-terabox-checkpoint.md`](nova-memory-terabox-checkpoint.md).

## O que foi preparado no GitHub

- Este documento registra a arquitetura e os limites de segurança.
- O arquivo `data/terabox-catalog.json` existe como catálogo inicial vazio. Nenhum link fictício foi publicado.
- A integração deve ser ligada ao mapa central do ecossistema somente depois de validar links reais e sua visibilidade.
- O fluxo inicial não exige GitHub Actions nem um servidor permanente: catálogo estático e importação manual/seletiva.

## Limites importantes

- GitHub Pages é estático: não pode guardar segredos nem executar com segurança chamadas privadas autenticadas ao TeraBox.
- Não inserir cookies de sessão, senhas de conta, access tokens, client secrets ou links privados no repositório.
- Links compartilhados podem expirar, exigir código de extração ou não permitir incorporação direta em páginas.
- A Open Platform oficial do TeraBox documenta um fluxo OAuth e exige credenciais de aplicação concedidas previamente. A elegibilidade e os endpoints de arquivos precisam ser confirmados na documentação disponível para a conta.
- O site `teraabox.com/developers` também documenta uma API de gestão de links/domínios/espaços; não assumir que ela é a mesma API de armazenamento de arquivos.
- Bibliotecas comunitárias podem depender de endpoints web não oficiais ou cookies de sessão. Não as tratar como APIs oficiais nem copiar cookies para código público.

## Arquitetura por etapas

1. **Catálogo público (agora preparado)** — incluir apenas links de compartilhamento fornecidos e explicitamente aprovados pela pessoa proprietária. O JSON guarda metadados e links deliberadamente públicos.
2. **Teste de link real** — testar um compartilhamento não sensível, verificar se abre sem autenticação e se pode ser usado como link externo. Não assumir que link de página é um URL direto de mídia.
3. **Importação seletiva** — baixar manualmente arquivos autorizados e versionar no GitHub apenas materiais adequados ao repositório; para arquivos grandes, manter o TeraBox como origem e usar link externo.
4. **API oficial** — se houver acesso aprovado à Open Platform, desenhar OAuth e operações de listagem/download num ambiente seguro. Segredos nunca ficam em HTML/JavaScript público.
5. **Validação** — verificar links, tamanho, licença/proveniência das imagens e se cada item deve ser público ou privado antes de publicar.

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

Retomar o upload de `NOVA_MEMORY_INDEX.md` para `Nova-Memory` usando uma sessão TeraBox autenticada explicitamente, sem substituir arquivos existentes; confirmar a presença e baixar uma cópia de teste para comparar com a origem. Para validar o catálogo público em paralelo, fornecer um link de compartilhamento de um arquivo/pasta **não sensível** e aprovado para publicação. Não enviar senha da conta, cookies ou tokens nesta conversa.

## Referências oficiais

- TeraBox Open Platform: https://www.terabox.com/integrations/docs?lang=en
- TeraBox Developers — API de gestão de links: https://teraabox.com/developers/links
- TeraBox Developers: https://teraabox.com/developers
