import { z } from 'zod';
import {
  segments,
  stages,
  businessModels,
  regions,
  states,
  type Option,
} from '@/features/startup-onboarding/data/catalogs';

import {
  supportedSegment,
  supportedModel,
} from '@/shared/config/registrationCatalogs';

export const participation = [
  {
    value: 'investor',
    label: 'Investidor',
    description: 'Quero investir financeiramente em startups.',
  },
  {
    value: 'mentor',
    label: 'Mentor',
    description: 'Quero compartilhar conhecimento e experiência.',
  },
  {
    value: 'both',
    label: 'Investidor + mentor',
    description: 'Quero investir e também contribuir como mentor.',
  },
];
export const risks = [
  { value: 'conservative', label: 'Mais conservador' },
  { value: 'moderate', label: 'Moderado' },
  { value: 'bold', label: 'Arrojado' },
  { value: 'early_stage', label: 'Alto risco / estágio inicial' },
];
export const expertise = [
  { value: 'technology', label: 'Tecnologia' },
  { value: 'product', label: 'Produto' },
  { value: 'sales', label: 'Vendas' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'finance', label: 'Finanças' },
  { value: 'management', label: 'Gestão' },
  { value: 'strategy', label: 'Estratégia' },
  { value: 'operations', label: 'Operações' },
  { value: 'hr', label: 'Recursos Humanos' },
  { value: 'internationalization', label: 'Internacionalização' },
  { value: 'fundraising', label: 'Captação de investimentos' },
  { value: 'other', label: 'Outro' },
];
export const historyOptions = [
  { value: 'yes', label: 'Sim' },
  { value: 'no', label: 'Não' },
  { value: 'undisclosed', label: 'Prefiro não informar' },
];
export const counts = [
  { value: 'one', label: '1' },
  { value: 'two_five', label: '2–5' },
  { value: 'six_ten', label: '6–10' },
  { value: 'eleven_twenty', label: '11–20' },
  { value: 'over_twenty', label: 'Mais de 20' },
];
export const frequencies = [
  { value: 'opportunities', label: 'Conforme surgirem oportunidades' },
  { value: 'monthly', label: 'Algumas vezes por mês' },
  { value: 'weekly', label: 'Semanalmente' },
  { value: 'more_weekly', label: 'Mais de uma vez por semana' },
];
export const interactions = [
  { value: 'online', label: 'Conversas online' },
  { value: 'meetings', label: 'Reuniões' },
  { value: 'mentoring', label: 'Mentorias' },
  { value: 'networking', label: 'Networking' },
  { value: 'events', label: 'Eventos' },
  { value: 'opportunities', label: 'Análise de oportunidades' },
  { value: 'ongoing', label: 'Acompanhamento contínuo' },
];
export const openness = [
  { value: 'yes', label: 'Sim' },
  { value: 'maybe', label: 'Talvez' },
  { value: 'no', label: 'Não neste momento' },
];
export const offers = [
  {
    value: 'capital',
    label: 'Capital',
    description: 'Posso investir financeiramente.',
  },
  {
    value: 'mentoring',
    label: 'Mentoria',
    description: 'Posso orientar empreendedores.',
  },
  {
    value: 'networking',
    label: 'Networking',
    description: 'Posso conectar pessoas e empresas.',
  },
  {
    value: 'market_access',
    label: 'Acesso a mercado',
    description: 'Posso abrir novos mercados.',
  },
  {
    value: 'technical',
    label: 'Conhecimento técnico',
    description: 'Posso contribuir com conhecimento especializado.',
  },
  {
    value: 'business',
    label: 'Experiência empresarial',
    description: 'Posso compartilhar experiência de gestão e negócios.',
  },
];
const choice = (options: readonly Option[]) =>
  z
    .string()
    .refine(
      (value) =>
        value === '' || options.some((option) => option.value === value),
    );
const multiple = (options: readonly Option[]) =>
  z.array(
    z
      .string()
      .refine((value) => options.some((option) => option.value === value)),
  );
const text = z.string().max(3000);
export const investorSchema = z.object({
  name: text,
  photo: z
    .string()
    .max(2800000)
    .refine(
      (value) =>
        !value ||
        /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value),
    ),
  title: text,
  state: choice(states),
  cityId: text,
  cityName: text,
  linkedin: text,
  bio: text,
  participation: choice(participation),
  segments: multiple(segments),
  stages: multiple(stages),
  ticketMin: z.number().finite().nullable(),
  ticketMax: z.number().finite().nullable(),
  businessModels: multiple(businessModels),
  regions: multiple(regions),
  risk: choice(risks),
  expertise: multiple(expertise),
  history: choice(historyOptions),
  investmentCount: choice(counts),
  experience: text,
  previousSectors: multiple(segments),
  frequency: choice(frequencies),
  interactions: multiple(interactions),
  acceptsMentoring: z.boolean().nullable(),
  openInvestment: choice(openness),
  offers: multiple(offers),
  preferences: text,
  termsAccepted: z.boolean(),
  privacyAcknowledged: z.boolean(),
  matchingConsent: z.boolean(),
});
export type InvestorDraft = z.infer<typeof investorSchema>;
export function createInvestorDraft(): InvestorDraft {
  return {
    name: '',
    photo: '',
    title: '',
    state: '',
    cityId: '',
    cityName: '',
    linkedin: '',
    bio: '',
    participation: '',
    segments: [],
    stages: [],
    ticketMin: null,
    ticketMax: null,
    businessModels: [],
    regions: [],
    risk: '',
    expertise: [],
    history: '',
    investmentCount: '',
    experience: '',
    previousSectors: [],
    frequency: '',
    interactions: [],
    acceptsMentoring: null,
    openInvestment: '',
    offers: [],
    preferences: '',
    termsAccepted: false,
    privacyAcknowledged: false,
    matchingConsent: false,
  };
}

export const investorSteps = [
  {
    id: 'about',
    label: 'Sobre você',
    title: 'Vamos começar por você',
    description:
      'Conte um pouco sobre sua experiência. Seu perfil ajuda startups a entenderem quem pode estar do outro lado da conexão.',
  },
  {
    id: 'participation',
    label: 'Atuação',
    title: 'Como você quer contribuir?',
    description: 'Escolha a forma de participação que faz sentido para você.',
  },
  {
    id: 'interests',
    label: 'Interesses',
    title: 'Que tipo de negócio chama sua atenção?',
    description:
      'Selecione os segmentos em que você tem interesse ou experiência.',
  },
  {
    id: 'stages',
    label: 'Estágios',
    title: 'Em que momento você costuma investir ou atuar?',
    description: 'Você pode escolher mais de uma opção.',
  },
  {
    id: 'investment',
    label: 'Investimento',
    title: 'Qual é o seu perfil de investimento?',
    description:
      'Esses valores ajudam a conhecer o tamanho das oportunidades que você busca.',
  },
  {
    id: 'market',
    label: 'Negócios e regiões',
    title: 'Que tipo de negócio você procura?',
    description: 'Conte quais modelos e regiões despertam seu interesse.',
  },
  {
    id: 'experience',
    label: 'Experiência',
    title: 'Qual é o seu perfil?',
    description:
      'Sua experiência também pode fazer a diferença para uma startup.',
  },
  {
    id: 'history',
    label: 'Histórico',
    title: 'Conte um pouco da sua experiência',
    description: 'Quem está começando também tem espaço por aqui.',
  },
  {
    id: 'availability',
    label: 'Disponibilidade',
    title: 'Quanto tempo você pode dedicar?',
    description:
      'Você poderá atualizar sua disponibilidade pelo perfil, sem refazer o cadastro.',
  },
  {
    id: 'offers',
    label: 'Contribuições',
    title: 'Além do investimento, como você pode ajudar?',
    description: 'Uma boa conexão pode ir muito além do capital.',
  },
  {
    id: 'preferences',
    label: 'Preferências',
    title: 'Que startup você gostaria de conhecer?',
    description:
      'Essas informações poderão ajudar a encontrar startups com características alinhadas ao seu perfil.',
  },
  {
    id: 'review',
    label: 'Revisão',
    title: 'Seu perfil está pronto?',
    description: 'Confira suas informações. Você pode editar cada seção.',
  },
  {
    id: 'consent',
    label: 'Consentimentos',
    title: 'Uma conexão começa com confiança',
    description:
      'Conheça os termos e escolha como seus dados poderão ser utilizados.',
  },
] as const;
export type InvestorStep = (typeof investorSteps)[number]['id'];
export type InvestorErrors = Partial<Record<keyof InvestorDraft, string>>;
export function validateInvestor(
  step: InvestorStep,
  data: InvestorDraft,
): InvestorErrors {
  const errors: InvestorErrors = {};
  function required(...keys: (keyof InvestorDraft)[]) {
    for (const key of keys) {
      const value = data[key];
      if (
        value === null ||
        value === false ||
        (typeof value === 'string' && !value.trim()) ||
        (Array.isArray(value) && !value.length)
      )
        errors[key] = 'Campo obrigatório';
    }
  }
  switch (step) {
    case 'about':
      required('name', 'state', 'cityId');
      if (data.linkedin && !/^https?:\/\/[^\s]+$/i.test(data.linkedin))
        errors.linkedin = 'Use um endereço com https://';
      break;
    case 'participation':
      required('participation');
      break;
    case 'interests':
      required('segments');
      if (data.segments.some((value) => !supportedSegment(value)))
        errors.segments =
          'Remova os segmentos ainda não aceitos pelo servidor.';
      break;
    case 'stages':
      required('stages');
      break;
    case 'investment':
      if (data.participation !== 'mentor') {
        required('ticketMin', 'ticketMax');
        for (const key of ['ticketMin', 'ticketMax'] as const) {
          const value = data[key];
          if (value !== null && (value < 0 || value > 1e12))
            errors[key] = 'Informe um valor entre zero e R$ 1 trilhão';
        }
        if (
          data.ticketMin !== null &&
          data.ticketMax !== null &&
          data.ticketMax < data.ticketMin
        )
          errors.ticketMax = 'O máximo deve ser igual ou maior que o mínimo';
      }
      break;
    case 'market':
      required('businessModels', 'regions');
      if (data.businessModels.some((value) => !supportedModel(value)))
        errors.businessModels =
          'Remova os modelos ainda não aceitos pelo servidor.';
      if (
        data.regions.includes('international') ||
        (data.regions.some((value) => value !== 'northeast') &&
          !['north', 'northeast', 'central_west', 'southeast', 'south'].every(
            (value) => data.regions.includes(value),
          ))
      )
        errors.regions =
          'O servidor aceita Nordeste ou abrangência nacional. Remova as regiões indisponíveis.';
      break;
    case 'experience':
      required('expertise');
      if (data.participation !== 'mentor') required('risk');
      if (data.participation !== 'mentor' && data.risk === 'early_stage')
        errors.risk = 'Escolha conservador, moderado ou arrojado.';
      break;
    case 'history':
      required('history');
      break;
    case 'availability':
      required('frequency', 'interactions');
      if (data.acceptsMentoring === null)
        errors.acceptsMentoring = 'Escolha uma opção';
      if (data.participation !== 'mentor') required('openInvestment');
      break;
    case 'offers':
      required('offers');
      break;
    case 'consent':
      required('termsAccepted', 'privacyAcknowledged');
      break;
  }
  return errors;
}

export interface SavedInvestor {
  activity?: InvestorConnectionEvent[];
  moderationNotes?: string[];
  legalVersion?: string;
  version: 1;
  data: InvestorDraft;
  step: InvestorStep;
  completed: InvestorStep[];
  savedAt: string;
  status: 'draft' | 'in_review' | 'approved' | 'changes_requested' | 'rejected';
  consent?: {
    user: string;
    version: string;
    acceptedAt: string;
    terms: boolean;
    privacy: boolean;
    matching: boolean;
  };
}

export function investorSubmission(data: InvestorDraft) {
  return {
    identity: {
      name: data.name,
      title: data.title,
      bio: data.bio,
      photo: data.photo,
      linkedin: data.linkedin,
      location: {
        state: data.state,
        cityId: data.cityId,
        cityName: data.cityName,
      },
    },
    roles:
      data.participation === 'both'
        ? ['investor', 'mentor']
        : [data.participation],
    interests: {
      segments: data.segments,
      stages: data.stages,
      models: data.businessModels,
      regions: data.regions,
      preferences: data.preferences,
    },
    investment:
      data.participation === 'mentor'
        ? null
        : {
            ticketMin: data.ticketMin,
            ticketMax: data.ticketMax,
            risk: data.risk,
            open: data.openInvestment,
          },
    experience: {
      areas: data.expertise,
      history: data.history,
      details:
        data.history === 'yes'
          ? {
              investmentCount: data.investmentCount,
              description: data.experience,
              sectors: data.previousSectors,
            }
          : null,
    },
    availability: {
      frequency: data.frequency,
      interactions: data.interactions,
      acceptsMentoring: data.acceptsMentoring,
    },
    contributions: data.offers,
  };
}
export interface InvestorConnectionEvent {
  investorId: string;
  startupId: string;
  actorUserId: string;
  occurredAt: string;
  type:
    | 'startup_viewed'
    | 'interest_expressed'
    | 'connection_accepted'
    | 'meeting_scheduled'
    | 'meeting_held'
    | 'proposal_sent'
    | 'investment_completed';
}
