import { describe, expect, it } from 'vitest';
import { completionItems, moderation, type Dashboard } from './dashboard';

describe('dados reais do painel', () => {
  it('só libera o estado aprovado explicitamente', () => {
    expect(moderation('aprovado').approved).toBe(true);
    for (const status of [
      'pendente',
      'rejeitado',
      'suspenso',
      'desconhecido',
      '',
    ]) {
      expect(moderation(status).approved).toBe(false);
    }
  });
  it('não exige faixa de investimento para mentor', () => {
    const data: Dashboard = {
      role: 'investidor',
      profile: {
        id: '1',
        atualizadoEm: '',
        statusModeracao: 'pendente',
        nome: 'Mentora',
        tipoInvestidor: 'mentor',
        segmentosInteresse: [],
        estagiosInteresse: [],
        regioesInteresse: [],
        modelosInteresse: [],
        anosExperiencia: 0,
      },
    };
    const items = completionItems(data);
    expect(items.some((item) => item.label === 'Faixa de investimento')).toBe(
      false,
    );
    expect(items.find((item) => item.label === 'Experiência')?.filled).toBe(
      true,
    );
  });
  it('calcula faltas de pitch e equipe sem inventar dados', () => {
    const data: Dashboard = {
      role: 'startup',
      profile: {
        id: '1',
        atualizadoEm: '',
        statusModeracao: 'pendente',
        nomeFantasia: 'Startup',
        segmento: 'fintech',
        estagio: 'mvp',
        regiao: 'recife',
        modeloNegocio: 'b2b',
        capitalProcurado: 0,
      },
    };
    const items = completionItems(data);
    expect(
      items.find((item) => item.label === 'Objetivo de investimento')?.filled,
    ).toBe(true);
    expect(items.find((item) => item.label === 'Pitch')?.filled).toBe(false);
    expect(
      items.find((item) => item.label === 'Tamanho da equipe')?.filled,
    ).toBe(false);
    expect(
      items.find((item) => item.label === 'Informações da startup')?.filled,
    ).toBe(false);
    Object.assign(data.profile, {
      estado: 'PE',
      cidade: 'Recife',
      regioesAtuacao: ['nordeste'],
    });
    expect(
      completionItems(data).find(
        (item) => item.label === 'Informações da startup',
      )?.filled,
    ).toBe(true);
  });
});
