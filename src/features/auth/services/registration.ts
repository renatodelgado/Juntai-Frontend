import { z } from 'zod';
import { apiRequest } from '@/shared/services/api';
import type { StartupDraft } from '@/features/startup-onboarding/model/types';
import type { InvestorDraft } from '@/features/investor-onboarding/model/investor';
import { investmentPurposes } from '@/features/startup-onboarding/data/catalogs';
import {
  registrationSegments as segments,
  registrationModels as models,
  registrationRegions,
  registrationGrowthPeriods,
  registrationNeeds,
  registrationHelpAreas,
} from '@/shared/config/registrationCatalogs';
import { normalizeUrl } from '@/features/startup-onboarding/model/validation';
export {
  supportedSegment,
  supportedModel,
} from '@/shared/config/registrationCatalogs';

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
function optionalText(value: string, limit: number) {
  return value.trim() ? z.string().max(limit).parse(value.trim()) : undefined;
}
function optionalUrl(value: string, limit = 255) {
  return value.trim()
    ? z.string().max(limit).parse(normalizeUrl(value))
    : undefined;
}
function mappedOptions(values: string[], catalog: Record<string, string>) {
  // Opções sem equivalente continuam sinalizadas como locais no formulário.
  return [
    ...new Set(
      values
        .filter((value) => Object.hasOwn(catalog, value))
        .map((value) => catalog[value]!),
    ),
  ];
}
const money = z.number().finite().min(0).max(999999999999.99);
const credentials = z.object({
  nome: z.string().trim().min(1, 'Informe o nome completo.').max(150),
  email: z.email('Informe um e-mail válido.').max(150),
  senha: z.string().min(6, 'Use uma senha com pelo menos 6 caracteres.'),
});
export interface RegistrationDetails {
  ownerName: string;
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
    logoUrl: optionalUrl(data.logoUrl, 10000),
    apresentacaoUrl: optionalUrl(data.apresentacaoUrl, 10000),
    descricaoCurta: optionalText(data.description, 300),
    siteUrl: optionalUrl(data.website),
    linksSociais: {
      linkedin: optionalUrl(data.linkedin),
      instagram: optionalUrl(data.instagram),
      outros: data.otherLinks
        .filter((link) => link.url.trim())
        .map((link) => optionalUrl(link.url)!),
    },
    videoApresentacaoUrl: optionalUrl(data.videoUrl, 10000),
    segmentosSecundarios: data.secondarySegments.map((value) =>
      map(value, segments, 'Segmentos secundários'),
    ),
    estado: optionalText(data.state, 2),
    cidade: optionalText(data.cityName, 100),
    regioesAtuacao: data.operatingRegions.map((value) =>
      map(value, registrationRegions, 'Regiões de atuação'),
    ),
    regioesCrescimento: data.targetRegions.map((value) =>
      map(value, registrationRegions, 'Regiões de crescimento'),
    ),
    descricaoEvolucao: optionalText(data.growthNotes, 10000),
    ...(data.growthPercent !== null &&
    Object.hasOwn(registrationGrowthPeriods, data.growthPeriod) &&
    data.growthMetric
      ? {
          taxaCrescimentoPct: z
            .number()
            .finite()
            .min(-100)
            .max(9999.99)
            .parse(data.growthPercent),
          metricaCrescimento: map(
            data.growthMetric,
            {
              revenue: 'receita',
              customers: 'clientes',
              both: 'clientes_e_receita',
            },
            'Métrica de crescimento',
          ),
          periodoComparacaoCrescimento: map(
            data.growthPeriod,
            registrationGrowthPeriods,
            'Período de crescimento',
          ),
        }
      : {}),
    ...(data.seekingInvestment !== 'evaluating'
      ? { buscaInvestimento: data.seekingInvestment === 'yes' }
      : {}),
    necessidadesAdicionais: mappedOptions(data.needs, registrationNeeds),
    modeloNegocio: map(primaryModel, models, 'Modelo de negócio'),
    mercadoAlvo: z
      .string()
      .max(200, 'Descreva o mercado-alvo em até 200 caracteres.')
      .parse(data.targetMarket.trim()),
    ...(data.customers !== null
      ? {
          numeroClientes: z
            .number()
            .int()
            .min(0)
            .max(2147483647)
            .parse(data.customers),
        }
      : {}),
    ...(details.monthlyRevenue !== null
      ? { faturamentoMensal: money.parse(details.monthlyRevenue) }
      : {}),
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
    tituloProfissional: optionalText(data.title, 150),
    linkedinUrl: optionalUrl(data.linkedin),
    estado: optionalText(data.state, 2),
    cidade: optionalText(data.cityName, 100),
    areasAjuda: mappedOptions(data.expertise, registrationHelpAreas),
    ...(data.availability
      ? {
          disponibilidade: z
            .enum([
              'algumas_horas_mes',
              'algumas_horas_semana',
              'meio_periodo',
              'dedicacao_integral',
            ])
            .parse(data.availability),
        }
      : {}),
    ...(['yes', 'no'].includes(data.history)
      ? { jaAtuouComStartups: data.history === 'yes' }
      : {}),
    ...(data.history === 'yes'
      ? {
          descricaoExperiencia: optionalText(data.experience, 10000),
          setoresAtuacao: data.previousSectors.map((value) =>
            map(value, segments, 'Setores de atuação'),
          ),
          ...(data.participation !== 'mentor' &&
          (data.exactInvestmentCount !== null || data.investmentCount === 'one')
            ? {
                numeroAproximadoInvestimentos: z
                  .number()
                  .int()
                  .min(0)
                  .max(32767)
                  .parse(data.exactInvestmentCount ?? 1),
              }
            : {}),
        }
      : {}),
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
    regioesInteresse: data.regions.map((value) =>
      map(value, registrationRegions, 'Regiões de interesse'),
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
