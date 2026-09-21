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
} from '@/shared/config/registrationCatalogs';
import { getSession } from './session';
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
const startupSchema = z.object({
  ...base,
  nomeFantasia: z.string(),
  segmento: z.string(),
  estagio: z.string(),
  regiao: z.string(),
  modeloNegocio: z.string(),
  mercadoAlvo: z.string().nullish(),
  numeroClientes: numeric,
  capitalProcurado: numeric,
  taxaCrescimentoPct: numeric,
  descricaoPitch: z.string().nullish(),
  canvasJson: z.record(z.string(), z.unknown()).nullish(),
});
const investorSchema = z.object({
  ...base,
  nome: z.string(),
  tipoInvestidor: z.enum(['anjo', 'mentor', 'anjo_mentor']),
  ticketMinimo: numeric,
  ticketMaximo: numeric,
  perfilRisco: z.string().nullish(),
  bio: z.string().nullish(),
  segmentosInteresse: z.array(z.string()),
  estagiosInteresse: z.array(z.string()),
  regioesInteresse: z.array(z.string()),
  modelosInteresse: z.array(z.string()),
});
const key = (id: string, role: string) => `juntai:profile-draft:${role}:${id}`;

export async function loadProfile(): Promise<SavedDraft | null> {
  const session = getSession();
  if (session?.usuario.tipoPerfil !== 'startup') return null;
  const remote = startupSchema.parse(
    await (await apiRequest('auth/profile', { authenticated: true })).json(),
  );
  if (getSession()?.token !== session.token) return null;
  const local = await get<SavedDraft>(key(session.usuario.id, 'startup'));
  if (local) return local;
  const data = createDraft();
  data.name = remote.nomeFantasia;
  data.publicName = remote.nomeFantasia;
  data.segment = reverse(registrationSegments, remote.segmento);
  data.stage = stages[remote.estagio] ?? remote.estagio;
  data.businessModels = [reverse(registrationModels, remote.modeloNegocio)];
  data.targetMarket = remote.mercadoAlvo ?? '';
  data.customers = remote.numeroClientes ?? null;
  data.capital = remote.capitalProcurado ?? null;
  data.seekingInvestment = (data.capital ?? 0) > 0 ? 'yes' : 'no';
  data.growthPercent = remote.taxaCrescimentoPct ?? null;
  data.pitchText = remote.descricaoPitch ?? '';
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
      : value === 'nordeste'
        ? ['northeast']
        : [value],
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
export const saveProfile = (profile: SavedDraft) =>
  saveLocalProfile('startup', profile);
export const saveInvestorProfile = (profile: SavedInvestor) =>
  saveLocalProfile('investidor', profile);
