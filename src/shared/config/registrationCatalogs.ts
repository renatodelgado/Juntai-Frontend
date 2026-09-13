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
