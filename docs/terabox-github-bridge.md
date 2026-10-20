# TeraBox × GitHub — ponte do ecossistema Arte Harum

Status: **PLANEJADO / aguardando link de compartilhamento ou credenciais oficiais**  
Data: 2026-10-20

## Objetivo

Manter o GitHub Pages como núcleo público do ecossistema Arte Harum / Studio 23 / HARUM NOIR e usar o TeraBox como acervo de origem quando apropriado. Não mover, apagar ou substituir os acervos atuais nesta etapa.

## O que está pronto

- Este documento registra a arquitetura e os limites de segurança.
- O catálogo público pode listar links de compartilhamento fornecidos pelo titular, com título, categoria, descrição e URL.
- O fluxo pode ser iniciado sem GitHub Actions e sem um servidor permanente, usando importação manual/seletiva.

## Limites importantes

- GitHub Pages é estático: não pode guardar segredos nem executar com segurança chamadas privadas autenticadas ao TeraBox.
- Não inserir cookies de sessão, senhas de conta, access tokens, client secrets ou links privados no repositório.
- Links compartilhados podem expirar, exigir código de extração ou não permitir incorporação direta em páginas.
- A documentação oficial do TeraBox descreve uma Open Platform/API com autenticação; para sincronização automática autenticada será necessário configurar o acesso oficial e um ambiente seguro que mantenha os segredos fora do site público.
- Não usar APIs não oficiais que exijam copiar cookies de sessão para um site público.

## Arquitetura por etapas

1. **Catálogo de links** — opção inicial: a pessoa proprietária fornece links de compartilhamento de arquivos/pastas que deseja expor. O GitHub guarda apenas metadados e links deliberadamente públicos.
2. **Importação seletiva** — baixar manualmente os arquivos autorizados e versionar no GitHub apenas materiais adequados ao repositório; para arquivos grandes, manter o TeraBox como origem e usar link externo.
3. **API oficial** — se a conta tiver acesso à Open Platform, implementar OAuth e operações de listagem/download em ambiente seguro. Segredos nunca ficam em HTML/JavaScript público.
4. **Validação** — verificar links, tamanho, licença/proveniência das imagens e se cada item deve ser público ou privado antes de publicar.

## Formato sugerido do catálogo

Criar `data/terabox-catalog.json` somente quando houver links reais fornecidos e aprovados. Exemplo de estrutura sem links reais:

```json
{
  "version": 1,
  "items": [
    {
      "id": "exemplo-001",
      "title": "Título do acervo",
      "category": "referencias",
      "description": "Descrição curta",
      "shareUrl": "SUBSTITUIR_POR_LINK_PUBLICO",
      "visibility": "public",
      "approvedForPublication": false
    }
  ]
}
```

Não publicar itens enquanto `approvedForPublication` for `false`. Nunca usar placeholders como links funcionais.

## Próxima ação necessária

Enviar um link de compartilhamento do TeraBox para um arquivo ou pasta de teste **não sensível**, preferencialmente sem código de extração. Com isso, validar se abre e se pode ser usado como link externo. Não enviar senha da conta, cookies ou tokens nesta conversa.

## Referências

- TeraBox Developers: https://teraabox.com/developers
- TeraBox Open Platform docs: https://www.terabox.com/integrations/docs?lang=en
- TeraBox — como compartilhar arquivos: https://blog.terabox.com/how-to-share-files-with-terabox/