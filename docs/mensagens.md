# Mensagens

A mesma tela atende `/startup/mensagens` e `/investidor/mensagens`, com proteção por papel e links nos menus de perfil. O tema, participantes e filtros acompanham o papel autenticado.

## Demonstração

O adaptador `demoMessagesRepository` em `src/features/messages/model.ts` fornece conversas apenas para as quatro contas de teste especificadas (SolNexo, AgroPonte, Camila e Bruno), verificando também o papel. Demais contas recebem uma lista vazia. Não há senhas no código.

Mensagens, anexos, leitura, arquivamento e convites são mantidos em memória, isolados pela conta. Recarregar ou sair da tela descarta as alterações. Não há entrega de mensagens, upload de arquivos, notificações remotas ou confirmação real de reuniões. O aviso de demonstração fica visível na tela.

## Integração futura

Os modelos `Conversation`, `Message`, `UserSummary`, `MatchContext` e `Meeting` estão separados da apresentação. Substitua o adaptador de listagem e conecte as ações de envio, leitura, arquivamento e reunião aos endpoints autenticados antes de disponibilizar comunicação real. A API deve validar a participação na conversa, a elegibilidade do match e o estado da conexão em todas as operações, e retornar apenas campos públicos autorizados do perfil.

A interface suporta conversas ativas, arquivadas e encerradas; os dados iniciais demonstrativos são ativos. Convites aparecem como pendentes de confirmação. O botão Ver matches informa a indisponibilidade enquanto essa área não estiver integrada.

## Validação

- `npm test`: isolamento do conjunto demonstrativo e busca/filtros, além dos testes existentes.
- `npx playwright test tests/e2e/messages.spec.ts`: ambos os papéis, envio, convite, arquivamento/reativação, busca e navegação mobile.
