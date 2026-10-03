# Matches do investidor e mentor

Entrada autenticada: `/investidor/matches`, pelo item Matches do menu superior compartilhado. Mentores usam o papel `investidor` existente no backend. A página reutiliza `DiscoveryLayout`, `PageHeader`, a identidade das startups, o indicador de compatibilidade, a grade masonry e o fluxo de reunião.

## Dados e permissões

`MatchesRepository` separa a apresentação do futuro serviço de recomendações. O adaptador demonstrativo usa SolNexo e AgroPonte para as contas existentes de Camila e Bruno, com as preferências e a regra explícita de afinidade da exploração. Alta compatibilidade significa 90% ou mais. Os indicadores acompanham os resultados filtrados.

O percentual não concede interesse mútuo nem acesso a mensagens. `mutualInterest` precisa vir explicitamente do serviço de conexão. Na demonstração, há conversas ativas já fornecidas pelo repositório de mensagens para essas contas; por isso seu estado é Conversa iniciada, e não Novo match. As justificativas vêm somente dos fatores usados na compatibilidade. Faixa de investimento não gera justificativa quando o valor não foi divulgado.

O painel inferior acompanha conexões relacionadas às recomendações, independentemente dos filtros da lista. Datas e últimas mensagens são obtidas das conversas existentes; interesses sem conversa usam a data do envio. Agendamento requer uma conexão ativa e mantém o convite pendente.

## Persistência

Salvos e interesses compartilham a persistência da exploração (`juntai:discovery:<id do usuário>`). A estrutura agora inclui `viewed` e `discarded`; registros antigos são migrados na leitura. Conhecer uma startup marca a recomendação como visualizada. Descartar não apaga a conversa ou o interesse; a recomendação pode ser restaurada pelo filtro Descartado.

Busca, filtros e ordenação ficam na URL. O perfil público preserva a origem Matches e os parâmetros ao voltar. Os registros são locais na demonstração; a futura API deve validar permissões e garantir idempotência do interesse no servidor.

## Verificação

- `npm run build`
- `npm run lint`
- `npm run test`
- `npm run test:e2e -- tests/e2e/matches.spec.ts tests/e2e/explore-startups.spec.ts tests/e2e/messages.spec.ts`
