import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  loadProfile,
  loadInvestorProfile,
  saveProfile,
  saveInvestorProfile,
  startupSchema,
} from './profiles';
import { createDraft } from '@/features/startup-onboarding/model/types';
import type { SavedDraft } from '@/features/startup-onboarding/services/draftStorage';

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  session: vi.fn(),
  request: vi.fn(),
  set: vi.fn(),
  upload: vi.fn(),
}));
vi.mock('idb-keyval', () => ({ get: mocks.get, set: mocks.set }));
vi.mock('./startupUploads', () => ({
  uploadStartupFile: mocks.upload,
  logoFile: () => new Blob(['logo'], { type: 'image/png' }),
}));
vi.mock('./session', () => ({ getSession: mocks.session, logout: vi.fn() }));
vi.mock('@/shared/services/api', () => ({ apiRequest: mocks.request }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.get.mockResolvedValue(undefined);
});

describe('uploads na edição do perfil', () => {
  const profile = (): SavedDraft => ({
    version: 1,
    data: createDraft(),
    step: 'about',
    completed: [],
    savedAt: '',
    legalVersion: 'teste',
    attachment: null,
    previewCompletedAt: null,
  });
  let remote: Record<string, unknown>;
  beforeEach(() => {
    mocks.session.mockReturnValue({
      token: 'sessao-ficticia',
      usuario: { id: 'usuario', nome: 'Teste', tipoPerfil: 'startup' },
    });
    remote = {
      id: 'startup-id',
      atualizadoEm: '2026-10-05T12:00:00Z',
      statusModeracao: 'pendente',
      nomeFantasia: 'Startup Teste',
      segmento: 'fintech',
      estagio: 'mvp',
      modeloNegocio: 'b2b',
    };
    mocks.request.mockImplementation(async (_path, options) => {
      if (options?.method === 'PATCH')
        Object.assign(remote, JSON.parse(options.body));
      return new Response(JSON.stringify(remote));
    });
    mocks.upload.mockImplementation(async (kind) => {
      const uploaded =
        kind === 'logo'
          ? 'https://example.com/logo.png'
          : 'https://example.com/pitch.pdf';
      remote[kind === 'logo' ? 'logoUrl' : 'apresentacaoUrl'] = uploaded;
      return uploaded;
    });
  });
  it('salva URLs dos dois uploads e não reenvia arquivos ao salvar outra seção', async () => {
    const draft = (await loadProfile())!;
    draft.data.logo = 'data:image/png;base64,dGVzdGU=';
    draft.attachment = new File(['%PDF-teste'], 'teste.pdf', {
      type: 'application/pdf',
    });
    const saved = await saveProfile(draft);
    expect(saved.data).toMatchObject({
      logo: '',
      logoUrl: 'https://example.com/logo.png',
      apresentacaoUrl: 'https://example.com/pitch.pdf',
    });
    expect(saved.attachment).toBeNull();
    expect(mocks.upload.mock.calls.map((call) => call[0])).toEqual([
      'logo',
      'apresentacao',
    ]);
    await saveProfile(saved);
    expect(mocks.upload).toHaveBeenCalledTimes(2);
    expect(mocks.set).toHaveBeenCalledWith(
      'juntai:profile-draft:startup:usuario',
      saved,
    );
  });
  it('não inicia uploads quando a autenticação falha', async () => {
    const draft = profile();
    draft.data.logo = 'data:image/png;base64,dGVzdGU=';
    mocks.request.mockRejectedValueOnce(new Error('Erro interno do servidor.'));
    await expect(saveProfile(draft)).rejects.toThrow(
      'Erro interno do servidor.',
    );
    expect(mocks.upload).not.toHaveBeenCalled();
    expect(mocks.set).not.toHaveBeenCalled();
  });
  it('envia apenas as alterações e recarrega os dados persistidos', async () => {
    const draft = (await loadProfile())!;
    draft.data.description = 'Descrição alterada';
    const saved = await saveProfile(draft);
    const call = mocks.request.mock.calls.find((c) => c[1]?.method === 'PATCH');
    expect(call?.[0]).toBe('startups/startup-id');
    expect(JSON.parse(call![1].body)).toEqual({
      descricaoCurta: 'Descrição alterada',
    });
    expect(saved.data.description).toBe('Descrição alterada');
  });
  it('não confirma nem armazena uma edição rejeitada pelo servidor', async () => {
    const draft = (await loadProfile())!;
    draft.data.description = 'Alterada';
    mocks.request.mockImplementation(async (_path, opts) => {
      if (opts?.method === 'PATCH') throw new Error('Não foi possível editar.');
      return new Response(JSON.stringify(remote));
    });
    await expect(saveProfile(draft)).rejects.toThrow(
      'Não foi possível editar.',
    );
    expect(mocks.set).not.toHaveBeenCalled();
  });
});
const base = {
  id: 'perfil-ficticio',
  atualizadoEm: '2026-10-03T12:00:00Z',
  statusModeracao: 'pendente',
};
describe('perfil com as novas colunas', () => {
  it('persiste edição de investidor via PATCH e lê o resultado remoto', async () => {
    mocks.session.mockReturnValue({
      token: 'teste',
      usuario: { id: 'investor-user', tipoPerfil: 'investidor' },
    });
    const remote = {
      ...base,
      nome: 'Investidor Teste',
      tipoInvestidor: 'anjo',
      segmentosInteresse: ['fintech'],
      estagiosInteresse: ['mvp'],
      modelosInteresse: ['b2b'],
      regioesInteresse: ['nordeste'],
      bio: 'Bio anterior',
    };
    mocks.request.mockImplementation(async (_path, opts) => {
      if (opts?.method === 'PATCH')
        Object.assign(remote, JSON.parse(opts.body));
      return new Response(JSON.stringify(remote));
    });
    const profile = (await loadInvestorProfile())!;
    profile.data.bio = 'Bio atualizada';
    await saveInvestorProfile(profile);
    const call = mocks.request.mock.calls.find((c) => c[1]?.method === 'PATCH');
    expect(call?.[0]).toBe('investidores/perfil-ficticio');
    expect(JSON.parse(call![1].body)).toEqual({ bio: 'Bio atualizada' });
    expect((await loadInvestorProfile())?.data.bio).toBe('Bio atualizada');
  });
  it('lê startup sem a antiga região e preserva apresentação e crescimento', async () => {
    mocks.session.mockReturnValue({
      token: 'sessao-ficticia',
      usuario: { id: 'usuario', tipoPerfil: 'startup' },
    });
    const remote = startupSchema.parse({
      ...base,
      nomeFantasia: 'TechFlow',
      regiao: null,
      segmento: 'fintech',
      estagio: 'mvp',
      modeloNegocio: 'b2b',
      descricaoCurta: 'Gestão financeira',
      estado: 'PE',
      cidade: 'Recife',
      regioesAtuacao: ['nordeste'],
      regioesCrescimento: ['sul'],
      taxaCrescimentoPct: '12.50',
      metricaCrescimento: 'receita',
      periodoComparacaoCrescimento: 'ultimos_6_meses',
      buscaInvestimento: false,
      faturamentoMensal: '42000.00',
      necessidadesAdicionais: ['conexoes_mercado'],
    });
    expect((await loadProfile(remote))?.data).toMatchObject({
      description: 'Gestão financeira',
      cityName: 'Recife',
      state: 'PE',
      operatingRegions: ['northeast'],
      targetRegions: ['south'],
      growthPercent: 12.5,
      growthMetric: 'revenue',
      growthPeriod: 'six_months',
      seekingInvestment: 'no',
      monthlyRevenue: 42000,
      needs: ['market_access'],
    });
  });
  it('restaura regiões, experiência e disponibilidade de investidor', async () => {
    mocks.session.mockReturnValue({
      token: 'sessao-ficticia',
      usuario: { id: 'usuario', tipoPerfil: 'investidor' },
    });
    mocks.request.mockResolvedValue(
      new Response(
        JSON.stringify({
          ...base,
          nome: 'Investidora fictícia',
          tipoInvestidor: 'anjo',
          segmentosInteresse: ['fintech'],
          estagiosInteresse: ['mvp'],
          modelosInteresse: ['b2b'],
          regioesInteresse: ['sul', 'centro_oeste'],
          tituloProfissional: 'Mentora',
          disponibilidade: 'meio_periodo',
          jaAtuouComStartups: true,
          numeroAproximadoInvestimentos: 4,
          areasAjuda: ['produto_tecnologia'],
          setoresAtuacao: ['edtech'],
          anosExperiencia: 5,
        }),
      ),
    );
    expect((await loadInvestorProfile())?.data).toMatchObject({
      title: 'Mentora',
      regions: ['south', 'central_west'],
      availability: 'meio_periodo',
      history: 'yes',
      exactInvestmentCount: 4,
      expertise: ['technology'],
      previousSectors: ['edtech'],
      experienceYears: 5,
    });
  });
});
