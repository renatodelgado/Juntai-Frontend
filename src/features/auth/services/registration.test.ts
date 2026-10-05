import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDraft } from '@/features/startup-onboarding/model/types';
import { createInvestorDraft } from '@/features/investor-onboarding/model/investor';
import {
  startupPayload,
  investorPayload,
  registerRemote,
} from './registration';

const startup = {
  ...createDraft(),
  name: 'TechFlow',
  segment: 'fintech',
  stage: 'ideation',
  businessModels: ['b2b'],
  targetMarket: 'Pequenas empresas',
  customers: 12,
  revenue: 'up_to_10k',
  teamSize: '2_5',
  seekingInvestment: 'yes',
  capital: 200000,
  investmentPurposes: ['hiring'],
  problem: 'Gestão manual',
  solution: 'App',
};
const details = {
  ownerName: 'João Souza',
  region: 'recife',
  primaryModel: '',
  monthlyRevenue: 8000,
  teamSize: 4,
};
const investor = {
  ...createInvestorDraft(),
  name: 'Maria Silva',
  participation: 'both',
  ticketMin: 10000,
  ticketMax: 100000,
  risk: 'moderate',
  segments: ['fintech', 'healthtech'],
  stages: ['ideation', 'early_traction'],
  regions: ['northeast'],
  businessModels: ['b2b', 'b2c'],
};

afterEach(() => vi.unstubAllGlobals());
describe('cadastro na API', () => {
  it('envia as novas colunas de startup com crescimento contextualizado e regiões atuais', () => {
    const payload = startupPayload(
      {
        ...startup,
        description: 'Gestão financeira',
        logoUrl: 'https://techflow.example.com/logo.png',
        website: 'techflow.example.com',
        linkedin: 'https://linkedin.com/company/techflow',
        state: 'PE',
        cityName: 'Recife',
        operatingRegions: ['northeast'],
        targetRegions: ['south', 'southeast'],
        secondarySegments: ['edtech'],
        growthPercent: 12.5,
        growthMetric: 'revenue',
        growthPeriod: 'six_months',
        growthNotes: 'Receita recorrente',
        needs: ['mentoring', 'partnerships'],
      },
      'joao@teste.com',
      '123456',
      details,
    );
    expect(payload).toMatchObject({
      descricaoCurta: 'Gestão financeira',
      logoUrl: 'https://techflow.example.com/logo.png',
      siteUrl: 'https://techflow.example.com/',
      estado: 'PE',
      cidade: 'Recife',
      segmentosSecundarios: ['edtech'],
      regioesAtuacao: ['nordeste'],
      regioesCrescimento: ['sul', 'sudeste'],
      taxaCrescimentoPct: 12.5,
      metricaCrescimento: 'receita',
      periodoComparacaoCrescimento: 'ultimos_6_meses',
      descricaoEvolucao: 'Receita recorrente',
      buscaInvestimento: true,
      necessidadesAdicionais: ['mentoria', 'parcerias_estrategicas'],
    });
    expect(payload).not.toHaveProperty('regiao');
  });
  it('envia apresentação e experiência sem inferir quantidades ou disponibilidade', () => {
    const payload = investorPayload(
      {
        ...investor,
        title: 'Mentora de produto',
        state: 'CE',
        cityName: 'Fortaleza',
        history: 'yes',
        investmentCount: 'two_five',
        exactInvestmentCount: 4,
        experience: 'Apoio a empresas',
        previousSectors: ['edtech'],
        expertise: ['technology', 'product', 'sales'],
        availability: 'algumas_horas_semana',
        regions: ['south'],
      },
      'maria@teste.com',
      '123456',
      5,
    );
    expect(payload).toMatchObject({
      tituloProfissional: 'Mentora de produto',
      estado: 'CE',
      cidade: 'Fortaleza',
      jaAtuouComStartups: true,
      numeroAproximadoInvestimentos: 4,
      descricaoExperiencia: 'Apoio a empresas',
      setoresAtuacao: ['edtech'],
      areasAjuda: ['produto_tecnologia', 'vendas_marketing'],
      disponibilidade: 'algumas_horas_semana',
      regioesInteresse: ['sul'],
    });
    const undisclosed = investorPayload(
      {
        ...investor,
        history: 'undisclosed',
        frequency: 'weekly',
        investmentCount: 'two_five',
      },
      'maria@teste.com',
      '123456',
      null,
    );
    expect(undisclosed).not.toHaveProperty('jaAtuouComStartups');
    expect(undisclosed).not.toHaveProperty('disponibilidade');
    expect(undisclosed).not.toHaveProperty('numeroAproximadoInvestimentos');
  });
  it('separa responsável da startup e envia valores exatos e enums do backend', () => {
    const payload = startupPayload(
      startup,
      ' JOAO@teste.com ',
      '123456',
      details,
    );
    expect(payload).toMatchObject({
      nome: 'João Souza',
      nomeFantasia: 'TechFlow',
      email: 'joao@teste.com',
      estagio: 'ideacao',
      numeroClientes: 12,
      faturamentoMensal: 8000,
      tamanhoEquipe: 4,
      capitalProcurado: 200000,
      canvasJson: { problema: 'Gestão manual', solucao: 'App' },
    });
    expect(payload).not.toHaveProperty('logo');
    expect(payload).not.toHaveProperty('consents');
  });
  it('não inventa valores a partir de faixas nem envia métricas sem contexto', () => {
    const payload = startupPayload(
      { ...startup, customers: null, growthPercent: 15 },
      'joao@teste.com',
      '123456',
      { ...details, monthlyRevenue: null, teamSize: null },
    );
    expect(payload).not.toHaveProperty('numeroClientes');
    expect(payload).not.toHaveProperty('faturamentoMensal');
    expect(payload).not.toHaveProperty('tamanhoEquipe');
    expect(payload).not.toHaveProperty('taxaCrescimentoPct');
  });
  it('respeita não divulgação e valores zero', () => {
    expect(
      startupPayload(
        { ...startup, monthlyRevenue: null, seekingInvestment: 'no' },
        'joao@teste.com',
        '123456',
        details,
      ),
    ).toHaveProperty('faturamentoMensal', 8000);
    expect(
      startupPayload(
        { ...startup, customers: 0, revenue: 'none', seekingInvestment: 'no' },
        'joao@teste.com',
        '123456',
        { ...details, monthlyRevenue: 0 },
      ),
    ).toMatchObject({
      numeroClientes: 0,
      faturamentoMensal: 0,
      capitalProcurado: 0,
    });
  });
  it('exige escolha explícita do modelo principal e rejeita números inválidos', () => {
    expect(() =>
      startupPayload(
        { ...startup, businessModels: ['b2b', 'b2c'] },
        'joao@teste.com',
        '123456',
        details,
      ),
    ).toThrow('modelo principal');
    expect(() =>
      startupPayload(startup, 'joao@teste.com', '123456', {
        ...details,
        teamSize: 4.5,
      }),
    ).toThrow();
    expect(() =>
      startupPayload(startup, 'joao@teste.com', '123456', {
        ...details,
        monthlyRevenue: -1,
      }),
    ).toThrow();
  });
  it('mapeia investidor + mentor e não converte texto de experiência em anos', () => {
    expect(
      investorPayload(investor, 'maria@teste.com', '123456', 5),
    ).toMatchObject({
      tipoInvestidor: 'anjo_mentor',
      perfilRisco: 'moderado',
      anosExperiencia: 5,
      estagiosInteresse: ['ideacao', 'tracao'],
      regioesInteresse: ['nordeste'],
    });
    expect(
      investorPayload(investor, 'maria@teste.com', '123456', null),
    ).not.toHaveProperty('anosExperiencia');
  });
  it('mentor não envia tickets ou risco antigos do rascunho', () => {
    const payload = investorPayload(
      { ...investor, participation: 'mentor' },
      'maria@teste.com',
      '123456',
      null,
    );
    expect(payload.tipoInvestidor).toBe('mentor');
    expect(payload).not.toHaveProperty('ticketMinimo');
    expect(payload).not.toHaveProperty('ticketMaximo');
    expect(payload).not.toHaveProperty('perfilRisco');
  });
  it('não reduz regiões ou segmentos silenciosamente', () => {
    expect(() =>
      investorPayload(
        { ...investor, regions: ['international'] },
        'maria@teste.com',
        '123456',
        null,
      ),
    ).toThrow('Regiões');
    expect(() =>
      investorPayload(
        { ...investor, segments: ['saas'] },
        'maria@teste.com',
        '123456',
        null,
      ),
    ).toThrow('Segmentos');
    expect(
      investorPayload(
        {
          ...investor,
          regions: ['north', 'northeast', 'central_west', 'southeast', 'south'],
        },
        'maria@teste.com',
        '123456',
        null,
      ).regioesInteresse,
    ).toEqual(['norte', 'nordeste', 'centro_oeste', 'sudeste', 'sul']);
  });
  it('envia POST JSON e não trata erro HTTP como sucesso', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 201 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'E-mail já cadastrado.' }), {
          status: 400,
        }),
      );
    vi.stubGlobal('fetch', fetch);
    const payload = investorPayload(
      investor,
      'maria@teste.com',
      '123456',
      null,
    );
    await registerRemote('investidores', payload);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/investidores$/),
      {
        method: 'POST',
        headers: expect.any(Headers),
        body: JSON.stringify(payload),
      },
    );
    expect(
      new Headers(fetch.mock.calls[0]![1].headers).get('Content-Type'),
    ).toBe('application/json');
    await expect(registerRemote('investidores', payload)).rejects.toThrow(
      'E-mail já cadastrado',
    );
  });
  it('propaga falha de rede sem repetir o POST', async () => {
    const fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    vi.stubGlobal('fetch', fetch);
    await expect(
      registerRemote(
        'startups',
        startupPayload(startup, 'joao@teste.com', '123456', details),
      ),
    ).rejects.toThrow();
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
