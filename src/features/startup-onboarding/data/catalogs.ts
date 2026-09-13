export type Option = { value: string; label: string; description?: string };

export const segments = [
  { value: 'saas_b2b', label: 'SaaS B2B' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'fintech', label: 'Fintech' },
  { value: 'healthtech', label: 'Healthtech' },
  { value: 'edtech', label: 'Edtech' },
  { value: 'retailtech', label: 'Retailtech' },
  { value: 'agtech', label: 'Agtech' },
  { value: 'foodtech', label: 'Foodtech' },
  { value: 'saas', label: 'SaaS' },
  { value: 'artificial_intelligence', label: 'Inteligência Artificial' },
  { value: 'creative_economy', label: 'Economia Criativa' },
  { value: 'logtech', label: 'Logtech' },
  { value: 'govtech', label: 'Govtech' },
  { value: 'climate_greentech', label: 'Climate/GreenTech' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'other', label: 'Outros' },
] as const;

export const stages = [
  {
    value: 'ideation',
    label: 'Ideação',
    description: 'Uma ideia e um problema para resolver.',
  },
  {
    value: 'validation',
    label: 'Validação',
    description: 'Conversando com clientes e testando hipóteses.',
  },
  {
    value: 'mvp',
    label: 'MVP',
    description: 'Uma primeira versão do produto em uso.',
  },
  {
    value: 'early_traction',
    label: 'Tração inicial',
    description: 'Primeiros clientes e sinais de crescimento.',
  },
  {
    value: 'growth',
    label: 'Crescimento',
    description: 'Um modelo validado ganhando mercado.',
  },
  {
    value: 'scale',
    label: 'Escala',
    description: 'Expandindo um negócio consolidado.',
  },
] as const;

export const businessModels = [
  ['b2b', 'B2B'],
  ['b2c', 'B2C'],
  ['b2b2c', 'B2B2C'],
  ['marketplace', 'Marketplace'],
  ['saas', 'SaaS'],
  ['subscription', 'Assinatura'],
  ['commission', 'Comissão/Marketplace'],
  ['licensing', 'Licenciamento'],
  ['freemium', 'Freemium'],
  ['other', 'Outro'],
].map(([value, label]) => ({ value: value!, label: label! }));

export const regions: Option[] = [
  { value: 'north', label: 'Norte' },
  { value: 'northeast', label: 'Nordeste' },
  { value: 'central_west', label: 'Centro-Oeste' },
  { value: 'southeast', label: 'Sudeste' },
  { value: 'south', label: 'Sul' },
  { value: 'international', label: 'Exterior' },
];

export const brazilRegionIds = regions
  .filter((region) => region.value !== 'international')
  .map((region) => region.value);

// Mantém rascunhos anteriores legíveis sem ampliar Pernambuco para todo o Nordeste.
export function migrateRegionValues(value: unknown): unknown {
  if (!Array.isArray(value)) return value;
  return [
    ...new Set(
      value.flatMap((region: unknown) => {
        if (region === 'brazil') return brazilRegionIds;
        if (region === 'pe' || region === 'other') return [];
        return [region];
      }),
    ),
  ];
}

export const revenueRanges: Option[] = [
  { value: 'none', label: 'Ainda não faturamos' },
  { value: 'up_to_10k', label: 'Até R$ 10 mil/mês' },
  { value: '10k_to_50k', label: 'Acima de R$ 10 mil até R$ 50 mil/mês' },
  { value: '50k_to_100k', label: 'Acima de R$ 50 mil até R$ 100 mil/mês' },
  { value: '100k_to_500k', label: 'Acima de R$ 100 mil até R$ 500 mil/mês' },
  { value: 'over_500k', label: 'Acima de R$ 500 mil/mês' },
];

export const teamSizes: Option[] = [
  { value: '1', label: '1 pessoa' },
  { value: '2_5', label: '2–5 pessoas' },
  { value: '6_10', label: '6–10 pessoas' },
  { value: '11_25', label: '11–25 pessoas' },
  { value: '26_50', label: '26–50 pessoas' },
  { value: '51_plus', label: '51+ pessoas' },
];

export const seekingInvestment: Option[] = [
  {
    value: 'yes',
    label: 'Sim',
    description: 'Estamos buscando capital para o próximo passo.',
  },
  {
    value: 'no',
    label: 'Não neste momento',
    description: 'Queremos outras formas de conexão.',
  },
  {
    value: 'evaluating',
    label: 'Ainda estamos avaliando',
    description: 'Queremos entender as possibilidades.',
  },
];

export const investmentPurposes: Option[] = [
  { value: 'product', label: 'Desenvolvimento de produto' },
  { value: 'hiring', label: 'Contratação de equipe' },
  { value: 'marketing_sales', label: 'Marketing e vendas' },
  { value: 'expansion', label: 'Expansão geográfica' },
  { value: 'infrastructure', label: 'Infraestrutura/tecnologia' },
  { value: 'operations', label: 'Operações' },
  { value: 'working_capital', label: 'Capital de giro' },
  { value: 'other', label: 'Outro' },
];

export const needs: Option[] = [
  { value: 'investment', label: 'Investimento' },
  { value: 'mentoring', label: 'Mentoria' },
  { value: 'networking', label: 'Networking' },
  { value: 'technology', label: 'Tecnologia' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Vendas' },
  { value: 'management', label: 'Gestão' },
  { value: 'strategy', label: 'Estratégia' },
  { value: 'market_access', label: 'Acesso a mercado' },
  { value: 'partnerships', label: 'Parcerias' },
  { value: 'other', label: 'Outro' },
];

export const partnerTypes: Option[] = [
  { value: 'angel', label: 'Investidor anjo' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'angel_mentor', label: 'Investidor + mentor' },
];

export const expertise: Option[] = [
  ...needs.filter((option) =>
    ['technology', 'sales', 'marketing', 'management', 'strategy'].includes(
      option.value,
    ),
  ),
  { value: 'finance', label: 'Finanças' },
  { value: 'expansion', label: 'Expansão' },
  { value: 'internationalization', label: 'Internacionalização' },
  { value: 'specific_market', label: 'Mercado específico' },
  { value: 'entrepreneurship', label: 'Empreendedorismo' },
  { value: 'other', label: 'Outro' },
];

export const states: Option[] = [
  ['AC', 'Acre'],
  ['AL', 'Alagoas'],
  ['AP', 'Amapá'],
  ['AM', 'Amazonas'],
  ['BA', 'Bahia'],
  ['CE', 'Ceará'],
  ['DF', 'Distrito Federal'],
  ['ES', 'Espírito Santo'],
  ['GO', 'Goiás'],
  ['MA', 'Maranhão'],
  ['MT', 'Mato Grosso'],
  ['MS', 'Mato Grosso do Sul'],
  ['MG', 'Minas Gerais'],
  ['PA', 'Pará'],
  ['PB', 'Paraíba'],
  ['PR', 'Paraná'],
  ['PE', 'Pernambuco'],
  ['PI', 'Piauí'],
  ['RJ', 'Rio de Janeiro'],
  ['RN', 'Rio Grande do Norte'],
  ['RS', 'Rio Grande do Sul'],
  ['RO', 'Rondônia'],
  ['RR', 'Roraima'],
  ['SC', 'Santa Catarina'],
  ['SP', 'São Paulo'],
  ['SE', 'Sergipe'],
  ['TO', 'Tocantins'],
].map(([value, label]) => ({ value: value!, label: label! }));

export const canvasFields = [
  {
    value: 'partners',
    label: 'Parcerias principais',
    hint: 'Quem ajuda o negócio a acontecer?',
  },
  {
    value: 'activities',
    label: 'Atividades principais',
    hint: 'O que vocês precisam fazer bem?',
  },
  {
    value: 'value',
    label: 'Proposta de valor',
    hint: 'Por que o cliente escolheria vocês?',
  },
  {
    value: 'relationships',
    label: 'Relacionamento com clientes',
    hint: 'Como vocês criam e mantêm vínculos?',
  },
  {
    value: 'customers',
    label: 'Segmentos de clientes',
    hint: 'Para quem vocês criam valor?',
  },
  {
    value: 'resources',
    label: 'Recursos principais',
    hint: 'O que é essencial para entregar a solução?',
  },
  {
    value: 'channels',
    label: 'Canais',
    hint: 'Como vocês chegam até os clientes?',
  },
  {
    value: 'costs',
    label: 'Estrutura de custos',
    hint: 'Quais são os principais gastos?',
  },
  {
    value: 'revenue',
    label: 'Fontes de receita',
    hint: 'Como o negócio gera receita?',
  },
] as const;

export function optionLabel(options: readonly Option[], value: string) {
  return (
    options.find((option) => option.value === value)?.label ?? 'Não informado'
  );
}
