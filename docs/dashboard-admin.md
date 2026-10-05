# Dashboard administrativo do Juntaí!

## Acesso e configuração local

- Frontend: login normal em /login; contas com tipoPerfil admin seguem para /admin.
- API utilizada: http://localhost:3336, configurada em .env.local.
- Banco local verificado: localhost:5434, juntai_db.
- Uma conta administrativa local de teste foi criada mediante autorização do usuário. A senha gerada foi entregue na conversa; não foi gravada neste documento nem no código.
- A API local 3336 foi recarregada. O container antigo em 3333 precisa ser reconstruído/reiniciado para receber estes arquivos.

## Rotas do frontend

| Rota                | Conteúdo                                                   |
| ------------------- | ---------------------------------------------------------- |
| /admin              | Indicadores reais, cadastros pendentes e atividade recente |
| /admin/cadastros    | Análise de startups, investidores e mentores               |
| /admin/usuarios     | Contas e edição de nome/e-mail                             |
| /admin/startups     | Startups, responsável, segmento e edição de nome/descrição |
| /admin/investidores | Investidores/mentores e edição de nome, título e biografia |
| /admin/reunioes     | Consulta de reuniões, participantes, notas e link          |
| /admin/auditoria    | Histórico com filtros e detalhes                           |

## API

Reutilizados: POST /auth/login, GET /auth/me e a verificação JWT existente.

Todos os novos endpoints abaixo exigem JWT e administrador ativo confirmado no banco:

| Método | Endpoint                           | Uso                                                                                  |
| ------ | ---------------------------------- | ------------------------------------------------------------------------------------ |
| GET    | /admin/metricas                    | Contagens reais de usuários, startups, investidores, mentores, pendências e reuniões |
| GET    | /admin/cadastros                   | Busca, tipo, grupo, status, ordenação e paginação                                    |
| GET    | /admin/cadastros/:tipo/:id         | Perfil completo e histórico administrativo                                           |
| POST   | /admin/cadastros/:tipo/:id/decisao | Aprovação ou rejeição com motivo obrigatório                                         |
| GET    | /admin/usuarios                    | Busca, tipo, status, ordenação e paginação                                           |
| PATCH  | /admin/usuarios/:id                | Nome e e-mail                                                                        |
| PATCH  | /admin/startups/:id                | Nome fantasia e descrição curta                                                      |
| PATCH  | /admin/investidores/:id            | Nome, título profissional e biografia                                                |
| GET    | /admin/reunioes                    | Busca de participantes, status e paginação                                           |
| GET    | /admin/auditoria                   | Busca, administrador, ação, recurso, período e paginação                             |

A paginação limita cada resposta a 50 registros e utiliza 15 por página nas telas.
Mentores continuam pertencendo à entidade Investidor. A contagem e o filtro de mentores incluem mentor e anjo_mentor; a contagem de investidores inclui todos os perfis dessa entidade.

## Segurança e persistência

O frontend confirma a sessão em /auth/me antes de liberar /admin. Perfis comuns são redirecionados para sua Home. O backend confirma o papel e o estado ativo na tabela usuarios em cada requisição administrativa; um papel alegado no JWT não substitui essa checagem.

Somente cadastros pendentes podem receber decisão. Uma decisão concorrente ou repetida retorna 409. Aprovação/rejeição utiliza bloqueio da linha e grava a mudança e o log na mesma transação. Falha de auditoria reverte a operação.

A edição usa uma lista explícita de campos e também é transacional e auditada. Senhas, hashes e tokens não aparecem nas respostas ou logs. Não existe edição de papéis, exclusão, desativação ou cancelamento administrativo na interface.

A entidade existente LogAuditoria e a tabela log_auditoria foram reutilizadas. Motivo de rejeição, status anterior/novo, administrador e alterações ficam nessa estrutura.

Migration criada e aplicada localmente: 1791244800003-IndicesAuditoria.ts. Adiciona apenas três índices em log_auditoria, sem criar entidades ou modificar os dados existentes.

## Arquivos desta implementação

Frontend:

- src/features/admin/AdminLayout.tsx
- src/features/admin/AdminPage.tsx
- src/features/admin/AdminMeetingsPage.tsx
- src/features/admin/api.ts
- src/features/admin/styles.ts
- src/app/router.tsx
- src/features/auth/services/auth.ts
- src/features/auth/services/requireRole.ts
- src/features/auth/services/session.ts
- src/shared/components/profile/PageHeader.tsx
- tests/e2e/admin.spec.ts

Backend:

- src/App.ts
- src/modules/admin/routes/admin.routes.ts
- src/shared/database/migrations/1791244800003-IndicesAuditoria.ts
- tests/admin.test.cjs

Outras alterações já existentes nos dois repositórios foram preservadas.

## Como conferir o fluxo

1. Entre com a conta administrativa e abra /admin.
2. Em Cadastros, use Visualizar para conferir o responsável e todos os campos persistidos, incluindo logo, apresentação e Canvas da startup.
3. Aprove um perfil pendente após confirmar a decisão. Confira a remoção das pendências e a atualização dos indicadores.
4. Rejeite outro perfil pendente informando o motivo. Decisões reais alteram o cadastro; os testes automatizados utilizam fixtures temporárias ou mocks.
5. Abra Auditoria, filtre por ação/administrador e consulte os detalhes da decisão.
6. Use Editar na tabela apropriada e confirme a alteração e seu log.
7. Confira Reuniões para consultar os registros efetivamente presentes no banco.

## Verificação executada

- Frontend: typecheck, build, lint e 68 testes unitários.
- Backend: TypeScript e 34 testes, incluindo integração administrativa com o banco local.
- E2E: 6 testes administrativos e 12 testes de autenticação/perfis.
- API real: login administrativo e leitura das rotas de métricas, cadastros, usuários, auditoria, reuniões e mentores.
- Layout verificado por imagens em desktop e celular, com rolagem da tabela limitada ao próprio componente.
- Integração local comprova bloqueio de perfil comum, JWT com papel incompatível com o banco, admin inativo, concorrência e rollback de auditoria. Fixtures temporárias são removidas ao final.

Imagens de teste: output/admin/admin-desktop.png e output/admin/admin-mobile.png.

## Dependências e limites

- Matches não receberam tabela ou indicador: o sistema atual ainda não fornece um fluxo persistido e consistente de matches/interesses para esse painel. A tabela de eventos do funil não foi apresentada como se fosse uma tabela de matches.
- Login administrativo não gera um novo tipo de log: o enum de auditoria existente não contém essa categoria. São registradas as decisões e edições implementadas.
- A consulta de reuniões é somente leitura. Cancelamento e outras operações exigem regras/API administrativas específicas.
- A imagem do container precisa incorporar as novas rotas e a migration de índices. O ambiente local 3336 está atualizado.
