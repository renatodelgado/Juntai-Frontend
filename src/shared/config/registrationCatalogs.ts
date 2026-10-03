export const registrationSegments: Record<string, string> = {
  fintech: 'fintech',
  healthtech: 'healthtech',
  edtech: 'edtech',
  agtech: 'agtech',
  saas_b2b: 'saas_b2b',
  ecommerce: 'ecommerce',
  marketplace: 'marketplace',
  creative_economy: 'economia_criativa',
};
export const registrationModels: Record<string, string> = {
  b2b: 'b2b',
  b2c: 'b2c',
  b2b2c: 'b2b2c',
  marketplace: 'marketplace',
  saas: 'assinatura_saas',
  subscription: 'assinatura_saas',
};
export function supportedSegment(value: string) {
  return Object.hasOwn(registrationSegments, value);
}
export function supportedModel(value: string) {
  return Object.hasOwn(registrationModels, value);
}

export const registrationRegions: Record<string, string> = {
  north: 'norte',
  northeast: 'nordeste',
  central_west: 'centro_oeste',
  southeast: 'sudeste',
  south: 'sul',
};
export const registrationGrowthPeriods: Record<string, string> = {
  three_months: 'ultimos_3_meses',
  six_months: 'ultimos_6_meses',
  yearly: 'ultimo_ano',
  since_founding: 'desde_fundacao',
};
export const registrationNeeds: Record<string, string> = {
  mentoring: 'mentoria',
  networking: 'conexoes_mercado',
  market_access: 'conexoes_mercado',
  partnerships: 'parcerias_estrategicas',
  hiring: 'contratacao_talentos',
  other: 'outro',
};
export const registrationHelpAreas: Record<string, string> = {
  technology: 'produto_tecnologia',
  product: 'produto_tecnologia',
  sales: 'vendas_marketing',
  marketing: 'vendas_marketing',
  operations: 'operacoes',
  hr: 'rh_pessoas',
  finance: 'financeiro_juridico',
  mentoring: 'mentoria',
  networking: 'networking',
  growth: 'growth',
};
