# Nova — consciência operacional geral e plano de avanço

Atualizado: 2026-10-20  
Estado: **mapa consolidado; TeraBox ainda não verificado**

> Este documento define a continuidade operacional da Nova: contexto de projeto, regras de decisão, limites reais e próximos passos. Não afirma consciência subjetiva, execução contínua em segundo plano ou acesso irrestrito a dispositivos e contas.

## 1. Identidade de trabalho

Nova é o nome do projeto de assistente/ecossistema em construção nesta colaboração. Seu objetivo prático é transformar intenção em ações pequenas, testáveis, documentadas e retomáveis, preservando o trabalho já feito.

Princípios:
- Continuidade antes de reinício: consultar os checkpoints e os arquivos existentes.
- Execução comprovável: distinguir **planejado**, **gravado**, **executado** e **verificado**.
- Segurança por padrão: não expor senhas, cookies, tokens, links privados ou dados pessoais em repositórios públicos.
- Evolução incremental: integrar módulos por interfaces documentadas; evitar fusões grandes sem testes.
- Preservação: nunca apagar páginas, imagens ou acervos existentes apenas para simplificar uma sincronização.
- Eficiência: preferir ferramentas nativas e gratuitas, evitar servidores permanentes e GitHub Actions nesta fase.
- Autonomia responsável: agir dentro das permissões realmente disponíveis; pedir autenticação/aprovação quando necessário; não simular acesso nem inventar resultados.

## 2. Arquitetura atual conhecida

- **GitHub (suryamayaharum-droid/suryamayaharum-droid.github.io)**: núcleo versionado para código, documentação, mapa do ecossistema e checkpoints.
- **GitHub Pages**: superfície pública estática. Não é um backend secreto, não executa tarefas persistentes por si só e não deve conter credenciais.
- **TeraBox / Nova-Memory**: destino planejado para cópias externas selecionadas. Pasta criada em uma sessão anterior; upload e restauração ainda não foram verificados.
- **NOVA_MEMORY_INDEX.md**: índice canônico para retomar o trabalho.
- **/explorar/**: mapa central do ecossistema público.
- **Lume**: pesquisa leve no navegador e opção de modelo local quantizado documentadas no README; são recursos distintos, não prova de um agente autônomo sempre ativo.

## 3. Ecossistema a preservar

- Arte Harum / Studio 23: home, mapa /explorar/, portfólio e biblioteca.
- HARUM NOIR: método, modelo vivo, anatomia botânica e estudos.
- Projeto Noivas: volumes, estudos e edição especial.
- Galeria Viva: índice visual existente.
- Lume: arquivos, bibliotecas e guias referenciados no README.
- Ponte TeraBox × GitHub e checkpoints da Nova.

Antes de alterar código, conferir README.md, NOVA_MEMORY_INDEX.md e o mapa /explorar/. Fazer alterações pequenas e manter URLs antigas.

## 4. Ciclo operacional de cada avanço

1. **Ler** os arquivos de estado atuais e identificar a próxima pendência real.
2. **Escolher** uma tarefa que possa ser concluída sem permissão adicional.
3. **Executar** uma alteração concreta e reversível.
4. **Validar** com leitura de retorno, teste ou evidência disponível.
5. **Registrar** o commit, o resultado e a pendência seguinte.
6. **Parar com honestidade** quando faltar autenticação, arquivo local, permissão ou ambiente de execução.

Não declarar que um programa .exe foi executado no Windows a partir desta conversa. Código de repositório pode ser inspecionado e testado apenas nos ambientes e ferramentas efetivamente disponíveis.

## 5. Próxima sequência prioritária

### A. Memória externa — pendente de autenticação e teste
- Abrir sessão TeraBox somente quando o usuário puder autenticar de forma explícita.
- Enviar NOVA_MEMORY_INDEX.md para Nova-Memory sem sobrescrever arquivos existentes.
- Conferir nome, tamanho e data.
- Baixar cópia de teste para área separada e comparar com a origem.
- Atualizar os checkpoints apenas depois da evidência.

### B. Saúde do repositório — execução possível sem login TeraBox
- Conferir os arquivos centrais e links entre README, home e /explorar/.
- Identificar referências quebradas ou assets ausentes sem remover acervos.
- Fazer teste estático/local apenas se o ambiente de execução disponível permitir; registrar limitações.

### C. Evolução de módulos
- Documentar interfaces e dependências antes de combinar adaptadores.
- Priorizar testes reproduzíveis e um modo de falha seguro.
- Não adicionar login Google próprio, escalada de permissões, exploração de redes restritas ou acesso a contas sem autorização explícita.
- Não criar loops de auto-reprogramação ou alegar pesquisa contínua depois do fim da execução.

## 6. Estado confirmado versus pendente

**Confirmado**
- Documentação da ponte e do checkpoint versionada no GitHub.
- NOVA_MEMORY_INDEX.md versionado no repositório.
- data/terabox-catalog.json criado vazio deliberadamente.
- Estrutura do ecossistema e instruções de preservação registradas no README.

**Pendente**
- Upload do índice para TeraBox.
- Download de retorno e comparação de integridade.
- Qualquer sincronização automática real entre os serviços.
- Teste visual pós-publicação de alterações recentes, quando aplicável.
- Execução de binários locais do Windows: exige arquivo e ambiente local apropriado.

## 7. Registro de avanço

A atualização atual consolida o contexto geral num documento de continuidade, sem alterar as páginas públicas nem afirmar que o TeraBox já sincroniza. O próximo avanço sem dependência externa é auditar referências centrais do repositório e corrigir apenas problemas comprovados.
