import { z } from 'zod';
import { apiRequest } from '@/shared/services/api';
import type { StartupDraft } from '@/features/startup-onboarding/model/types';
import type { InvestorDraft } from '@/features/investor-onboarding/model/investor';
import { investmentPurposes } from '@/features/startup-onboarding/data/catalogs';
import {
  registrationSegments as segments,
  registrationModels as models,
} from '@/shared/config/registrationCatalogs';
export {
  supportedSegment,
  supportedModel,
} from '@/shared/config/registrationCatalogs';

export const apiRegions = [
  { value: 'recife', label: 'Recife' },
  { value: 'porto_digital', label: 'Porto Digital' },
  { value: 'nordeste', label: 'Nordeste' },
  { value: 'nacional', label: 'Nacional' },
];
const stages: Record<string, string> = {
  ideation: 'ideacao',
  validation: 'validacao',
  mvp: 'mvp',
  early_traction: 'tracao',
  growth: 'crescimento',
  scale: 'escala',
};
function map(value: string, catalog: Record<string, string>, label: string) {
  const mapped = Object.hasOwn(catalog, value) ? catalog[value] : undefined;
  if (!mapped)
    throw new Error(
      `${label}: a opção “${value}” ainda não é aceita pelo servidor. Volte à etapa correspondente e escolha uma opção compatível.`,
    );
  return mapped;
}
const money = z.number().finite().min(0).max(999999999999.99);
const credentials = z.object({
  nome: z.string().trim().min(1, 'Informe o nome completo.').max(150),
  email: z.email('Informe um e-mail válido.').max(150),
  senha: z.string().min(6, 'Use uma senha com pelo menos 6 caracteres.'),
});
export interface RegistrationDetails {
  ownerName: string;
  region: string;
  primaryModel: string;
  monthlyRevenue: number | null;
  teamSize: number | null;
}
export function startupPayload(
  data: StartupDraft,
  email: string,
  senha: string,
  details: RegistrationDetails,
) {
  const identity = credentials.parse({
    nome: details.ownerName,
    email: email.trim().toLowerCase(),
    senha,
  });
  const primaryModel =
    details.primaryModel ||
    (data.businessModels.length === 1 ? data.businessModels[0]! : '');
  if (!data.businessModels.includes(primaryModel))
    throw new Error(
      'Escolha o modelo principal entre os modelos de negócio selecionados.',
    );
  return {
    ...identity,
    nomeFantasia: z
      .string()
      .trim()
      .min(1)
      .max(150)
      .parse(data.publicName.trim() || data.name),
    segmento: map(data.segment, segments, 'Segmento principal'),
    estagio: map(data.stage, stages, 'Estágio'),
    regiao: z
      .enum(['recife', 'porto_digital', 'nordeste', 'nacional'], {
        error: 'Escolha a região do cadastro.',
      })
      .parse(details.region),
    modeloNegocio: map(primaryModel, models, 'Modelo de negócio'),
    mercadoAlvo: z
      .string()
      .max(200, 'Descreva o mercado-alvo em até 200 caracteres.')
      .parse(data.targetMarket.trim()),
    ...(!data.hideCustomers && data.customers !== null
      ? {
          numeroClientes: z
            .number()
            .int()
            .min(0)
            .max(2147483647)
            .parse(data.customers),
        }
      : {}),
    ...(data.revenue !== 'undisclosed' && details.monthlyRevenue !== null
      ? { faturamentoMensal: money.parse(details.monthlyRevenue) }
      : data.revenue === 'none'
        ? { faturamentoMensal: 0 }
        : {}),
    // O contrato não define a métrica nem o período da taxa. Não enviar uma taxa ambígua.
    capitalProcurado: money.parse(
      data.seekingInvestment === 'yes' ? data.capital : 0,
    ),
    finalidadeInvestimento:
      data.seekingInvestment === 'yes'
        ? data.investmentPurposes
            .map(
              (value) =>
                investmentPurposes.find((item) => item.value === value)
                  ?.label ?? value,
            )
            .join('; ')
        : '',
    ...(details.teamSize !== null
      ? {
          tamanhoEquipe: z
            .number()
            .int()
            .min(1)
            .max(32767)
            .parse(details.teamSize),
        }
      : data.teamSize === '1'
        ? { tamanhoEquipe: 1 }
        : {}),
    descricaoPitch: data.pitchText.trim(),
    canvasJson: {
      ...data.canvas,
      problema: data.problem.trim(),
      solucao: data.solution.trim(),
    },
  };
}
export function investorPayload(
  data: InvestorDraft,
  email: string,
  senha: string,
  years: number | null,
) {
  const identity = credentials.parse({
    nome: data.name,
    email: email.trim().toLowerCase(),
    senha,
  });
  const allBrazil = [
    'north',
    'northeast',
    'central_west',
    'southeast',
    'south',
  ];
  const national = allBrazil.every((value) => data.regions.includes(value));
  const regions = national
    ? data.regions
        .filter((value) => !allBrazil.includes(value))
        .concat('nacional')
    : data.regions;
  const mentor = data.participation === 'mentor';
  const ticketMinimo = mentor ? undefined : money.parse(data.ticketMin);
  const ticketMaximo = mentor ? undefined : money.parse(data.ticketMax);
  if (
    ticketMinimo !== undefined &&
    ticketMaximo !== undefined &&
    ticketMaximo < ticketMinimo
  )
    throw new Error('O ticket máximo deve ser igual ou maior que o mínimo.');
  return {
    ...identity,
    tipoInvestidor: map(
      data.participation,
      { investor: 'anjo', mentor: 'mentor', both: 'anjo_mentor' },
      'Atuação',
    ),
    ...(!mentor
      ? {
          ticketMinimo,
          ticketMaximo,
          perfilRisco: map(
            data.risk,
            {
              conservative: 'conservador',
              moderate: 'moderado',
              bold: 'arrojado',
            },
            'Perfil de risco',
          ),
        }
      : {}),
    ...(years !== null
      ? { anosExperiencia: z.number().int().min(0).max(32767).parse(years) }
      : {}),
    bio: data.bio.trim(),
    segmentosInteresse: data.segments.map((value) =>
      map(value, segments, 'Segmentos de interesse'),
    ),
    estagiosInteresse: data.stages.map((value) =>
      map(value, stages, 'Estágios de interesse'),
    ),
    regioesInteresse: regions.map((value) =>
      map(
        value,
        {
          northeast: 'nordeste',
          recife: 'recife',
          porto_digital: 'porto_digital',
          nacional: 'nacional',
        },
        'Regiões de interesse',
      ),
    ),
    modelosInteresse: [
      ...new Set(
        data.businessModels.map((value) =>
          map(value, models, 'Modelos de negócio'),
        ),
      ),
    ],
  };
}
export function registrationError(error: unknown) {
  if (error instanceof TypeError)
    return 'Não foi possível conectar ao servidor. Confira sua conexão e se a API está disponível antes de tentar novamente.';
  if (error instanceof z.ZodError)
    return error.issues.map((issue) => issue.message).join(' ');
  return error instanceof Error
    ? error.message
    : 'Não conseguimos enviar o cadastro. Tente novamente.';
}
export async function registerRemote(
  path: 'startups' | 'investidores',
  payload:
    ReturnType<typeof startupPayload> | ReturnType<typeof investorPayload>,
) {
  await apiRequest(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  // Cadastro não autentica. Não guardar a resposta: ela pode conter dados internos do usuário.
}
