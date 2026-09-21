import { describe, expect, it } from 'vitest';
import { createDraft } from '../../startup-onboarding/model/types';
import { profileCompleteness, safeLink } from './profile';

describe('perfil provisório', () => {
  it('não inventa completude para um perfil vazio', () => {
    const result = profileCompleteness(createDraft(), null);
    expect(result.percent).toBe(0);
    expect(result.missing).toHaveLength(10);
  });

  it('respeita a escolha de não divulgar clientes', () => {
    const data = createDraft();
    data.hideCustomers = true;
    const result = profileCompleteness(data, null);
    expect(result.missing.some((section) => section.label === 'Tração')).toBe(
      false,
    );
  });

  it('permite apenas links web e normaliza endereços sem protocolo', () => {
    expect(safeLink('javascript:alert(1)')).toBeNull();
    expect(safeLink('data:text/html,teste')).toBeNull();
    expect(safeLink('')).toBeNull();
    expect(safeLink('juntai.com.br')).toBe('https://juntai.com.br/');
  });
});
