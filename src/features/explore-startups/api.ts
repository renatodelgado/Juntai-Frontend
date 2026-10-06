import { z } from 'zod';
import { apiRequest } from '@/shared/services/api';
import { startupSchema } from '@/features/auth/services/profiles';
import type { AuthUser } from '@/features/auth/services/session';
import type { Startup } from './model';

export const segmentLabels: Record<string, string> = {
  fintech: 'Fintech',
  healthtech: 'Healthtech',
  edtech: 'Edtech',
  agtech: 'Agtech',
  saas_b2b: 'SaaS B2B',
  marketplace: 'Marketplace',
  ecommerce: 'E-commerce',
  economia_criativa: 'Economia criativa',
};
const stages: Record<string, string> = {
  ideacao: 'Ideação',
  validacao: 'Validação',
  mvp: 'MVP',
  tracao: 'Tração inicial',
  crescimento: 'Crescimento',
  escala: 'Escala',
};
const regions: Record<string, string> = {
  norte: 'Norte',
  nordeste: 'Nordeste',
  centro_oeste: 'Centro-Oeste',
  sudeste: 'Sudeste',
  sul: 'Sul',
};
const models: Record<string, string[]> = {
  b2b: ['B2B'],
  b2c: ['B2C'],
  b2b2c: ['B2B2C'],
  marketplace: ['Marketplace'],
  assinatura_saas: ['SaaS', 'Assinatura'],
};
const needs: Record<string, string> = {
  mentoria: 'Mentoria',
  conexoes_mercado: 'Conexões de mercado',
  contratacao_talentos: 'Contratação de talentos',
  parcerias_estrategicas: 'Parcerias estratégicas',
  outro: 'Outro',
};
const scores = new Map<string, number>();
const schema = startupSchema.extend({ criadoEm: z.string() });
type RemoteStartup = z.infer<typeof schema>;
export function toDiscoveryStartup(
  remote: RemoteStartup,
  userId: string,
): Startup {
  const key = userId + ':' + remote.id;
  if (!scores.has(key)) scores.set(key, Math.floor(Math.random() * 101));
  const canvas = remote.canvasJson || {};
  const text = (key: string) =>
    typeof canvas[key] === 'string' ? (canvas[key] as string) : '';
  return {
    id: remote.id,
    name: remote.nomeFantasia,
    logoUrl: remote.logoUrl ?? undefined,
    presentationUrl: remote.apresentacaoUrl ?? undefined,
    siteUrl: remote.siteUrl ?? undefined,
    tagline: remote.descricaoCurta || '',
    description:
      remote.descricaoPitch || remote.descricaoCurta || 'Não informado',
    segment: segmentLabels[remote.segmento] || remote.segmento,
    stage: stages[remote.estagio] || remote.estagio,
    location: {
      city: remote.cidade || 'Cidade não informada',
      state: remote.estado || '',
      region:
        (remote.regioesAtuacao || [])
          .map((value) => regions[value] || value)
          .join(' · ') || 'Região não informada',
    },
    businessModel: models[remote.modeloNegocio] || [remote.modeloNegocio],
    targetMarket: remote.mercadoAlvo || 'Não informado',
    seekingInvestment: remote.buscaInvestimento,
    investmentAmount: remote.capitalProcurado ?? undefined,
    investmentPurpose: remote.finalidadeInvestimento ?? undefined,
    problem: text('problema') || 'Não informado',
    solution: text('solucao') || 'Não informado',
    needs: (remote.necessidadesAdicionais || []).map(
      (value) => needs[value] || value,
    ),
    traction: remote.descricaoEvolucao || undefined,
    team:
      remote.tamanhoEquipe == null
        ? undefined
        : remote.tamanhoEquipe + ' pessoas na equipe',
    metrics: {
      clients: remote.numeroClientes ?? undefined,
      revenue: remote.faturamentoMensal ?? undefined,
      growth: remote.taxaCrescimentoPct ?? undefined,
    },
    canvas: Object.fromEntries(
      Object.entries(canvas).filter(
        ([key, value]) =>
          [
            'value',
            'customers',
            'channels',
            'relationships',
            'revenue',
            'resources',
            'activities',
            'partners',
            'costs',
          ].includes(key) &&
          typeof value === 'string' &&
          value.trim(),
      ),
    ),
    pitch: remote.descricaoPitch || undefined,
    createdAt: remote.criadoEm,
    color: '#F3F1F8',
    variant: 'standard',
    compatibility: scores.get(key),
    compatibilityFactors: [
      'Compatibilidade ilustrativa, gerada aleatoriamente.',
    ],
  };
}
export const startupRepository = {
  async list(user: AuthUser, signal?: AbortSignal): Promise<Startup[]> {
    const response = await apiRequest('startups', {
      authenticated: true,
      signal,
    });
    return z
      .array(schema)
      .parse(await response.json())
      .filter((item) => item.statusModeracao === 'aprovado')
      .map((item) => toDiscoveryStartup(item, user.id));
  },
};

export const interestSchema = z.object({
  logoUrl: z.string().nullish(),
  startupId: z.string(),
  startupName: z.string(),
  usuarioId: z.string(),
  createdAt: z.string(),
});
export type StartupInterest = z.infer<typeof interestSchema>;
export const interestsApi = {
  async list(signal?: AbortSignal) {
    return z.array(interestSchema).parse(
      await (
        await apiRequest('startups/interesses', {
          authenticated: true,
          signal,
        })
      ).json(),
    );
  },
  async confirm(startupId: string) {
    return interestSchema.parse(
      await (
        await apiRequest(
          'startups/' + encodeURIComponent(startupId) + '/interesse',
          { authenticated: true, method: 'POST' },
        )
      ).json(),
    );
  },
};
