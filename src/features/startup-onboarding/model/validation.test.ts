import { describe, expect, it } from 'vitest';
import { createDraft, draftSchema } from './types';
import { normalizeUrl, validateAttachment, validateStep } from './validation';
import { buildSubmission, LEGAL_VERSION } from './submission';

describe('validação do cadastro', () => {
  it('migra regiões antigas sem ampliar a atuação de Pernambuco', () => {
    const data = draftSchema.parse({
      ...createDraft(),
      operatingRegions: ['pe'],
      targetRegions: ['brazil', 'northeast'],
      partnerRegions: ['other'],
    });
    expect(data.operatingRegions).toEqual([]);
    expect(data.partnerRegions).toEqual([]);
    expect(data.targetRegions).toHaveLength(5);
    expect(new Set(data.targetRegions).size).toBe(5);
  });
  it('aceita rascunho incompleto, mas exige nome e descrição para avançar', () => {
    const data = createDraft();
    expect(draftSchema.safeParse(data).success).toBe(true);
    expect(validateStep('about', data)).toHaveProperty('name');
    data.name = '  ';
    data.description = 'Uma startup';
    expect(validateStep('about', data)).toHaveProperty('name');
    data.name = 'Maré';
    data.description = 'a'.repeat(281);
    expect(validateStep('about', data)).toHaveProperty('description');
  });
  it('rejeita categorias fora do catálogo e categoria secundária repetida', () => {
    expect(
      draftSchema.safeParse({ ...createDraft(), segment: 'texto livre' })
        .success,
    ).toBe(false);
    expect(
      validateStep('business', {
        ...createDraft(),
        segment: 'fintech',
        stage: 'mvp',
        secondarySegments: ['fintech'],
      }),
    ).toHaveProperty('secondarySegments');
  });
  it('exige capital, finalidade e preferências de parceria', () => {
    const data = {
      ...createDraft(),
      seekingInvestment: 'yes',
      needs: ['mentoring'],
    };
    expect(validateStep('investment', data)).toHaveProperty('capital');
    expect(validateStep('investment', { ...data, capital: 0 })).toHaveProperty(
      'capital',
    );
    expect(
      validateStep('investment', { ...data, seekingInvestment: 'no' }),
    ).toHaveProperty('capital');
  });
  it('aceita zero clientes, recusa negativos e exige contexto para percentual', () => {
    const data = {
      ...createDraft(),
      revenue: 'none',
      teamSize: '1',
      exactTeamSize: 1,
      customers: 0,
    };
    expect(validateStep('traction', data)).toEqual({});
    expect(validateStep('traction', { ...data, customers: -1 })).toHaveProperty(
      'customers',
    );
    expect(
      validateStep('traction', { ...data, growthPercent: 12.5 }),
    ).toHaveProperty('growthPeriod');
    expect(
      validateStep('traction', { ...data, growthPercent: -101 }),
    ).toHaveProperty('growthPercent');
  });
  it('não obriga pitch ou consentimento opcional', () => {
    expect(validateStep('pitch', createDraft())).toEqual({});
    expect(
      validateStep('consent', {
        ...createDraft(),
        termsAccepted: true,
        privacyAcknowledged: true,
      }),
    ).toEqual({});
  });
  it('normaliza links e bloqueia protocolos executáveis', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com/');
    expect(() => normalizeUrl('javascript:alert(1)')).toThrow();
    expect(() => normalizeUrl('data:text/html,hello')).toThrow();
    expect(() => normalizeUrl('https://user:password@example.com')).toThrow();
  });
  it('valida extensão, tamanho e arquivos vazios', () => {
    expect(validateAttachment(new File(['pitch'], 'pitch.pdf'))).toBeNull();
    expect(validateAttachment(new File(['text'], 'pitch.exe'))).not.toBeNull();
    expect(validateAttachment(new File([], 'pitch.pdf'))).not.toBeNull();
    expect(
      validateAttachment(
        new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'pitch.pdf'),
      ),
    ).not.toBeNull();
  });
});

describe('contrato de integração', () => {
  it('preserva números e separa canvas, integrantes, pitch e consentimentos', () => {
    const data = {
      ...createDraft(),
      name: 'Maré',
      seekingInvestment: 'yes',
      capital: 500000,
      customers: 0,
      growthPercent: 12.5,
      growthPeriod: 'monthly',
      growthMetric: 'revenue',
      termsAccepted: true,
      privacyAcknowledged: true,
    };
    const payload = buildSubmission(
      data,
      null,
      '2026-09-10T12:00:00.000Z',
      null,
    );
    expect(payload.startup.investment.capitalBRL).toBe(500000);
    expect(payload.startup.traction.customers).toBe(0);
    expect(payload.startup.traction.growth?.percent).toBe(12.5);
    expect(payload.canvas).toHaveProperty('value');
    expect(payload.members).toEqual([]);
    expect(payload.status).toBe('draft');
    expect(payload.consents[0]).toMatchObject({
      accepted: true,
      version: LEGAL_VERSION,
      userId: null,
    });
  });
  it('não envia valores ocultos por respostas condicionais', () => {
    const data = {
      ...createDraft(),
      hideCustomers: true,
      customers: 25,
      seekingInvestment: 'no',
      capital: 500000,
      investmentPurposes: ['product'],
      partnerType: 'mentor',
      partnerStages: ['mvp'],
    };
    const payload = buildSubmission(
      data,
      'user-1',
      '2026-09-10T12:00:00Z',
      null,
    );
    expect(payload.startup.investment.capitalBRL).toBeNull();
    expect(payload.startup.investment.purposes).toEqual([]);
    expect(payload.startup.traction.customers).toBeNull();
    expect(payload.startup.partnerPreferences.stages).toEqual([]);
  });
});
