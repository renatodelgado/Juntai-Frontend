# Demonstração E2E do Juntaí! com Cypress

## O que foi encontrado no projeto

O frontend usa React 19, TypeScript, Vite 7, React Router 7 e styled-components.
`src/app/router.tsx` define as rotas; `src/features` organiza as funcionalidades,
e `src/shared` contém componentes, configuração e cliente HTTP.
Já existem testes unitários em Vitest e testes de navegador em Playwright;
essas ferramentas e seus comandos foram preservados.

Login e validação da sessão usam a API: `src/shared/services/api.ts` utiliza
`fetch` e `VITE_API_URL`, cujo padrão é `http://localhost:3333`.
As rotas protegidas consultam `GET /auth/me`. Exploração usa duas startups
fictícias do repositório local; interesses e favoritos são persistidos em
`localStorage` por `useDiscovery`. Também existem telas de cadastro, perfil,
mensagens e reuniões. Não usamos cadastro ou reuniões, pois são desnecessários
para este cenário e aumentariam a preparação.

Fluxo escolhido: **Explorar → buscar solar e selecionar CE → abrir SolNexo →
confirmar interesse → Matches → recarregar**. O resultado relevante é a startup
selecionada aparecer em Matches, continuar com interesse enviado após recarregar
e a startup não selecionada ficar ausente.

## Conceitos para explicar

Um teste de ponta a ponta percorre um fluxo da perspectiva do usuário. Automação
reproduz digitação, seleção, cliques e navegação; asserções verificam a resposta.
Reexecutar esses cenários após mudanças ajuda a detectar regressões.

| Tipo       | Exemplo no Juntaí!                                     | Alcance                                   |
| ---------- | ------------------------------------------------------ | ----------------------------------------- |
| Unitário   | Calcular compatibilidade com preferências              | Uma função ou regra isolada               |
| Integração | Cliente HTTP interpretar a resposta da API             | Colaboração entre componentes ou serviços |
| E2E        | Buscar uma startup, abrir perfil e confirmar interesse | Um fluxo no navegador                     |

Um E2E pode chegar à API e ao banco quando esses serviços participam do teste.
**Nesta demonstração, a autenticação é simulada e os dados de descoberta são
locais. A aprovação não comprova login real, API real, banco ou envio de interesse
à startup.** Um cenário aprovado também não garante ausência de outros defeitos.

## Preparação e execução

Foi instalado Cypress 16.1.1. Use Node 22 (a partir de 22.12), 24 ou 26+,
compatível com o projeto e com os engines dessa versão do Cypress, dependências instaladas, rede
para o primeiro download do Cypress e porta 5175 livre. Use uma cópia local do
projeto. O usuário e a sessão do teste são fictícios; nenhuma senha é necessária.

```sh
npm ci
npm run cypress:demo
```

O segundo comando inicia Vite localmente, espera a aplicação responder, executa
um teste headless no Electron e encerra o servidor ao finalizar. As esperas de
inicialização consultam o servidor; o teste não contém pausas fixas.

No PowerShell com bloqueio de scripts `.ps1`, utilize `npm.cmd` e `npx.cmd`.
Se o binário estiver ausente, execute `npx cypress install` e
`npx cypress verify`. O primeiro download pode demorar.

Para a apresentação visual:

```sh
npm run cypress:demo:open
```

Escolha E2E, um navegador disponível e `interesse-startup.cy.ts`.
Observe o Command Log, a tela da aplicação, os comandos e as asserções. Clique
em comandos anteriores para inspecionar os snapshots. Feche o Cypress para
encerrar o servidor iniciado pelo script.

Alternativa manual, em dois terminais:

```sh
# Terminal 1: mantenha aberto
npm run dev -- --host 127.0.0.1 --port 5175 --strictPort

# Terminal 2: escolha um modo
npm run cypress:open
npm run cypress:run
```

Esses scripts correspondem a `npx cypress open --e2e` e
`npx cypress run --e2e`. Headless dispensa a interface interativa, mas continua
executando a aplicação em um navegador.

## Arquivos e comandos

| Arquivo                               | Papel                                                           |
| ------------------------------------- | --------------------------------------------------------------- |
| `cypress.config.ts`                   | URL local, viewport, isolamento, vídeo e capturas               |
| `cypress/e2e/interesse-startup.cy.ts` | Único cenário principal                                         |
| `cypress/tsconfig.json`               | Tipagem isolada do Cypress, sem conflitar com Vitest/Playwright |
| `scripts/cypress-demo.mjs`            | Inicia servidor, executa demonstração e salva resumo            |

Não há arquivo de suporte: o cenário é curto e não exige comandos personalizados.

| Comando                              | Uso neste cenário                                         |
| ------------------------------------ | --------------------------------------------------------- |
| `cy.intercept()`                     | Responde à validação de sessão com usuário fictício       |
| `cy.visit()`                         | Abre a exploração e prepara armazenamento vazio           |
| `cy.wait('@session')`                | Aguarda a requisição relevante, sem atraso fixo           |
| `cy.get()` / `cy.contains()`         | Consulta campos acessíveis, headings e botões             |
| `.type()` / `.select()` / `.click()` | Simula busca, filtro e confirmação                        |
| `.should()`                          | Verifica visibilidade, ausência, URL e botão desabilitado |
| `cy.reload()`                        | Verifica persistência através de novo carregamento        |
| `cy.screenshot()`                    | Registra etapas reais da execução                         |

As consultas e asserções são repetidas automaticamente até passarem ou atingirem
o timeout. O limite de comandos foi configurado em 15 segundos para o carregamento
inicial dos módulos pelo Vite; a execução avança assim que a condição passa.
As ações aguardam condições de interação; isso não significa repetir
indefinidamente um clique. Consulte a [documentação de retry-ability](https://docs.cypress.io/app/core-concepts/retry-ability)
e a [configuração oficial](https://docs.cypress.io/app/references/configuration).

## Falha controlada e correção

```sh
npm run cypress:demo:failure
npm run cypress:demo
```

A primeira execução cria uma cópia temporária do mesmo cenário e troca a
expectativa do heading `Seus matches` por `Resultado incorreto para depuração`.
Espera-se código de saída 1 e uma falha de asserção. Analise a mensagem, a linha
indicada, a captura automática e o vídeo. O erro representa uma expectativa
incorreta no teste, e não um defeito demonstrado no produto.

O script remove a cópia em `finally` e preserva o cenário original. A segunda
execução usa a expectativa correta. Se o processo for encerrado à força,
verifique e remova somente `cypress/e2e/falha-controlada.cy.ts` antes de executar
toda a suíte; esse arquivo é ignorado pelo Git.

Para mostrar a falha no modo interativo, altere temporariamente esse texto no
teste, observe o comando vermelho e restaure `Seus matches` imediatamente.
Depois execute novamente. O código entregue contém a expectativa correta.

## Evidências e análise

O runner salva:

- `cypress/artifacts/aprovado/resultado.json`: contagem real e duração da execução correta.
- `cypress/artifacts/aprovado/screenshots/`: busca, interesse confirmado e match persistido.
- `cypress/artifacts/aprovado/videos/`: gravação da execução correta.
- `cypress/artifacts/falha/`: resumo, imagens e vídeo da falha controlada.

Execuções manuais usam `cypress/artifacts/screenshots` e `videos`.
Os artefatos são locais e ignorados pelo Git; compartilhe apenas os arquivos
necessários à apresentação. O resumo evita objetos de sessão e cabeçalhos.
Veja [resultados da execução](cypress-resultados.md) para os dados efetivamente
obtidos neste ambiente.

## Boas práticas e limites

Cada execução começa com armazenamento vazio e um usuário fictício exclusivo.
Seletores usam nomes acessíveis e elementos semânticos, sem classes de estilo.
As asserções verificam efeitos da ação e persistência. Não há alterações de
design ou regras de negócio para viabilizar o teste.

O servidor inicia somente em loopback. A resposta de autenticação é controlada;
os demais dados do fluxo vêm dos repositórios de demonstração já existentes.
Não há backend ou banco real envolvidos. O cenário não cobre cadastro, login,
mensagens, reuniões, acessibilidade completa ou compatibilidade entre navegadores.

Não foi encontrado pipeline de CI em `.github`. Uma integração futura poderia
executar `npm ci`, `npm run cypress:demo` e guardar `cypress/artifacts` mesmo em
caso de falha. Linux exige as bibliotecas de sistema previstas na documentação
do Cypress. Não foi adicionada infraestrutura de CI nesta entrega.

## Plano alternativo para a apresentação

Antes de apresentar, baixe dependências e execute o cenário. Deixe os vídeos,
capturas e resumos acessíveis. Se a execução ao vivo falhar por infraestrutura,
mostre a gravação e o relatório de uma execução anterior, identificando-os como
tal. Se não houver ambiente gráfico, use headless e suas evidências. Não apresente
uma imagem da aplicação como prova de teste aprovado sem o resultado associado.
