# Studio 23 × Arte Harum — ecossistema público

Superfície pública para Studio 23 / Arte Harum. As coleções visuais e páginas editoriais estão interligadas.

## Portas de entrada
- [Home Studio 23](https://suryamayaharum-droid.github.io/)
- [Explorar tudo — mapa central](https://suryamayaharum-droid.github.io/explorar/)
- [Noivas — projeto de retratos](https://suryamayaharum-droid.github.io/noivas/)
- [Noivas — catálogo de nove volumes](https://suryamayaharum-droid.github.io/noivas/catalogo-completo.html)
- [Noivas — Volume VIII](https://suryamayaharum-droid.github.io/noivas/inspiracoes-8.html)
- [Noivas — caderno de estudos](https://suryamayaharum-droid.github.io/noivas/estudos-composicao.html)
- [Harum Noir](https://suryamayaharum-droid.github.io/harum-noir/)
- [Modelo vivo](https://suryamayaharum-droid.github.io/harum-noir/modelo-vivo/)
- [Estudos recentes](https://suryamayaharum-droid.github.io/harum-noir/modelo-vivo/recentes/)
- [Biblioteca](https://suryamayaharum-droid.github.io/biblioteca/)
- [Portfólio Studio 23](https://suryamayaharum-droid.github.io/portfolio/)
- [Escola Harum Noir](https://suryamayaharum-droid.github.io/astro-blog-starter-template/)
- [Atlas de referências](https://suryamayaharum-droid.github.io/astro-blog-starter-template/referencias/)

## Continuidade editorial
- Preservar as URLs antigas, incluindo `/noivas/inspiracoes.html` até `/noivas/inspiracoes-8.html`.
- `/explorar/` é o índice central. Atualizar sua navegação quando surgirem novas páginas; não criar coleções isoladas.
- `assets/ecossistema-links.js` adiciona o retorno à home e ao mapa nas páginas que carregam o script geral.
- `assets/ecossistema-page.css` e o menu HTML direto garantem caminhos sem JavaScript nas páginas independentes de Noivas.
- Não remover os acervos de Noivas e seus arquivos de imagem ao sincronizar o gerador privado.
- As imagens de estudo e personagens imaginadas não equivalem a tatuagens executadas.

Atualizado em 2026-10-15.

## Lume: guia local e IA quantizada opcional

A Lume mantém MiniSearch 7.2.0, contexto de navegação e descoberta progressiva
do sitemap sem baixar modelo. A pesquisa leve entrega trechos de fontes online sem instalar modelo.
O modo opcional **Qwen3 0.6B quantizado** gera
respostas no aparelho e pode pesquisar na Wikipedia, no Wikidata e no Art Institute of
Chicago, exibindo fontes. Exige ativação explícita e download inicial de
aproximadamente 650 MB. Não exige backend próprio de IA nem chave de API.
Ver [guia básico](docs/lume-native.md) e [IA quantizada, pesquisa e validação](docs/lume-quantized.md).
Preservar `assets/lume-*.mjs`, `assets/lume-native.css`, `assets/vendor/`, as
integrações em `assets/site.js` e `assets/ecossistema-links.js` nas sincronizações.

- [Noivas — Volume IX, 32 obras vetoriais](https://suryamayaharum-droid.github.io/noivas/inspiracoes-9.html) — Matéria & Metamorfose; obras 01–32 em /assets/noivas/catalogo-vol9/.

## Edição Especial Noivas · 2026-10-16
- [Edição Especial: 29 obras individuais](https://suryamayaharum-droid.github.io/noivas/edicao-especial/): 12 Modigliani, 12 Picasso, 5 Van Gogh. Os sete cartazes apresentam quatro obras individualizadas, e a quinta Van Gogh aparece solo.
- [Três cadernos de estudos separados](https://suryamayaharum-droid.github.io/noivas/edicao-especial/estudos.html).
- [Manifesto da edição](https://suryamayaharum-droid.github.io/noivas/edicao-especial/manifest.json) com 29 WebP individuais, 7 cartazes com quatro e um cartaz solo. Não apresentar como pinturas autênticas dos artistas citados.
- Preservar os arquivos da pasta `/assets/noivas/edicao-especial/` e as duas páginas da edição em futuras publicações.

## HARUM NOIR METHOD × Galeria Viva · 2026-10-17
- [Método — 33 práticas de desenho](https://suryamayaharum-droid.github.io/metodo/): 6 movimentos, estudo acadêmico, gesto, automatismo, anatomia botânica e presença; busca, filtros, cronômetro e diálogos de exercícios.
- [Galeria Viva — 171 entradas indexadas](https://suryamayaharum-droid.github.io/galeria-viva/): acervo existente (Figura 100, Biblioteca 27, Noivas 31, Studio 23 4, Atlas 9), sem duplicação de arquivos. Carregamento em blocos de 15, filtros, leitor ampliado com teclado e toque.
- Programa Regular pré-existente da Escola Astro: `/astro-blog-starter-template/escola/programa-regular/`. As 33 práticas novas complementam as 33 aulas anteriores; não substituir nem apagar.
- Código sem dependências externas de UI: `assets/museu-noir.css`, `assets/harum-method.js`, `assets/galeria-viva.js`. Uso de recursos nativos do navegador reduz custo e falhas no GitHub Pages.
- Museu de domínio público: referências carregadas por consulta ao Art Institute of Chicago API, filtradas por `is_public_domain === true` e `image_id`. Crédito e link à obra original; não assumir domínio público de artistas contemporâneos.
- **PRESERVAÇÃO:** antes de qualquer sincronização do gerador privado para este repositório, manter `metodo/`, `galeria-viva/`, os três assets acima, links na `index.html`, `explorar/index.html`, `assets/ecossistema-links.js` e URLs no `sitemap.xml`. A migração não deve executar exclusão desses caminhos.
- [Ponte TeraBox × GitHub](docs/terabox-github-bridge.md) — arquitetura segura e limites de integração.
- [Catálogo TeraBox (JSON)](data/terabox-catalog.json) — estrutura inicial vazia; adicionar apenas links reais aprovados.
- Publicação GitHub: a gravação em `main` foi concluída. Propagação de GitHub Pages deve ser checada separadamente; não equivale a teste visual de navegadores.
