> Histórico de 03/10/2026: este material descreve a demonstração anterior com sessão simulada. Para o cenário atual com API real, consulte [cypress-plataforma-real.md](cypress-plataforma-real.md). Os resultados abaixo não aprovam o novo teste.

# Resultados reais — Cypress no Juntaí!

Executado em 03/10/2026, Windows, Node 22.14.0, Cypress 16.1.1 e Electron 146
headless. A aplicação foi servida pelo Vite em `127.0.0.1:5175`, com autenticação
interceptada e dados fictícios locais.

## Execuções realizadas

| Execução                 | Testes | Aprovados | Reprovados | Duração do cenário | Resultado                                                   |
| ------------------------ | ------ | --------- | ---------- | ------------------ | ----------------------------------------------------------- |
| Diagnóstico inicial      | 1      | 0         | 1          | 19,729 s           | Tela ainda não renderizada no limite padrão de 4 s          |
| Diagnóstico do modal     | 1      | 0         | 1          | 35,348 s           | Seletor explícito de role não correspondia ao dialog nativo |
| Cenário corrigido        | 1      | 1         | 0          | 29,088 s           | Fluxo completo aprovado                                     |
| Falha controlada         | 1      | 0         | 1          | 23,782 s           | Heading propositalmente incorreto; saída 1 esperada         |
| Confirmação após a falha | 1      | 1         | 0          | 32,787 s           | Expectativa correta e persistência aprovadas novamente      |

As linhas representam execuções do mesmo cenário, não cinco testes diferentes.
As durações são as retornadas pelo Cypress; instalação, verificação do binário e
inicialização do servidor não estão incluídas. Não foram calculadas métricas de
cobertura ou estabilidade a partir dessa pequena amostra.

## O que foi verificado

- A exploração abriu após a resposta controlada de autenticação.
- Digitar `solar` e selecionar `CE` manteve SolNexo e retirou AgroPonte da busca.
- Abrir o perfil navegou para `/startups/solnexo`.
- Confirmar o interesse desabilitou o botão com a mensagem `Interesse enviado`.
- Matches apresentou SolNexo e não apresentou AgroPonte, que não recebeu interesse.
- Recarregar manteve o match e o estado do botão.

## Dificuldades e correções

A primeira execução falhou enquanto o carregamento inicial dos módulos do Vite
ainda deixava a tela vazia. O limite de comandos passou de 4 para 15 segundos:
o Cypress continua avançando assim que a condição é satisfeita, sem esperar
sempre 15 segundos. A segunda falha estava no teste: o componente usa `<dialog>`
com role acessível implícito. O seletor foi corrigido de `[role="dialog"]` para
`dialog[open]`, sem modificar o produto.

A demonstração controlada substituiu apenas o heading esperado por
`Resultado incorreto para depuração`. A captura mostra `Seus matches` na tela
e o comando incorreto em vermelho. A mensagem real foi:

```text
AssertionError: Timed out retrying after 1500ms:
Expected to find content: 'Resultado incorreto para depuração'
within the selector: 'h1' but never did.
```

A cópia temporária `falha-controlada.cy.ts` foi removida automaticamente após
essa execução. O cenário principal conserva a expectativa correta.

## Evidências locais

- [Resumo do cenário correto](../cypress/artifacts/aprovado/resultado.json).
- [Vídeo do cenário correto](../cypress/artifacts/aprovado/videos/interesse-startup.cy.ts.mp4).
- [Captura da busca](../cypress/artifacts/aprovado/screenshots/interesse-startup.cy.ts/01-busca-solar.png).
- [Captura do interesse](../cypress/artifacts/aprovado/screenshots/interesse-startup.cy.ts/02-interesse-confirmado.png).
- [Captura do match após recarga](../cypress/artifacts/aprovado/screenshots/interesse-startup.cy.ts/03-match-persistido.png).
- [Resumo da falha controlada](../cypress/artifacts/falha/resultado.json).
- [Vídeo da falha controlada](../cypress/artifacts/falha/videos/falha-controlada.cy.ts.mp4).

A imagem automática da falha fica em
`cypress/artifacts/falha/screenshots/falha-controlada.cy.ts/`, com sufixo
`(failed).png`. Os diagnósticos iniciais foram preservados em
`cypress/artifacts/diagnostico-inicial` e `diagnostico-seletor`.
Artefatos são reais, locais e ignorados pelo Git. Ao repetir comandos, os arquivos
de `aprovado` e `falha` podem ser substituídos; salve uma cópia para a apresentação.

## Verificações adicionais e limites

TypeScript do projeto, TypeScript do Cypress e lint passaram. O Vitest executou
**56 testes em 11 arquivos, todos aprovados**, confirmando que o Cypress não
passou a integrar indevidamente a suíte unitária. A formatação dos entregáveis
foi verificada separadamente.

O comando `npm run cypress:demo:open` também foi executado e a abertura da janela
`Cypress` foi confirmada no Windows. As evidências de execução do cenário são
headless. O roteiro descreve seleção do navegador, inspeção de comandos e
snapshots no modo interativo; essas ações manuais não foram automatizadas nesta
execução e não devem ser apresentadas como automaticamente validadas.
Electron mostrou aviso de descontinuação como navegador de testes; nesta versão
ele ainda executou o cenário. Para futuras atualizações, avalie Chrome ou Edge.

Não houve teste contra API ou banco reais. Login, cadastro, mensagens e reuniões
não fazem parte desta cobertura. A aprovação se limita ao fluxo implementado.
