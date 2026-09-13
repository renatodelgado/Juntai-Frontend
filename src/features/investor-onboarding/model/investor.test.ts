import { describe, expect, it } from 'vitest';
import {
  createInvestorDraft,
  validateInvestor,
  investorSchema,
  investorSubmission,
} from './investor';

describe('cadastro de investidor e mentor', () => {
  it('dispensa ticket e risco para mentor', () => {
    const data = {
      ...createInvestorDraft(),
      participation: 'mentor',
      expertise: ['technology'],
    };
    expect(validateInvestor('investment', data)).toEqual({});
    expect(validateInvestor('experience', data)).toEqual({});
    expect(investorSubmission(data).investment).toBeNull();
  });
  it('exige ticket e rejeita máximo abaixo do mínimo', () => {
    const data = { ...createInvestorDraft(), participation: 'investor' };
    expect(validateInvestor('investment', data)).toHaveProperty('ticketMin');
    data.ticketMin = 500000;
    data.ticketMax = 50000;
    expect(validateInvestor('investment', data)).toHaveProperty('ticketMax');
  });
  it('mantém tipos numéricos e não aceita categorias livres', () => {
    const data = {
      ...createInvestorDraft(),
      participation: 'both',
      ticketMin: 50000,
      ticketMax: 500000,
      segments: ['fintech'],
    };
    expect(investorSchema.safeParse(data).success).toBe(true);
    expect(
      investorSchema.safeParse({ ...data, segments: ['categoria inventada'] })
        .success,
    ).toBe(false);
    expect(investorSubmission(data).roles).toEqual(['investor', 'mentor']);
    expect(investorSubmission(data).investment?.ticketMin).toBe(50000);
  });
  it('aceita resposta negativa para mentoria e exige consentimentos separados', () => {
    const data = {
      ...createInvestorDraft(),
      participation: 'mentor',
      acceptsMentoring: false,
      frequency: 'weekly',
      interactions: ['online'],
    };
    expect(validateInvestor('availability', data)).toEqual({});
    expect(Object.keys(validateInvestor('consent', data))).toEqual([
      'termsAccepted',
      'privacyAcknowledged',
    ]);
  });
});
