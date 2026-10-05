import { get, set } from 'idb-keyval';
import { z } from 'zod';
import { apiRequest } from '@/shared/services/api';
import { createDraft } from '@/features/startup-onboarding/model/types';
import type { SavedDraft } from '@/features/startup-onboarding/services/draftStorage';
import {
  createInvestorDraft,
  type SavedInvestor,
} from '@/features/investor-onboarding/model/investor';
import {
  registrationSegments,
  registrationModels,
  registrationRegions,
  registrationGrowthPeriods,
  registrationNeeds,
  registrationHelpAreas,
} from '@/shared/config/registrationCatalogs';
import { getSession } from './session';
import { logoFile, uploadStartupFile } from './startupUploads';
import { investmentPurposes } from '@/features/startup-onboarding/data/catalogs';
export { logout } from './session';

const stages: Record<string, string> = {
  ideacao: 'ideation',
  validacao: 'validation',
  mvp: 'mvp',
  tracao: 'early_traction',
  crescimento: 'growth',
  escala: 'scale',
};
const reverse = (catalog: Record<string, string>, value: string) =>
  Object.keys(catalog).find((key) => catalog[key] === value) ?? value;
const numeric = z
  .union([z.number(), z.string()])
  .transform(Number)
  .pipe(z.number().finite())
  .nullish();
const base = {
  id: z.string(),
  atualizadoEm: z.string(),
  statusModeracao: z.string(),
};
export const startupSchema = z.object({
  ...base,
  nomeFantasia: z.string(),
  logoUrl: z.string().nullish(),
  apresentacaoUrl: z.string().nullish(),
  segmento: z.string(),
  estagio: z.string(),
  regiao: z.string().nullish(),
  descricaoCurta: z.string().nullish(),
  siteUrl: z.string().nullish(),
  videoApresentacaoUrl: z.string().nullish(),
  linksSociais: z
    .object({
      linkedin: z.string().optional(),
      instagram: z.string().optional(),
      outros: z.array(z.string()).optional(),
    })
    .nullish(),
  estado: z.string().nullish(),
  cidade: z.string().nullish(),
  segmentosSecundarios: z.array(z.string()).optional(),
  regioesAtuacao: z.array(z.string()).optional(),
  regioesCrescimento: z.array(z.string()).optional(),
  metricaCrescimento: z.string().nullish(),
  periodoComparacaoCrescimento: z.string().nullish(),
  descricaoEvolucao: z.string().nullish(),
  buscaInvestimento: z.boolean().optional(),
  necessidadesAdicionais: z.array(z.string()).optional(),
  modeloNegocio: z.string(),
  mercadoAlvo: z.string().nullish(),
  numeroClientes: numeric,
  faturamentoMensal: numeric,
  capitalProcurado: numeric,
  taxaCrescimentoPct: numeric,
  descricaoPitch: z.string().nullish(),
  tamanhoEquipe: numeric,
  finalidadeInvestimento: z.string().nullish(),
  canvasJson: z.record(z.string(), z.unknown()).nullish(),
});
export const investorSchema = z.object({
  ...base,
  nome: z.string(),
  tipoInvestidor: z.enum(['anjo', 'mentor', 'anjo_mentor']),
  ticketMinimo: numeric,
  ticketMaximo: numeric,
  perfilRisco: z.string().nullish(),
  bio: z.string().nullish(),
  tituloProfissional: z.string().nullish(),
  linkedinUrl: z.string().nullish(),
  estado: z.string().nullish(),
  cidade: z.string().nullish(),
  areasAjuda: z.array(z.string()).optional(),
  disponibilidade: z.string().nullish(),
  jaAtuouComStartups: z.boolean().optional(),
  numeroAproximadoInvestimentos: numeric,
  descricaoExperiencia: z.string().nullish(),
  setoresAtuacao: z.array(z.string()).optional(),
  anosExperiencia: numeric,
  segmentosInteresse: z.array(z.string()),
  estagiosInteresse: z.array(z.string()),
  regioesInteresse: z.array(z.string()),
  modelosInteresse: z.array(z.string()),
});
const key = (id: string, role: string) => `juntai:profile-draft:${role}:${id}`;

export async function loadProfile(
  remoteProfile?: z.infer<typeof startupSchema>,
): Promise<SavedDraft | null> {
  const session = getSession();
  if (session?.usuario.tipoPerfil !== 'startup') return null;
  const remote =
    remoteProfile ??
    startupSchema.parse(
      await (await apiRequest('auth/profile', { authenticated: true })).json(),
    );
  if (getSession()?.token !== session.token) return null;
  const local = await get<SavedDraft>(key(session.usuario.id, 'startup'));
  if (local)
    return {
      ...local,
      statusModeracao: remote.statusModeracao,
      data: {
        ...local.data,
        logoUrl: remote.logoUrl ?? '',
        apresentacaoUrl: remote.apresentacaoUrl ?? '',
      },
    };
  const data = createDraft();
  data.name = remote.nomeFantasia;
  data.ownerName = session.usuario.nome;
  data.publicName = remote.nomeFantasia;
  data.logoUrl = remote.logoUrl ?? '';
  data.apresentacaoUrl = remote.apresentacaoUrl ?? '';
  data.segment = reverse(registrationSegments, remote.segmento);
  data.stage = stages[remote.estagio] ?? remote.estagio;
  data.businessModels = [reverse(registrationModels, remote.modeloNegocio)];
  data.primaryModel = data.businessModels[0] ?? '';
  data.monthlyRevenue = remote.faturamentoMensal ?? null;
  data.investmentPurposes = (remote.finalidadeInvestimento ?? '')
    .split(';')
    .map((value) => value.trim())
    .filter(Boolean)
    .map(
      (value) =>
        investmentPurposes.find((option) => option.label === value)?.value ??
        '',
    )
    .filter(Boolean);
  data.targetMarket = remote.mercadoAlvo ?? '';
  data.customers = remote.numeroClientes ?? null;
  data.capital = remote.capitalProcurado ?? null;
  data.seekingInvestment = (data.capital ?? 0) > 0 ? 'yes' : 'no';
  data.growthPercent = remote.taxaCrescimentoPct ?? null;
  data.pitchText = remote.descricaoPitch ?? '';
  data.registrationRegion = remote.regiao ?? '';
  data.description = remote.descricaoCurta ?? '';
  data.website = remote.siteUrl ?? '';
  data.videoUrl = remote.videoApresentacaoUrl ?? '';
  data.linkedin = remote.linksSociais?.linkedin ?? '';
  data.instagram = remote.linksSociais?.instagram ?? '';
  data.otherLinks = (remote.linksSociais?.outros ?? []).map((url, index) => ({
    id: `remote-${index}`,
    url,
  }));
  data.state = remote.estado ?? '';
  data.cityName = remote.cidade ?? '';
  data.secondarySegments = (remote.segmentosSecundarios ?? []).map((value) =>
    reverse(registrationSegments, value),
  );
  data.operatingRegions = (remote.regioesAtuacao ?? []).map((value) =>
    reverse(registrationRegions, value),
  );
  data.targetRegions = (remote.regioesCrescimento ?? []).map((value) =>
    reverse(registrationRegions, value),
  );
  data.growthPeriod = reverse(
    registrationGrowthPeriods,
    remote.periodoComparacaoCrescimento ?? '',
  );
  data.growthMetric = reverse(
    { revenue: 'receita', customers: 'clientes', both: 'clientes_e_receita' },
    remote.metricaCrescimento ?? '',
  );
  data.growthNotes = remote.descricaoEvolucao ?? '';
  if (remote.buscaInvestimento !== undefined)
    data.seekingInvestment = remote.buscaInvestimento ? 'yes' : 'no';
  data.needs = (remote.necessidadesAdicionais ?? []).map((value) =>
    value === 'conexoes_mercado'
      ? 'market_access'
      : reverse(registrationNeeds, value),
  );
  data.exactTeamSize = remote.tamanhoEquipe ?? null;
  const canvas = remote.canvasJson ?? {};
  for (const field of Object.keys(
    data.canvas,
  ) as (keyof typeof data.canvas)[]) {
    if (typeof canvas[field] === 'string') data.canvas[field] = canvas[field];
  }
  data.problem = typeof canvas.problema === 'string' ? canvas.problema : '';
  data.solution = typeof canvas.solucao === 'string' ? canvas.solucao : '';
  return {
    version: 1,
    statusModeracao: remote.statusModeracao,
    data,
    step: 'about',
    completed: [],
    savedAt: remote.atualizadoEm,
    legalVersion: '',
    attachment: null,
    previewCompletedAt: null,
  };
}

export async function loadInvestorProfile(): Promise<SavedInvestor | null> {
  const session = getSession();
  if (session?.usuario.tipoPerfil !== 'investidor') return null;
  const remote = investorSchema.parse(
    await (await apiRequest('auth/profile', { authenticated: true })).json(),
  );
  if (getSession()?.token !== session.token) return null;
  const local = await get<SavedInvestor>(key(session.usuario.id, 'investidor'));
  const status =
    remote.statusModeracao === 'aprovado'
      ? 'approved'
      : remote.statusModeracao === 'rejeitado'
        ? 'rejected'
        : 'in_review';
  if (local) return { ...local, status };
  const data = createInvestorDraft();
  data.name = remote.nome;
  data.bio = remote.bio ?? '';
  data.title = remote.tituloProfissional ?? '';
  data.linkedin = remote.linkedinUrl ?? '';
  data.state = remote.estado ?? '';
  data.cityName = remote.cidade ?? '';
  data.expertise = (remote.areasAjuda ?? []).map((value) =>
    reverse(registrationHelpAreas, value),
  );
  data.availability = remote.disponibilidade ?? '';
  data.history =
    remote.jaAtuouComStartups === undefined
      ? ''
      : remote.jaAtuouComStartups
        ? 'yes'
        : 'no';
  data.exactInvestmentCount = remote.numeroAproximadoInvestimentos ?? null;
  data.experience = remote.descricaoExperiencia ?? '';
  data.previousSectors = (remote.setoresAtuacao ?? []).map((value) =>
    reverse(registrationSegments, value),
  );
  data.experienceYears = remote.anosExperiencia ?? null;
  data.participation = {
    anjo: 'investor',
    mentor: 'mentor',
    anjo_mentor: 'both',
  }[remote.tipoInvestidor];
  data.ticketMin = remote.ticketMinimo ?? null;
  data.ticketMax = remote.ticketMaximo ?? null;
  data.risk =
    (
      {
        conservador: 'conservative',
        moderado: 'moderate',
        arrojado: 'bold',
      } as Record<string, string>
    )[remote.perfilRisco ?? ''] ?? '';
  data.segments = remote.segmentosInteresse.map((value) =>
    reverse(registrationSegments, value),
  );
  data.stages = remote.estagiosInteresse.map((value) => stages[value] ?? value);
  data.businessModels = remote.modelosInteresse.map((value) =>
    reverse(registrationModels, value),
  );
  data.regions = remote.regioesInteresse.flatMap((value) =>
    value === 'nacional'
      ? ['north', 'northeast', 'central_west', 'southeast', 'south']
      : [reverse(registrationRegions, value)],
  );
  return {
    version: 1,
    data,
    step: 'about',
    completed: [],
    savedAt: remote.atualizadoEm,
    status,
  };
}

async function saveLocalProfile(
  role: 'startup' | 'investidor',
  profile: SavedDraft | SavedInvestor,
) {
  const session = getSession();
  if (session?.usuario.tipoPerfil !== role)
    throw new Error('Entre novamente para salvar seu perfil.');
  await apiRequest('auth/me', { authenticated: true });
  if (getSession()?.token !== session.token)
    throw new Error('Sua sessão mudou. Entre novamente.');
  await set(key(session.usuario.id, role), profile);
}
export async function saveProfile(profile: SavedDraft) {
  const session = getSession();
  if (!session || session.usuario.tipoPerfil !== 'startup')
    throw new Error('Entre novamente para salvar seu perfil.');
  const data = { ...profile.data };
  await apiRequest('auth/me', { authenticated: true });
  if (data.logo) {
    data.logoUrl = await uploadStartupFile(
      'logo',
      logoFile(data.logo),
      session.token,
      'logo',
    );
    data.logo = '';
  }
  if (profile.attachment) {
    data.apresentacaoUrl = await uploadStartupFile(
      'apresentacao',
      profile.attachment,
      session.token,
      profile.attachment.name,
    );
  }
  const next = {
    ...profile,
    data,
    attachment: null,
    savedAt: new Date().toISOString(),
  };
  await saveLocalProfile('startup', next);
  return next;
}
export const saveInvestorProfile = (profile: SavedInvestor) =>
  saveLocalProfile('investidor', profile);
