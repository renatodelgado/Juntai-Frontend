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
import { uploadInvestorPhoto, removeInvestorPhoto } from './investorUploads';
import { investmentPurposes } from '@/features/startup-onboarding/data/catalogs';
import {
  changedFields,
  startupUpdatePayload,
  investorUpdatePayload,
} from './profileUpdates';
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
  avatarUrl: z.string().nullish(),
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
    ...(local ?? {}),
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

export async function loadInvestorProfile(
  remoteProfile?: z.infer<typeof investorSchema>,
): Promise<SavedInvestor | null> {
  const session = getSession();
  if (session?.usuario.tipoPerfil !== 'investidor') return null;
  const remote =
    remoteProfile ??
    investorSchema.parse(
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
  const data = createInvestorDraft();
  data.photo = remote.avatarUrl ?? '';
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
    ...(local ?? {}),
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
  const remote = startupSchema.parse(
    await (await apiRequest('auth/profile', { authenticated: true })).json(),
  );
  const current = await loadProfile(remote);
  if (!current) throw new Error('Sua sessão mudou. Entre novamente.');
  const patch = changedFields(
    startupUpdatePayload(current.data),
    startupUpdatePayload(data),
  );
  if (patch.canvasJson)
    patch.canvasJson = {
      ...remote.canvasJson,
      ...(patch.canvasJson as Record<string, unknown>),
    };
  for (const field of ['regioesAtuacao', 'regioesCrescimento']) {
    if (Array.isArray(patch[field]) && !patch[field].length)
      throw new Error(
        'O servidor ainda não permite remover todas as regiões. Mantenha uma região até essa correção.',
      );
  }
  if (Object.keys(patch).length)
    await apiRequest(`startups/${remote.id}`, {
      authenticated: true,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
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
  const latest = await loadProfile();
  if (!latest) throw new Error('Sua sessão mudou. Entre novamente.');
  const next = {
    ...profile,
    data: latest.data,
    statusModeracao: latest.statusModeracao,
    attachment: null,
    savedAt: latest.savedAt,
  };
  await saveLocalProfile('startup', next);
  return next;
}
export async function saveInvestorProfile(profile: SavedInvestor) {
  const session = getSession();
  if (!session || session.usuario.tipoPerfil !== 'investidor')
    throw new Error('Entre novamente para salvar seu perfil.');
  const remote = investorSchema.parse(
    await (await apiRequest('auth/profile', { authenticated: true })).json(),
  );
  const current = await loadInvestorProfile(remote);
  if (!current) throw new Error('Entre novamente para salvar seu perfil.');
  const patch = changedFields(
    investorUpdatePayload(current.data),
    investorUpdatePayload(profile.data),
  );
  if (Array.isArray(patch.regioesInteresse) && !patch.regioesInteresse.length)
    throw new Error(
      'O servidor ainda não permite remover todas as regiões. Mantenha uma região até essa correção.',
    );
  if (Object.keys(patch).length)
    await apiRequest(`investidores/${remote.id}`, {
      authenticated: true,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
  if (profile.data.photo.startsWith('data:'))
    await uploadInvestorPhoto(logoFile(profile.data.photo), session.token);
  else if (!profile.data.photo && current.data.photo)
    await removeInvestorPhoto(session.token);
  const latest = await loadInvestorProfile();
  if (!latest) throw new Error('Sua sessão mudou. Entre novamente.');
  await saveLocalProfile('investidor', {
    ...profile,
    data: latest.data,
    status: latest.status,
    savedAt: latest.savedAt,
  });
}
