import { z } from 'zod';
import {
  startupSchema,
  investorSchema,
} from '@/features/auth/services/profiles';
import { apiRequest } from '@/shared/services/api';
import { getSession } from '@/features/auth/services/session';
import { loadProfile } from '@/features/auth/services/profiles';
import { profileCompleteness } from '@/features/startup-profile/model/profile';

export type Startup = z.infer<typeof startupSchema>;
export type Investor = z.infer<typeof investorSchema>;
export type Dashboard =
  | { role: 'startup'; profile: Startup; completion?: CompletionItem[] }
  | { role: 'investidor'; profile: Investor };
export type CompletionItem = { label: string; filled: boolean; step?: string };

const names: Record<string, string> = {
  fintech: 'Fintech',
  healthtech: 'Healthtech',
  edtech: 'Edtech',
  agtech: 'Agtech',
  saas_b2b: 'SaaS B2B',
  ecommerce: 'E-commerce',
  marketplace: 'Marketplace',
  economia_criativa: 'Economia criativa',
  ideacao: 'Ideação',
  validacao: 'Validação',
  mvp: 'MVP',
  tracao: 'Tração',
  crescimento: 'Crescimento',
  escala: 'Escala',
  recife: 'Recife',
  porto_digital: 'Porto Digital',
  nordeste: 'Nordeste',
  nacional: 'Nacional',
  b2b: 'B2B',
  b2c: 'B2C',
  b2b2c: 'B2B2C',
  assinatura_saas: 'Assinatura / SaaS',
  anjo: 'Investidor anjo',
  mentor: 'Mentor',
  anjo_mentor: 'Investidor · Mentor',
};
export const label = (value: string) => names[value] ?? value;
export const labels = (values: string[]) =>
  values.map(label).join(' · ') || 'Ainda não informado';
export const money = (value: number | null | undefined) =>
  value == null
    ? 'Ainda não informado'
    : new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: 0,
      }).format(value);
export const dashboardName = (data: Dashboard) =>
  data.role === 'startup' ? data.profile.nomeFantasia : data.profile.nome;
export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
export function moderation(status: string) {
  switch (status) {
    case 'aprovado':
      return {
        badge: 'Aprovado',
        title: 'Seu perfil está aprovado',
        description:
          'Seu perfil passou pela avaliação. A área de conexões acompanhará a disponibilidade das recomendações.',
        approved: true,
      };
    case 'pendente':
      return {
        badge: 'Em avaliação',
        title: 'Seu perfil está em avaliação',
        description:
          'Nosso time está analisando suas informações. A aprovação do perfil é necessária para liberar o matchmaking.',
        approved: false,
      };
    case 'rejeitado':
      return {
        badge: 'Precisa de ajustes',
        title: 'Precisamos de alguns ajustes',
        description:
          'Revise as informações do seu perfil. As observações da moderação ainda não estão disponíveis nesta área.',
        approved: false,
      };
    case 'suspenso':
      return {
        badge: 'Suspenso',
        title: 'Seu perfil está suspenso',
        description:
          'As conexões ficam indisponíveis enquanto seu perfil estiver suspenso.',
        approved: false,
      };
    default:
      return {
        badge: 'Status não disponível',
        title: 'Não foi possível identificar o status do perfil',
        description:
          'As conexões ficam indisponíveis até a confirmação da aprovação.',
        approved: false,
      };
  }
}
export function completionItems(data: Dashboard): CompletionItem[] {
  if (data.role === 'startup') {
    if (data.completion) return data.completion;
    const p = data.profile;
    return [
      {
        label: 'Informações da startup',
        filled: !!p.nomeFantasia.trim() && !!p.regiao,
      },
      { label: 'Segmento e estágio', filled: !!p.segmento && !!p.estagio },
      { label: 'Modelo de negócio', filled: !!p.modeloNegocio },
      { label: 'Mercado', filled: !!p.mercadoAlvo?.trim() },
      {
        label: 'Objetivo de investimento',
        filled:
          p.capitalProcurado != null &&
          (p.capitalProcurado === 0 || !!p.finalidadeInvestimento?.trim()),
      },
      { label: 'Pitch', filled: !!p.descricaoPitch?.trim() },
      { label: 'Tamanho da equipe', filled: (p.tamanhoEquipe ?? 0) > 0 },
    ];
  }
  const p = data.profile;
  return [
    { label: 'Apresentação', filled: !!p.nome.trim() && !!p.bio?.trim() },
    {
      label: 'Segmentos de interesse',
      filled: p.segmentosInteresse.length > 0,
    },
    { label: 'Estágios de interesse', filled: p.estagiosInteresse.length > 0 },
    { label: 'Regiões', filled: p.regioesInteresse.length > 0 },
    { label: 'Modelos de negócio', filled: p.modelosInteresse.length > 0 },
    { label: 'Experiência', filled: p.anosExperiencia != null },
    ...(p.tipoInvestidor === 'mentor'
      ? []
      : [
          {
            label: 'Faixa de investimento',
            filled:
              p.ticketMinimo != null &&
              p.ticketMaximo != null &&
              p.ticketMaximo >= p.ticketMinimo,
          },
        ]),
  ];
}
export async function loadDashboard(): Promise<Dashboard> {
  const session = getSession();
  const raw: unknown = await (
    await apiRequest('auth/profile', { authenticated: true })
  ).json();
  if (!session || getSession()?.token !== session.token)
    throw new Error('Sua sessão mudou. Entre novamente.');
  if (session.usuario.tipoPerfil === 'startup') {
    const profile = startupSchema.parse(raw);
    const saved = await loadProfile(profile);
    if (!saved || getSession()?.token !== session.token)
      throw new Error('Sua sessão mudou. Entre novamente.');
    return {
      role: 'startup',
      profile,
      completion: profileCompleteness(saved.data, saved.attachment).sections,
    };
  }
  if (session.usuario.tipoPerfil === 'investidor')
    return { role: 'investidor', profile: investorSchema.parse(raw) };
  throw new Error('Perfil não disponível.');
}
