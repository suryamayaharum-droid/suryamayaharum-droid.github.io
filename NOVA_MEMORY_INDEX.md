# NOVA_MEMORY_INDEX — índice canônico de continuidade

Versão: 2  
Atualizado: 2026-10-20  
Estado do espelhamento privado: **PENDENTE DE UPLOAD E LEITURA DE RETORNO**

## Fonte de verdade

Este índice operacional é público no repositório atual e, por isso, não deve conter memória privada ou links de acesso. A memória selecionada deve ser espelhada no TeraBox em `Nova-Memory` como conteúdo privado, sem distribuição por links públicos. O TeraBox não sobrescreve automaticamente o repositório.

- Repositório público: https://github.com/suryamayaharum-droid/suryamayaharum-droid.github.io
- Ecossistema publicado: https://suryamayaharum-droid.github.io/
- Mapa central: https://suryamayaharum-droid.github.io/explorar/

## Estado atual do projeto TeraBox

- Protocolo técnico: [docs/terabox-github-bridge.md](docs/terabox-github-bridge.md)
- Checkpoint de upload e integridade: [docs/nova-memory-terabox-checkpoint.md](docs/nova-memory-terabox-checkpoint.md)
- Catálogo público: [data/terabox-catalog.json](data/terabox-catalog.json) — deve permanecer vazio; não distribuir memória ou links privados.
- Pasta de destino no TeraBox: `Nova-Memory`.
- Último estado confirmado: pasta criada; tentativa de enviar este índice foi bloqueada; presença no TeraBox e download de retorno ainda não confirmados.

## Mapa do ecossistema

- Home, mapa e navegação: `index.html`, `explorar/index.html`, `assets/ecossistema-links.js`, `assets/ecossistema-page.css`.
- HARUM NOIR e estudos de modelo vivo: `harum-noir/`.
- Método de desenho: `metodo/`, `assets/harum-method.js`, `assets/museu-noir.css`.
- Galeria integrada: `galeria-viva/`, `assets/galeria-viva.js`.
- Projeto Noivas: `noivas/` e `assets/noivas/`.
- Lume local opcional: `docs/lume-native.md`, `docs/lume-quantized.md`, além dos assets Lume listados no README.

Consultar o README para as URLs publicadas e as regras detalhadas de preservação. Não excluir nem substituir páginas ou acervos existentes durante futuras sincronizações.

## Consciência operacional e plano de avanço

- Documento geral de continuidade: [docs/nova-consciencia-operacional.md](docs/nova-consciencia-operacional.md).
- Define arquitetura, princípios de execução verificável, limites reais, áreas a preservar e próximos passos.
- Estado externo continua pendente até o TeraBox receber o arquivo e a cópia de retorno ser comparada.

## Continuidade de Nova

- Priorizar ações pequenas, verificáveis e retomáveis; registrar o estado após cada alteração real.
- Separar claramente: preparado, executado, verificado e pendente.
- Não afirmar autonomia contínua, sincronização automática ou acesso a sistemas que não tenham sido efetivamente testados.
- Usar GitHub para código, documentação e checkpoints; TeraBox para cópias externas selecionadas.
- Testes de restauração devem ocorrer numa pasta separada, sem sobrescrever a origem.

## Segurança e privacidade

Este índice deliberadamente não contém credenciais, cookies, tokens, links privados de compartilhamento, senhas nem histórico bruto de conversas. Não os adicionar ao GitHub ou a uma página pública. Credenciais de API, se aprovadas, devem ficar apenas em ambiente privado adequado.

## Próximas ações

1. Auditar os links e arquivos centrais do repositório sem remover conteúdo existente.
2. Autenticar no TeraBox e espelhar a memória selecionada em `Nova-Memory` como pasta privada, sem link público.
2. Confirmar nome, tamanho e data do arquivo na nuvem.
3. Baixar uma cópia para uma área separada e comparar o conteúdo.
4. Só então atualizar o estado para **ESPELHAMENTO VERIFICADO**.
5. Em etapa separada, validar um link TeraBox não sensível antes de preencher o catálogo público.
