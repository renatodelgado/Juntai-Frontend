# Integracao das recomendacoes

O frontend usa somente a API Node configurada em VITE_API_URL. O backend local
Juntai-Backend foi usado como referencia de contrato, junto com o guia PDF.

## Contrato e apresentacao

- A descoberta usa GET /startups/discovery com sort=compatibility por padrao.
  O nome desse parametro e legado: o backend escolhe rules ou supervised.
- Ordenacoes recent, name e investment continuam sem inferencia. O frontend
  preserva a ordem e os metadados de paginacao recebidos.
- rules: compatibility e exibido como compatibilidade por regras (0 a 100).
- supervised: probabilidadeInteresse (0 a 1) e apresentada em percentual,
  identificada como experimental e treinada com interacoes sinteticas.
- origemRecomendacao, posicaoRanking, versaoModelo, avisos e contextoExposicao
  sao preservados. O contexto nao e reconstruido pelo navegador.
- fallback e avisos da pagina sao exibidos. O frontend nao calcula fallback,
  pontuacao nem explicacoes. Erros permitem tentar novamente.
- Nao ha motivos inventados. A descoberta atual nao recebe explicacoes do
  backend, portanto nao mostra listas de motivos.
- Faixas visuais absolutas: abaixo de 40% baixa; 40 a menos de 70% moderada;
  70 a menos de 90% alta; 90% ou mais muito alta. Essas faixas sao apresentacao,
  nao limiares aprendidos pelo modelo. Percentuais exibem ate uma casa decimal.
- Exposicao: POST /startups/exposicoes, corpo { contexto }, apos pelo menos 50%
  do card visivel por um segundo continuo, com documento ativo. Saida do campo
  de visao e troca de aba cancelam a espera. Confirmacoes simultaneas sao
  deduplicadas e falhas permitem ate tres tentativas enquanto visivel.
- O painel aprovado direciona o investidor para as recomendacoes reais.
  Matches continuam representando interesses confirmados, nao recomendacoes.

## Validacao

npm test
npm run test:browser
npm run check
npm run build

A suite de contrato cobre ordem, filtros, pagina, probabilidade, regras, fallback,
validacao de valores, erros, quatro faixas visuais e idempotencia/retry de exposicao.
A suite de navegador inicia Vite temporariamente e usa Edge headless com respostas
HTTP simuladas; nao envia exposicoes ao banco real. PLAYWRIGHT_CHANNEL pode
selecionar outro navegador instalado. Capturas ficam em test-results/ (ignorado).

O fluxo com Node, PostgreSQL e FastAPI reais ainda precisa de validacao em um
ambiente de teste com investidor aprovado. Nao foram alterados .env, estrategia,
algoritmos ou banco do backend. Para exercitar supervised nesse ambiente, configure
MATCHMAKING_STRATEGY no backend, nao no frontend.
