import { describe, expect, it } from 'vitest';
import { createInvestorDraft } from './investor';
import { investorCompleteness, statusContent } from './profile';

describe('painel do investidor', () => {
  it('calcula a completude com base nas informações existentes', () => {
    expect(investorCompleteness(createInvestorDraft()).percent).toBe(0);
    const data = {
      ...createInvestorDraft(),
      participation: 'mentor',
      history: 'undisclosed',
    };
    const result = investorCompleteness(data);
    expect(result.missing.some((item) => item.step === 'investment')).toBe(
      false,
    );
    expect(result.missing.some((item) => item.step === 'history')).toBe(false);
    expect(
      result.missing.some((item) => item.label === 'perfil de risco'),
    ).toBe(false);
  });
  it('conta uma resposta negativa sobre mentorias como preenchida', () => {
    const data = {
      ...createInvestorDraft(),
      frequency: 'weekly',
      interactions: ['online'],
      acceptsMentoring: false,
    };
    expect(
      investorCompleteness(data).missing.some(
        (item) => item.step === 'availability',
      ),
    ).toBe(false);
  });
  it('tem apresentação própria para cada estado de moderação', () => {
    expect(Object.keys(statusContent)).toHaveLength(5);
    expect(statusContent.changes_requested.title).toBe(
      'Precisamos de alguns ajustes',
    );
    expect(statusContent.approved.title).toBe('Perfil aprovado');
  });
});
