import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadProfile, loadInvestorProfile, startupSchema } from './profiles';

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  session: vi.fn(),
  request: vi.fn(),
}));
vi.mock('idb-keyval', () => ({ get: mocks.get, set: vi.fn() }));
vi.mock('./session', () => ({ getSession: mocks.session, logout: vi.fn() }));
vi.mock('@/shared/services/api', () => ({ apiRequest: mocks.request }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.get.mockResolvedValue(undefined);
});
const base = {
  id: 'perfil-ficticio',
  atualizadoEm: '2026-10-03T12:00:00Z',
  statusModeracao: 'pendente',
};
describe('perfil com as novas colunas', () => {
  it('lê startup sem a antiga região e preserva apresentação e crescimento', async () => {
    mocks.session.mockReturnValue({
      token: 'sessao-ficticia',
      usuario: { id: 'usuario', tipoPerfil: 'startup' },
    });
    const remote = startupSchema.parse({
      ...base,
      nomeFantasia: 'TechFlow',
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
