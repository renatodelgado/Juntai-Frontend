import type { AuthUser } from '@/features/auth/services/session';

export type Startup = {
  id: string;
  name: string;
  logoUrl?: string;
  presentationUrl?: string;
  siteUrl?: string;
  metrics?: { clients?: number; revenue?: number; growth?: number };
  canvas?: Record<string, unknown>;
  tagline: string;
  description: string;
  segment: string;
  stage: string;
  location: { city: string; state: string; region: string };
  businessModel: string[];
  targetMarket: string;
  seekingInvestment?: boolean;
  investmentAmount?: number;
  investmentPurpose?: string;
  problem: string;
  solution: string;
  needs: string[];
  traction?: string;
  team?: string;
  pitch?: string;
  createdAt: string;
  color: string;
  variant: 'featured' | 'visual' | 'compact' | 'standard';
  compatibility?: number;
  compatibilityFactors?: string[];
};

// Public fictional records for the existing test accounts; never store credentials.
export const demoStartups: Startup[] = [
  {
    id: 'solnexo',
    name: 'SolNexo Energia',
    tagline: 'O futuro da energia cabe no seu negócio.',
    description:
      'Energia solar mais acessível para pequenos negócios, com gestão simples e dados em tempo real.',
    segment: 'Clima e sustentabilidade',
    stage: 'Crescimento',
    location: { city: 'Fortaleza', state: 'CE', region: 'Nordeste' },
    businessModel: ['SaaS', 'B2B'],
    targetMarket: 'Pequenas e médias empresas do Nordeste',
    seekingInvestment: true,
    investmentPurpose:
      'Expansão comercial e desenvolvimento da plataforma de gestão.',
    problem:
      'Pequenos negócios encontram barreiras para acessar energia solar e acompanhar o consumo de forma simples.',
    solution:
      'Uma plataforma que conecta empresas à energia solar e organiza os dados necessários para uma gestão mais eficiente.',
    needs: ['Investimento', 'Expansão comercial', 'Parceiros regionais'],
    traction: 'Pilotos com parceiros regionais',
    team: 'Equipe multidisciplinar de energia e tecnologia',
    pitch:
      'Conectamos empresas à energia solar com gestão simples e dados em tempo real.',
    createdAt: '2026-09-21',
    color: '#F4E5C4',
    variant: 'featured',
  },
  {
    id: 'agroponte',
    name: 'AgroPonte Digital',
    tagline: 'Do campo ao mercado. Sem distâncias.',
    description:
      'Uma ponte digital entre produtores rurais e novas oportunidades de mercado.',
    segment: 'Agronegócio',
    stage: 'Validação',
    location: { city: 'Recife', state: 'PE', region: 'Nordeste' },
    businessModel: ['Marketplace', 'B2B'],
    targetMarket: 'Agricultura familiar e cooperativas',
    problem:
      'Produtores da agricultura familiar precisam de mais acesso a compradores e oportunidades comerciais.',
    solution:
      'Um marketplace que aproxima produtores e compradores para uma cadeia mais eficiente.',
    needs: ['Mentoria', 'Acesso ao mercado', 'Cooperativas'],
    traction: 'Validação com cooperativas',
    team: 'Especialistas em tecnologia e agronegócio',
    pitch:
      'Aproximamos produtores e compradores para uma cadeia mais eficiente.',
    createdAt: '2026-09-22',
    color: '#DDE8DE',
    variant: 'visual',
  },
];

export const segments = [
  'Fintech',
  'Healthtech',
  'Edtech',
  'Agtech',
  'SaaS B2B',
  'Marketplace',
  'E-commerce',
  'Economia criativa',
];
export const stages = [
  'Ideação',
  'Validação',
  'MVP',
  'Tração inicial',
  'Crescimento',
  'Escala',
];
export const models = [
  'SaaS',
  'B2B',
  'B2C',
  'B2B2C',
  'Marketplace',
  'Assinatura',
  'Comissão',
  'Outros',
];
export type Preferences = {
  segments: string[];
  stages: string[];
  regions: string[];
  models: string[];
};
export function demoPreferences(user: AuthUser): Preferences | undefined {
  if (user.email.toLowerCase() === 'camila.investidora.2109@example.com')
    return {
      segments: ['Clima e sustentabilidade', 'Agronegócio'],
      stages: ['Validação', 'Crescimento'],
      regions: ['Nordeste'],
      models: ['SaaS'],
    };
  if (user.email.toLowerCase() === 'bruno.investidor.2109@example.com')
    return {
      segments: ['Agronegócio', 'Clima e sustentabilidade'],
      stages: ['Validação', 'Crescimento'],
      regions: ['Nordeste'],
      models: ['Marketplace'],
    };
}
// Explicit demo rule: segment 35%, stage 25%, region 25%, business model 15%.
// All four preferences must be available. This is an affinity score, not an investment assessment.
export function withCompatibility(
  startup: Startup,
  preferences?: Preferences,
): Startup {
  if (
    !preferences ||
    Object.values(preferences).some((values) => !values.length)
  )
    return { ...startup, compatibility: undefined, compatibilityFactors: [] };
  const checks = [
    {
      match: preferences.segments.includes(startup.segment),
      weight: 35,
      text: 'Segmento alinhado aos seus interesses',
    },
    {
      match: preferences.stages.includes(startup.stage),
      weight: 25,
      text: 'Estágio dentro das suas preferências',
    },
    {
      match: preferences.regions.includes(startup.location.region),
      weight: 25,
      text: 'Região contemplada no seu perfil',
    },
    {
      match: startup.businessModel.some((model) =>
        preferences.models.includes(model),
      ),
      weight: 15,
      text: 'Modelo de negócio alinhado às suas preferências',
    },
  ];
  return {
    ...startup,
    compatibility: checks.reduce(
      (sum, check) => sum + (check.match ? check.weight : 0),
      0,
    ),
    compatibilityFactors: checks
      .filter((check) => check.match)
      .map((check) => check.text),
  };
}
export type Filters = {
  q: string;
  segment: string;
  stage: string;
  location: string;
  model: string;
  investment: string;
  range: string;
  min: string;
  max: string;
  saved: string;
  sort: string;
  view: string;
};
export const defaultFilters: Filters = {
  q: '',
  segment: '',
  stage: '',
  location: '',
  model: '',
  investment: '',
  range: '',
  min: '',
  max: '',
  saved: '',
  sort: '',
  view: '',
};
export const investmentRanges = [
  { label: 'Até R$ 50 mil', min: 0, max: 50000 },
  { label: 'R$ 50 mil a R$ 200 mil', min: 50000, max: 200000 },
  { label: 'R$ 200 mil a R$ 500 mil', min: 200000, max: 500000 },
  { label: 'R$ 500 mil a R$ 1 milhão', min: 500000, max: 1000000 },
  { label: 'Acima de R$ 1 milhão', min: 1000000, max: Infinity },
];
const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
export function selectStartups(
  items: Startup[],
  filters: Filters,
  saved: string[],
) {
  const range = investmentRanges.find((item) => item.label === filters.range);
  const min = filters.min ? Number(filters.min) : (range?.min ?? 0);
  const max = filters.max ? Number(filters.max) : (range?.max ?? Infinity);
  return items
    .filter((item) => {
      const text = [
        item.name,
        item.tagline,
        item.description,
        item.segment,
        item.targetMarket,
        ...item.businessModel,
        ...item.needs,
      ].join(' ');
      return (
        normalize(text).includes(normalize(filters.q.trim())) &&
        (!filters.segment || item.segment === filters.segment) &&
        (!filters.stage || item.stage === filters.stage) &&
        (!filters.location ||
          normalize(Object.values(item.location).join(' ')).includes(
            normalize(filters.location),
          )) &&
        (!filters.model || item.businessModel.includes(filters.model)) &&
        (!filters.investment ||
          item.seekingInvestment === (filters.investment === 'yes')) &&
        (item.investmentAmount === undefined ||
          (item.investmentAmount >= min && item.investmentAmount <= max)) &&
        (!filters.saved || saved.includes(item.id))
      );
    })
    .sort((a, b) => {
      if (filters.sort === 'name') return a.name.localeCompare(b.name, 'pt-BR');
      if (filters.sort === 'recent')
        return b.createdAt.localeCompare(a.createdAt);
      if (filters.sort === 'investment')
        return (
          Number(b.seekingInvestment === true) -
          Number(a.seekingInvestment === true)
        );
      return (b.compatibility ?? -1) - (a.compatibility ?? -1);
    });
}
export interface StartupRepository {
  list(user: AuthUser): Promise<Startup[]>;
}
export const demoStartupRepository: StartupRepository = {
  async list(user) {
    return demoStartups.map((startup) =>
      withCompatibility(startup, demoPreferences(user)),
    );
  },
};
