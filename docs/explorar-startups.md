# Explorar startups

- Entrada autenticada: `/investidor/startups`, acessível pela navegação existente.
- Perfis públicos: `/startups/solnexo` e `/startups/agroponte`, dentro da área autenticada de descoberta.
- O backend atual usa o papel `investidor` também para a participação como mentor; a exploração reutiliza essa autorização sem criar um papel novo.

## Demonstração

Os registros públicos fictícios usam as startups SolNexo Energia e AgroPonte Digital. Camila Torres e Bruno Almeida usam suas contas existentes, sem alteração do login ou armazenamento de senhas.

Os interesses demonstrativos de Camila são clima, agronegócio, validação/crescimento, Nordeste e SaaS. Bruno usa os mesmos segmentos, estágios e região, com Marketplace como modelo preferido. A regra explícita atribui 35 pontos ao segmento, 25 ao estágio, 25 à região e 15 ao modelo. Preferências ausentes deixam a compatibilidade indisponível. Esses valores ilustram afinidade, não avaliação de investimento.

Busca, filtros, ordenação e visualização ficam na URL. O link do card preserva essa URL no estado da navegação para o retorno do perfil. Faixas de capital não excluem empresas sem valor divulgado; situação desconhecida não equivale a “não buscando”.

Salvos, interesses e convites ficam em `juntai:discovery:<id do usuário>` no localStorage. Não há envio ao backend. Interesses têm registro de data e não são duplicados na interface. Convites ficam pendentes, disponíveis em Reuniões, e não são apresentados como confirmados.

A permissão demonstrativa para conversar e agendar vem de uma conversa ativa retornada pelo repositório existente de mensagens. Enviar interesse não concede essa permissão. O parâmetro `startup` seleciona a conversa correspondente em Mensagens.

## Integração futura

Substituir `demoStartupRepository` por um adaptador de API que retorne somente informações públicas e a compatibilidade do mecanismo de recomendação. Substituir a persistência de `useDiscovery` por endpoints autenticados de favoritos, interesses e convites. O backend deve validar autorização, estado da conexão e idempotência de interesses. O repositório de mensagens deve fornecer as permissões reais.

## Validação

- `npm run build`
- `npm run lint`
- `npm run test`
- `npm run test:e2e -- tests/e2e/explore-startups.spec.ts tests/e2e/messages.spec.ts`
