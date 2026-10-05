import { afterEach, describe, expect, it, vi } from 'vitest';
import { startupRepository, toDiscoveryStartup } from './api';
import { startupSchema } from '@/features/auth/services/profiles';
vi.mock('@/shared/services/api', () => ({ apiRequest: vi.fn() }));
import { apiRequest } from '@/shared/services/api';
const record = {
  id: 'approved-one',
  nomeFantasia: 'Startup real',
  segmento: 'agtech',
  estagio: 'validacao',
  modeloNegocio: 'b2b',
  statusModeracao: 'aprovado',
  atualizadoEm: '2026-10-05T12:00:00Z',
  criadoEm: '2026-10-01T12:00:00Z',
  logoUrl: 'https://example.com/logo.png',
  apresentacaoUrl: 'https://example.com/pitch.pdf',
  estado: 'PE',
  cidade: 'Recife',
  regioesAtuacao: ['nordeste', 'sudeste'],
  capitalProcurado: '150000.00',
  numeroClientes: 0,
  faturamentoMensal: '0.00',
  tamanhoEquipe: 3,
  buscaInvestimento: true,
  necessidadesAdicionais: ['mentoria'],
  canvasJson: {
    problema: 'Problema real',
    solucao: 'Solução real',
    value: 'Proposta real',
  },
};
afterEach(() => vi.restoreAllMocks());
describe('descoberta de startups aprovadas', () => {
  it('converte os dados persistidos preservando uploads, números e Canvas', () => {
    const startup = toDiscoveryStartup(
      { ...startupSchema.parse(record), criadoEm: record.criadoEm },
      'mapper-user',
    );
    expect(startup).toMatchObject({
      id: record.id,
      name: 'Startup real',
      logoUrl: record.logoUrl,
      presentationUrl: record.apresentacaoUrl,
      segment: 'Agtech',
      stage: 'Validação',
      investmentAmount: 150000,
      metrics: { clients: 0, revenue: 0 },
      problem: 'Problema real',
      solution: 'Solução real',
      needs: ['Mentoria'],
    });
    expect(startup.location.region).toBe('Nordeste · Sudeste');
    expect(startup.compatibility).toBeGreaterThanOrEqual(0);
    expect(startup.compatibility).toBeLessThanOrEqual(100);
    expect(
      toDiscoveryStartup(
        { ...startupSchema.parse(record), criadoEm: record.criadoEm },
        'mapper-user',
      ).compatibility,
    ).toBe(startup.compatibility);
  });
  it('não mostra pendentes, rejeitadas ou suspensas mesmo que uma API antiga as devolva', async () => {
    vi.mocked(apiRequest).mockResolvedValue(
      new Response(
        JSON.stringify([
          record,
          ...['pendente', 'rejeitado', 'suspenso'].map((status) => ({
            ...record,
            id: status,
            statusModeracao: status,
          })),
        ]),
      ),
    );
    const rows = await startupRepository.list({
      id: 'user',
      nome: 'Investidor',
      email: 'investor@example.com',
      tipoPerfil: 'investidor',
    });
    expect(rows.map((r) => r.id)).toEqual([record.id]);
  });
  it('retorna vazio sem substituição por registros demonstrativos', async () => {
    vi.mocked(apiRequest).mockResolvedValue(new Response('[]'));
    expect(
      await startupRepository.list({
        id: 'user',
        nome: 'Investidor',
        email: 'investor@example.com',
        tipoPerfil: 'investidor',
      }),
    ).toEqual([]);
  });
});
