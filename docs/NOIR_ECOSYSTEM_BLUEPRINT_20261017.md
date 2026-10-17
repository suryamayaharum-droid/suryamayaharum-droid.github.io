# HARUM NOIR METHOD × GALERIA VIVA — BLUEPRINT 2026-10-17

## Identidade e arquitetura
O ecossistema público preserva três portas: Studio 23 (/), a Galeria Viva (/galeria-viva/) e o Harum Noir Method (/metodo/). O mapa curatorial permanece em /explorar/. A escola Astro mantém seu endereço /astro-blog-starter-template/ e o Programa Regular de 33 aulas, 24 semanas e 96h.

## Entregue
- /metodo/: 33 laboratórios originais organizados em 6 eixos (Olhar, Estrutura, Gesto, Acaso, Metamorfose, Presença), com busca, filtro, sorteio, modal instrucional e cronômetro.
- /galeria-viva/: 171 entradas exclusivas indexadas a partir de páginas já existentes; 100 Figura, 27 Biblioteca, 31 Noivas, 4 Studio 23 e 9 Atlas. Carregamento em blocos de 15, filtros por sala, pesquisa, lightbox acessível a teclado/toque, modo museu horizontal opcional e mosaico.
- /index.html e /explorar/: novas entradas editoriais sem excluir conteúdos preexistentes.
- /assets/ecossistema-links.js: menu global com acesso ao Museu e ao Método, com suporte a layouts legados.
- Páginas Noivas da Edição Especial recebem navegação global; as demais rotas principais utilizam o menu existente.
- Astro: cabeçalho compartilhado, home e Programa Regular interligados ao método e à galeria.
- /sitemap.xml: novas rotas indexadas.
- Espelho dos novos arquivos em arte-harum-tattoo-site/dist; adaptador do gerador build_v10.py preserva a entrada da home e as URLs em builds seguintes.

## Regras curatoriais
1. Estudos conceituais e imagens editoriais não são fotografias de tatuagens executadas.
2. Interpretações autorais de Noivas não são obras originais dos artistas históricos citados.
3. Priorizar imagens individuais antes de cartazes coletivos.
4. Não publicar obras de museu como domínio público por inferência baseada apenas no nome do artista. Respeitar metadados de direito da própria obra.
5. API Art Institute of Chicago: mostrar somente registros `is_public_domain === true` com `image_id`, preservando crédito/link. Em falha de consulta mostrar links institucionais, não imagens sem licença.
6. André Masson/MoMA é referência histórica para automatismo, não fonte automaticamente licenciada para reprodução.
7. Preservar as URLs legadas e não duplicar arquivos de imagem.

## Tecnologia
GitHub Pages estático, CSS/JS nativos, IntersectionObserver, HTML dialog, busca sem servidor, CSS responsive e prefers-reduced-motion. Sem bibliotecas externas de animação, sem GitHub Actions adicionais, sem analytics ou tracker novo.
Arquivos principais:
- assets/museu-noir.css
- assets/harum-method.js
- assets/galeria-viva.js
- assets/ecossistema-links.js

## Validação concluída
- Commit de publicação em main confirmado pelo GitHub.
- URLs públicas /, /metodo/ e /galeria-viva/ servidas com metadados corretos.
- Browser QA concluído: links da home, 33 cards, filtro Gesto, abertura/fechamento do laboratório, filtro Noivas, imagens e lightbox, sem erros visíveis nas páginas testadas.
- JavaScript dos scripts principais passou na verificação sintática.
- Imagens de capa verificadas no repositório GitHub.
- Modo museu adicional introduzido após o QA inicial: sintaxe checada, requer validação visual adicional em múltiplas resoluções.
- Compilação Astro e reconstrução integral do gerador privado não executadas neste ciclo; os arquivos alterados continuam disponíveis no GitHub.

## Segunda etapa recomendada
1. Auditoria automatizada de links e mídia de TODAS as páginas e volumes, inclusive conteúdo pouco visitado.
2. Aumentar dados editoriais por obra: título, autor de referência, técnica, ano, coleção, origem e status de licença.
3. Tornar o catálogo da Galeria Viva gerado automaticamente a partir de manifestos, com deduplicação por hash e sem inflar a DOM.
4. Melhorar acessibilidade do modo museu com navegação explícita por setas/teclado e testes mobile completos.
5. Transformar mais acervos em salas curatoriais sem perder os originais.
6. Adotar checkpoints regulares de build e rollback entre repositório-fonte privado e repositório público.

## Pontos de acesso
- https://suryamayaharum-droid.github.io/
- https://suryamayaharum-droid.github.io/galeria-viva/
- https://suryamayaharum-droid.github.io/metodo/
- https://suryamayaharum-droid.github.io/explorar/
- https://suryamayaharum-droid.github.io/astro-blog-starter-template/
