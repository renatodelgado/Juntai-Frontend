# Cypress na plataforma atual do Juntaí!

Atualizado em 06/10/2026. O cenário principal agora é
`cypress/e2e/fluxo-plataforma.cy.ts`, com um único `it` e comentários por bloco.
O cenário `interesse-startup.cy.ts` e os resultados de 03/10/2026 são históricos
e não representam a integração atual com o backend.

## Preparação

1. Inicie o backend com o banco e o serviço de uploads já configurados.
2. Confira `VITE_API_URL` em `.env.local`. Neste projeto está em
   `http://localhost:3336`. O teste usa a mesma API do frontend.
3. Copie `cypress.env.example.json` para `cypress.env.json` e informe contas
   existentes de administrador e investidor aprovado. Não versionar esse arquivo.
4. Execute `npm run cypress:demo`. No PowerShell, use `npm.cmd` se necessário.
   Para acompanhar os comandos no navegador, execute `npm run cypress:demo:open`.

As chaves são `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `INVESTOR_EMAIL` e
`INVESTOR_PASSWORD`. Também podem vir das variáveis `CYPRESS_ADMIN_EMAIL`,
`CYPRESS_ADMIN_PASSWORD`, `CYPRESS_INVESTOR_EMAIL` e `CYPRESS_INVESTOR_PASSWORD`.
O runner verifica contas e aprovação antes de criar dados. Ele inicia o Vite na
porta 5175 e o encerra ao terminar. Não inicia nem modifica o backend.

O formulário consulta o IBGE para selecionar Fortaleza. O upload do PDF exige o
armazenamento remoto configurado no backend. O teste não substitui essas respostas
por mocks. A indisponibilidade de qualquer dependência pode reprovar o cenário.

Na validação local de 06/10, o contêiner na porta 3333 não tinha a rota de upload
usada pelo frontend atual e respondeu 404. O backend do código atual foi iniciado
na porta 3336, usando o banco existente e `NODE_ENV=production` para desativar a
sincronização automática do esquema. Nenhuma migração foi executada.

## O único cenário

1. Tenta avançar sem responsável e nome e verifica os erros obrigatórios reais.
2. Cadastra pela interface uma startup fictícia Fintech, MVP e B2B.
3. Preenche localização, clientes, faturamento mensal, equipe e investimento.
4. Rejeita um arquivo TXT na interface, anexa um PDF válido e verifica seu upload.
5. Faz login com a nova startup e consulta o perfil persistido pela API.
6. Cria uma segunda startup pela API pública apenas para preparar o ramo de rejeição.
7. Faz login como investidor e confirma que as pendentes não aparecem na busca
   nem na resposta da listagem real de startups.
8. Faz login como administrador, aprova a primeira e rejeita a segunda pela interface.
9. Faz login com a rejeitada e verifica o estado atual da tela e do backend.
   Confirma o motivo no histórico administrativo.
10. Filtra Fintech e B2B. Compara todos os IDs exibidos com o conjunto esperado
    calculado da resposta real da API, incluindo registros preexistentes no banco.
11. Busca a startup criada, salva localmente e abre o perfil com seu PDF anexado.
12. Verifica contato oculto e reunião desabilitada antes do interesse, inclusive
    tentando a URL direta de mensagens e conferindo ausência do compositor.
13. Confirma interesse pela interface e verifica a resposta real do backend.
14. Abre o chat pela ação disponível e confere o destinatário e o campo de mensagem.
15. Recarrega, abre Matches e confirma persistência também na API de interesses.

## Regras que o teste respeita hoje

| Proposta da apresentação          | Comportamento atual utilizado no teste                                                                              |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Moderador                         | Perfil `admin`, chamado Administrador na plataforma                                                                 |
| Faturamento anual obrigatório     | Faturamento **mensal**, opcional. A equipe é obrigatória                                                            |
| Pitch deck obrigatório            | Apresentação opcional. O cenário exige seu upload para demonstrá-lo                                                 |
| Status “Rejeitado” na tela        | “Precisa de ajustes” e “Precisamos de alguns ajustes”. API: `rejeitado`                                             |
| Motivo da rejeição para a startup | A área da startup informa que as observações ainda não estão disponíveis. O motivo fica no histórico administrativo |
| Entrar em contato após interesse  | “Iniciar conversa” no modal confirmado. Abertura do chat sem envio de mensagem                                      |
| Filtro Fintech e B2B              | Compara o conjunto inteiro de IDs exibidos com a resposta real da API                                               |

O bloqueio de contato é verificado na interface e na rota de mensagens. Isso não
substitui um teste separado da autorização de envio no backend. O cenário abre o
chat, mas não envia mensagem nem comprova criação de uma conversa persistida.
A compatibilidade percentual na descoberta continua ilustrativa e aleatória.
O teste não usa esse percentual como prova de matchmaking real.

A consulta à estrutura do banco atual confirmou `faturamento_mensal` opcional e
`capital_procurado` obrigatório. O cadastro auxiliar informa capital para respeitar
essa restrição existente, mesmo que a entidade do backend o marque como opcional.

A busca atualiza a URL a cada tecla. Uma rodada com digitação contínua perdeu
caracteres durante essas navegações. O teste aguarda o parâmetro `q` e o valor do
campo após cada caractere, sem pausas fixas. Uma aprovação do cenário não comprova
o comportamento da busca com digitação rápida. Os filtros também aguardam a URL e os controles estabilizarem antes da próxima seleção; a rodada não valida seleções rápidas sobrepostas.

## Dados e evidências

Cada rodada completa cria duas contas fictícias com nomes e e-mails exclusivos:
uma startup aprovada e uma rejeitada. Rodadas interrompidas podem parar antes disso. Somente esses cadastros recebem decisões.
O teste não aprova, rejeita ou altera perfis preexistentes e não limpa o banco.
Como não há exclusão nesse fluxo, as contas e o PDF permanecem no ambiente usado.
Não há repetição automática do teste (`retries: 0`).

Capturas, vídeo e `resultado.json` ficam em uma pasta nova por rodada dentro de
`cypress/artifacts/plataforma-real/`. Após aprovação do teste, o manifesto
`dados-criados.json` identifica somente seus registros próprios, sem credenciais.
Capturas usam o viewport para facilitar sua leitura durante a apresentação.

`npm run cypress:demo:failure` executa uma cópia temporária do mesmo cenário e
troca a expectativa final “Seus matches” por uma incorreta. Essa rodada também
cria duas contas reais. A falha demonstra erro no teste, não defeito do produto.
Uma execução correta posterior usa novos registros e uma nova pasta de evidências.

## Resultado real de 06/10/2026

**1 teste aprovado, 0 falhas**, Cypress 16.1.1, Electron, duração de **6 min 36 s**.
A rodada usa a API local 3336 e o banco existente. Foram geradas 10 capturas.
Pasta: `cypress/artifacts/plataforma-real/2026-10-06T19-44-29-406Z`.

O chat foi aberto e o interesse persistiu após recarregar. Nenhuma mensagem foi enviada.
Esse resultado descreve uma execução, não uma taxa de estabilidade ou cobertura total.
As rodadas de diagnóstico anteriores deixaram cadastros fictícios no banco.

A gravação bruta e a captura 09 mostram uma credencial numa prévia de conversa
preexistente. Não projetar nem compartilhar esses arquivos. O pacote para apresentação
inclui as capturas 01 a 08 e 10, excluindo a imagem do chat e o vídeo bruto.

## Roteiro para sete slides

| Slide | Conteúdo | Versão 10 min | Versão 15 min |
| --- | --- | --- | --- |
| 1 | Objetivo e resultado real | 1 min | 1 min |
| 2 | Startup → administrador → investidor | 1 min | 2 min |
| 3 | Contas, API, banco e upload reais | 1 min | 2 min |
| 4 | Blocos comentados e observação das requisições | 1,5 min | 2 min |
| 5 | Capturas: cadastro, aprovação, filtros e interesse | 3,5 min | 4 min |
| 6 | Pendência, rejeição e bloqueio de contato | 1 min | 2 min |
| 7 | Resultado, persistência e limites | 1 min | 2 min |

A execução integral leva aproximadamente 6 min 36 s, além da preparação.
Para cumprir o tempo, use as capturas seguras e trechos do código. Uma demonstração
integral ao vivo exige reduzir a fala dos outros slides e disponibilidade das dependências.
A gravação bruta desta rodada não deve ser usada devido à prévia descrita acima.
Não reutilize o resultado ou o vídeo de 03/10 como aprovação deste cenário.

## Referências técnicas

- [Credenciais com cy.env no Cypress 16](https://docs.cypress.io/api/commands/env).
- [Seleção de arquivos](https://docs.cypress.io/api/commands/selectfile).
- [Observação de requisições com intercept](https://docs.cypress.io/api/commands/intercept).
