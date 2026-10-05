import { describe, expect, it } from 'vitest';
import { createDraft } from '../../startup-onboarding/model/types';
import { profileCompleteness, safeLink } from './profile';

describe('perfil provisório', () => {
  it('campos básicos preenchidos não ocultam apresentação, localização e Canvas pendentes', () => {
    const data = createDraft();
    Object.assign(data, {
      name: 'Startup',
      segment: 'fintech',
      stage: 'mvp',
      businessModels: ['b2b'],
      targetMarket: 'Empresas',
      solution: 'Uma plataforma',
      capital: 250000,
      pitchText: 'Nosso pitch',
      exactTeamSize: 4,
      customers: 12,
      registrationRegion: 'recife',
    });
    const result = profileCompleteness(data, null);
    expect(result.percent).toBeLessThan(100);
    expect(result.missing.map((item) => item.label)).toEqual(
      expect.arrayContaining(['Apresentação', 'Localização', 'Canvas']),
    );
    expect(result.missing.every((item) => !!item.step)).toBe(true);
  });
  it('não inventa completude para um perfil vazio', () => {
    const result = profileCompleteness(createDraft(), null);
    expect(result.percent).toBe(0);
    expect(result.missing).toHaveLength(9);
  });

  it('reconhece faturamento zero informado sem exigir campos antigos de parceiro', () => {
    const data = createDraft();
    data.monthlyRevenue = 0;
    const result = profileCompleteness(data, null);
    expect(result.missing.some((section) => section.label === 'Tração')).toBe(
      false,
    );
    expect(
      result.sections.some((section) => section.label === 'Parceiros'),
    ).toBe(false);
  });

  it('permite apenas links web e normaliza endereços sem protocolo', () => {
    expect(safeLink('javascript:alert(1)')).toBeNull();
    expect(safeLink('data:text/html,teste')).toBeNull();
    expect(safeLink('')).toBeNull();
    expect(safeLink('juntai.com.br')).toBe('https://juntai.com.br/');
  });
});
